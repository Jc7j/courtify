import dayjs from 'dayjs'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Stripe from 'stripe'

import { ConfirmationEmail } from '@/features/booking/components/confirmation-email'
import { GuestDetailsType } from '@/features/booking/types'

import { stripe } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'
import { BookingStatus, PaymentStatus, ProductType } from '@/shared/types/graphql'

export const maxDuration = 30 // seconds

export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const dynamic = 'force-dynamic'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
const resend = new Resend(process.env.RESEND_API_KEY)

// end_time: paymentIntent.metadata.endTime, // Add this in if we want to test failures ONLY ON LOCAL DEVELOPMENT
async function createBooking(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent,
  facilityId: string,
  status: BookingStatus,
  paymentStatus: PaymentStatus
) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      facility_id: facilityId,
      court_number: parseInt(paymentIntent.metadata.courtNumber),
      start_time: paymentIntent.metadata.startTime,
      customer_email: paymentIntent.metadata.customerEmail,
      customer_name: paymentIntent.metadata.customerName,
      customer_phone: paymentIntent.metadata.customerPhone,
      stripe_payment_intent_id: paymentIntent.id,
      amount_total: paymentIntent.amount,
      amount_paid: status === BookingStatus.Confirmed ? paymentIntent.amount : null,
      status,
      payment_status: paymentStatus,
      metadata: {
        payment_details: {
          payment_method: paymentIntent.payment_method_types[0],
          payment_date: new Date().toISOString(),
          stripe_status: paymentIntent.status,
          payment_intent_id: paymentIntent.id,
        },
        products: {
          court_rental: {
            id: paymentIntent.metadata.courtProductId,
            name: paymentIntent.metadata.courtProductName,
            price_amount: parseInt(paymentIntent.metadata.courtProductPrice),
            type: 'court_rental',
          },
          equipment: JSON.parse(paymentIntent.metadata.equipmentProducts || '[]'),
        },
        customer_preferences: {
          net_height: paymentIntent.metadata.netHeight,
        },
        court_details: {
          court_number: parseInt(paymentIntent.metadata.courtNumber),
          start_time: paymentIntent.metadata.startTime,
          end_time: paymentIntent.metadata.endTime,
          duration_hours: paymentIntent.metadata.durationInHours,
        },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating booking:', error)
    throw new Error('Failed to create booking')
  }

  return booking
}

async function handlePaymentSuccess(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent,
  facilityId: string
) {
  const booking = await createBooking(
    supabase,
    paymentIntent,
    facilityId,
    BookingStatus.Confirmed,
    PaymentStatus.Paid
  )

  const { error: courtError } = await supabase
    .from('court_availabilities')
    .update({
      status: 'booked',
      updated_at: new Date().toISOString(),
    })
    .eq('facility_id', facilityId)
    .eq('court_number', parseInt(paymentIntent.metadata.courtNumber))
    .eq('start_time', paymentIntent.metadata.startTime)

  if (courtError) {
    console.error('❌ Error updating court availability:', courtError)
    throw new Error('Failed to update court availability')
  }

  try {
    const { data: facility } = await supabase
      .from('facilities')
      .select('name, address')
      .eq('id', facilityId)
      .single()

    await resend.emails.send({
      from: `${facility.name} <bookings@courtify.app>`,
      to: [paymentIntent.metadata.customerEmail],
      subject: 'Reservation Confirmation',
      react: ConfirmationEmail({
        booking: {
          date: dayjs(paymentIntent.metadata.startTime).format('dddd, MMMM D, YYYY'),
          time: `${dayjs(paymentIntent.metadata.startTime).format('h:mm A')} - ${dayjs(
            paymentIntent.metadata.endTime
          ).format('h:mm A')}`,
          duration: parseFloat(paymentIntent.metadata.durationInHours),
          facilityId,
          guestInfo: {
            name: paymentIntent.metadata.customerName,
            email: paymentIntent.metadata.customerEmail,
            phone: paymentIntent.metadata.customerPhone,
            net_height: paymentIntent.metadata.netHeight as GuestDetailsType['net_height'],
            selectedCourtProduct: {
              id: paymentIntent.metadata.courtProductId,
              name: paymentIntent.metadata.courtProductName,
              price_amount: parseInt(paymentIntent.metadata.courtProductPrice),
              type: ProductType.CourtRental,
            },
            selectedEquipment: JSON.parse(paymentIntent.metadata.equipmentProducts || '[]'),
          },
          amount: paymentIntent.amount,
        },
        facility: {
          name: facility.name,
          address: facility.address || '',
        },
      }),
    })
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }

  return booking
}

async function handlePaymentFailure(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent,
  facilityId: string
) {
  await createBooking(
    supabase,
    paymentIntent,
    facilityId,
    BookingStatus.Cancelled,
    PaymentStatus.Failed
  )

  const { error: courtError } = await supabase
    .from('court_availabilities')
    .update({
      status: 'available',
      updated_at: new Date().toISOString(),
    })
    .eq('facility_id', facilityId)
    .eq('court_number', parseInt(paymentIntent.metadata.courtNumber))
    .eq('start_time', paymentIntent.metadata.startTime)

  if (courtError) {
    console.error('❌ Error releasing court:', courtError)
    throw new Error('Failed to release court')
  }
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
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    )
  }

  const supabaseAdmin = createAdminClient()

  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const facilityId = paymentIntent.metadata.facilityId

    if (!facilityId) {
      throw new Error('Missing facility ID')
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(supabaseAdmin, paymentIntent, facilityId)
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(supabaseAdmin, paymentIntent, facilityId)
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })

      case 'payment_intent.processing':
        await createBooking(
          supabaseAdmin,
          paymentIntent,
          facilityId,
          BookingStatus.Pending,
          PaymentStatus.Processing
        )
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })

      default:
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
    }
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
