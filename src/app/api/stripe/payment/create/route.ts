import dayjs from 'dayjs'
import { NextResponse } from 'next/server'

import { stripe } from '@/shared/lib/stripe/stripe'

import type { CreatePaymentIntentInput } from '@/features/booking/types'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePaymentIntentInput
    const stripeAccountId = req.headers.get('X-Stripe-Account')

    // Basic validation
    if (!body.facilityId || !body.courtNumber || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!stripeAccountId) {
      return NextResponse.json({ error: 'Facility not setup for payments' }, { status: 400 })
    }

    // Time validation
    const startTime = dayjs(body.startTime)
    const endTime = dayjs(body.endTime)
    const now = dayjs()

    if (startTime.isBefore(now) || endTime.isBefore(startTime)) {
      return NextResponse.json({ error: 'Invalid booking time' }, { status: 400 })
    }

    // Calculate amount
    const durationInHours = endTime.diff(startTime, 'hour', true)
    const amount = body.selectedProducts.equipmentProducts.reduce(
      (sum, product) => sum + product.price_amount,
      Math.round(body.selectedProducts.courtProduct.price_amount * durationInHours)
    )

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          facilityId: body.facilityId,
          courtNumber: body.courtNumber,
          startTime: body.startTime,
          endTime: body.endTime,
          bookingDuration: `${durationInHours} hours`,
          customerEmail: body.guestInfo.email,
          customerName: body.guestInfo.name,
          customerPhone: body.guestInfo.phone,
          netHeight: body.guestInfo.net_height,
          courtProduct: JSON.stringify({
            id: body.selectedProducts.courtProduct.id,
            name: body.selectedProducts.courtProduct.name,
            price: body.selectedProducts.courtProduct.price_amount,
          }),
          equipmentProducts: JSON.stringify(
            body.selectedProducts.equipmentProducts.map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price_amount,
            }))
          ),
        },
      },
      {
        stripeAccount: stripeAccountId,
      }
    )

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    })
  } catch (error) {
    console.error('[stripe/create-payment-intent] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
