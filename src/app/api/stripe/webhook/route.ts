import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { BookingStatus, PaymentStatus } from '@/types/graphql'
import { stripe } from '@/lib/stripe/stripe'
import Stripe from 'stripe'

export const maxDuration = 30 // seconds

export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const dynamic = 'force-dynamic'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

async function getExistingBookingMetadata(supabase: any, paymentIntentId: string) {
  console.log('🔍 Fetching booking metadata for payment intent:', paymentIntentId)

  const { data: existingBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('metadata')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (fetchError) {
    console.error('❌ Error fetching booking metadata:', {
      error: fetchError,
      paymentIntentId,
    })
    throw new Error(`Failed to fetch booking metadata: ${fetchError.message}`)
  }

  if (!existingBooking) {
    console.error('❌ No booking found for payment intent:', paymentIntentId)
    throw new Error('Booking not found')
  }

  if (typeof existingBooking.metadata === 'string') {
    try {
      return JSON.parse(existingBooking.metadata)
    } catch (err) {
      console.error('❌ Error parsing metadata string:', existingBooking.metadata)
      return {}
    }
  }

  return existingBooking.metadata || {}
}

async function updateBooking(supabase: any, paymentIntentId: string, updateData: any) {
  console.log('📝 Updating booking for payment intent:', paymentIntentId, updateData)

  const dataToUpdate = {
    ...updateData,
    metadata:
      typeof updateData.metadata === 'string'
        ? updateData.metadata
        : JSON.stringify(updateData.metadata),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(dataToUpdate)
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error updating booking:', {
      error,
      paymentIntentId,
      updateData: dataToUpdate,
    })
    throw new Error(`Failed to update booking: ${error.message}`)
  }

  console.log('✅ Successfully updated booking:', data)
  return data
}

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
        console.log('💰 Processing successful payment:', paymentIntent.id)

        const existingMetadata = await getExistingBookingMetadata(supabaseAdmin, paymentIntent.id)

        const updatedMetadata = {
          ...existingMetadata,
          payment_details: {
            payment_method: paymentIntent.payment_method_types[0],
            payment_date: new Date().toISOString(),
            stripe_status: paymentIntent.status,
            payment_intent_id: paymentIntent.id,
            event_type: 'payment_intent.succeeded',
          },
        }

        await updateBooking(supabaseAdmin, paymentIntent.id, {
          status: BookingStatus.Confirmed,
          payment_status: PaymentStatus.Paid,
          amount_paid: paymentIntent.amount,
          amount_total: paymentIntent.amount,
          metadata: updatedMetadata,
        })
        break
      }

      case 'payment_intent.processing': {
        const existingMetadata = await getExistingBookingMetadata(supabaseAdmin, paymentIntent.id)

        const updatedMetadata = {
          ...existingMetadata,
          payment_attempt: {
            attempted_at: new Date().toISOString(),
            status: 'processing',
          },
        }

        await updateBooking(supabaseAdmin, paymentIntent.id, {
          status: BookingStatus.Pending,
          payment_status: PaymentStatus.Processing,
          metadata: JSON.stringify(updatedMetadata),
        })
        break
      }

      case 'payment_intent.payment_failed': {
        console.log('❌ Processing failed payment:', paymentIntent.id)

        // First update the booking status
        const existingMetadata = await getExistingBookingMetadata(supabaseAdmin, paymentIntent.id)

        const updatedMetadata = {
          ...existingMetadata,
          failure_details: {
            failure_code: paymentIntent.last_payment_error?.code,
            failure_message: paymentIntent.last_payment_error?.message,
            failed_at: new Date().toISOString(),
            payment_intent_id: paymentIntent.id,
            event_type: 'payment_intent.payment_failed',
          },
        }

        const updatedBooking = await updateBooking(supabaseAdmin, paymentIntent.id, {
          status: BookingStatus.Cancelled,
          payment_status: PaymentStatus.Failed,
          metadata: JSON.stringify(updatedMetadata),
        })

        // Then release the court availability
        console.log('🎾 Releasing court for failed booking:', updatedBooking)

        const { error: courtError } = await supabaseAdmin
          .from('court_availabilities')
          .update({
            status: 'available',
            updated_at: new Date().toISOString(),
          })
          .eq('company_id', updatedBooking.company_id)
          .eq('court_number', updatedBooking.court_number)
          .eq('start_time', updatedBooking.start_time)

        if (courtError) {
          console.error('❌ Error releasing court:', {
            error: courtError,
            booking: updatedBooking,
          })
          throw new Error(`Failed to release court: ${courtError.message}`)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
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
