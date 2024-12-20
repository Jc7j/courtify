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

    // Create payment intent with flattened metadata for Stripe
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          // Flat structure for Stripe webhook processing
          facilityId: body.facilityId,
          courtNumber: body.courtNumber.toString(),
          startTime: body.startTime,
          endTime: body.endTime,
          durationInHours: `${durationInHours}`,
          customerEmail: body.guestInfo.email,
          customerName: body.guestInfo.name,
          customerPhone: body.guestInfo.phone,
          netHeight: body.guestInfo.net_height,
          courtProductId: body.selectedProducts.courtProduct.id,
          courtProductName: body.selectedProducts.courtProduct.name,
          courtProductPrice: body.selectedProducts.courtProduct.price_amount.toString(),
          equipmentProducts: JSON.stringify(
            body.selectedProducts.equipmentProducts.map((p) => ({
              id: p.id,
              name: p.name,
              price_amount: p.price_amount,
              type: 'equipment',
            }))
          ),
          // Add initialized_at for consistent booking flow
          initialized_at: new Date().toISOString(),
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
