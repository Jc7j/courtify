import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { BookingStatus, PaymentStatus } from '@/types/graphql'
import { stripe } from '@/lib/stripe/stripe'
import Stripe from 'stripe'

// Extend the timeout for webhook processing
export const maxDuration = 30 // seconds

// Configure the runtime
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const dynamic = 'force-dynamic'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headerList = await headers()
  const signature = headerList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return new NextResponse(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const supabaseAdmin = createAdminClient()

  try {
    console.log('event.data.object:', JSON.stringify(event.data.object, null, 2))
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const companyId = paymentIntent.metadata.companyId

    if (!companyId) {
      console.error('❌ No company ID in payment intent metadata')
      return new NextResponse(JSON.stringify({ error: 'Missing company ID' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const { error } = await supabaseAdmin
          .from('bookings')
          .update({
            status: BookingStatus.Confirmed,
            payment_status: PaymentStatus.Paid,
            amount_paid: paymentIntent.amount,
            amount_total: paymentIntent.amount,
            updated_at: new Date().toISOString(),
            metadata: JSON.stringify({
              ...paymentIntent.metadata,
              payment_details: {
                payment_method: paymentIntent.payment_method_types[0],
                payment_date: new Date().toISOString(),
                stripe_status: paymentIntent.status,
              },
            }),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
          console.error('❌ Error updating booking:', error)
          throw new Error('Failed to update booking')
        }
        break
      }

      case 'payment_intent.processing': {
        const { error } = await supabaseAdmin
          .from('bookings')
          .update({
            status: BookingStatus.Pending,
            payment_status: PaymentStatus.Processing,
            updated_at: new Date().toISOString(),
            metadata: JSON.stringify({
              ...paymentIntent.metadata,
              payment_attempt: {
                attempted_at: new Date().toISOString(),
              },
            }),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
          console.error('❌ Error updating booking to processing:', error)
          throw new Error('Failed to update booking')
        }
        break
      }

      case 'payment_intent.payment_failed': {
        // Update booking status
        const { error: bookingError } = await supabaseAdmin
          .from('bookings')
          .update({
            status: BookingStatus.Cancelled,
            payment_status: PaymentStatus.Failed,
            updated_at: new Date().toISOString(),
            metadata: JSON.stringify({
              ...paymentIntent.metadata,
              failure_details: {
                failure_code: paymentIntent.last_payment_error?.code,
                failure_message: paymentIntent.last_payment_error?.message,
                failed_at: new Date().toISOString(),
              },
            }),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (bookingError) {
          console.error('❌ Error updating failed booking:', bookingError)
          throw new Error('Failed to update booking')
        }

        // Get booking details
        const { data: booking, error: fetchError } = await supabaseAdmin
          .from('bookings')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (fetchError || !booking) {
          console.error('❌ Error fetching booking:', fetchError)
          throw new Error('Failed to fetch booking')
        }

        // Release court availability
        const { error: courtError } = await supabaseAdmin
          .from('court_availabilities')
          .update({
            status: 'available',
            updated_at: new Date().toISOString(),
          })
          .eq('company_id', booking.company_id)
          .eq('court_number', booking.court_number)
          .eq('start_time', booking.start_time)

        if (courtError) {
          console.error('❌ Error releasing court:', courtError)
          throw new Error('Failed to release court')
        }
        break
      }
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    console.error('❌ Error processing webhook:', err)
    return new NextResponse(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Webhook handler failed',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
