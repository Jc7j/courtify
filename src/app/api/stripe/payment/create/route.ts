import dayjs from 'dayjs'
import { NextResponse } from 'next/server'

import { CreatePaymentIntentInput } from '@/features/booking/hooks/useBookings'

import { stripe } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePaymentIntentInput

    const startTime = dayjs(body.startTime)
    const endTime = dayjs(body.endTime)
    const durationInHours = endTime.diff(startTime, 'hour', true)

    const supabase = createAdminClient()
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_currency')
      .eq('id', body.companyId)
      .single()

    if (companyError || !company?.stripe_account_id) {
      return NextResponse.json({ error: 'Company not setup for payments' }, { status: 400 })
    }

    const amount = body.selectedProducts.equipmentProducts.reduce(
      (sum, product) => sum + product.price_amount,
      Math.round(body.selectedProducts.courtProduct.price_amount * durationInHours)
    )

    // const applicationFeeAmount = Math.round(amount * 0.025)

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: company.stripe_currency?.toLowerCase() ?? 'usd',
        payment_method_types: ['card'],
        // application_fee_amount: applicationFeeAmount,
        metadata: {
          companyId: body.companyId,
          courtNumber: body.courtNumber,
          startTime: body.startTime,
          endTime: body.endTime,
          bookingDuration: `${durationInHours} hours`,
          customerEmail: body.guestInfo.email,
          customerName: body.guestInfo.name,
          customerPhone: body.guestInfo.phone,
          netHeight: body.guestInfo.net_height,
          courtProductId: body.selectedProducts.courtProduct.id,
          courtProductName: body.selectedProducts.courtProduct.name,
          courtProductPrice: body.selectedProducts.courtProduct.price_amount.toString(),
          equipmentProducts: JSON.stringify(
            body.selectedProducts.equipmentProducts.map((product) => ({
              id: product.id,
              name: product.name,
              price_amount: product.price_amount,
              type: product.type,
            }))
          ),
        },
      },
      {
        stripeAccount: company.stripe_account_id,
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
