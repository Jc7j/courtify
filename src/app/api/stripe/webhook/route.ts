import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { BookingStatus, PaymentStatus } from '@/types/graphql'
import { stripe } from '@/lib/stripe/stripe'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

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
              },
            }),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
          console.error('❌ Error updating booking:', error)
          return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
        }
        break
      }

      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

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
          return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

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
          return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
        }

        const { data: booking, error: fetchError } = await supabaseAdmin
          .from('bookings')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (fetchError || !booking) {
          console.error('❌ Error fetching booking:', fetchError)
          return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
        }

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
          return NextResponse.json({ error: 'Failed to release court' }, { status: 500 })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('❌ Error processing webhook:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

export const runtime = 'edge'
