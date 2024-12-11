import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import dayjs from 'dayjs'

interface RequestBody {
  companyId: string
  courtNumber: number
  startTime: string
  endTime: string
  guestInfo: {
    name: string
    email: string
    phone: string
    net_height: string
  }
  selectedProducts: {
    courtProductId: string
    equipmentProductIds: string[]
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody

    const startTime = dayjs(body.startTime)
    const endTime = dayjs(body.endTime)
    const durationInHours = endTime.diff(startTime, 'hour', true) // Use true for floating point

    const supabase = createAdminClient()
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_currency')
      .eq('id', body.companyId)
      .single()

    if (companyError || !company?.stripe_account_id) {
      return NextResponse.json({ error: 'Company not setup for payments' }, { status: 400 })
    }

    const { data: products, error: productsError } = await supabase
      .from('company_products')
      .select('id, price_amount, name, type')
      .in('id', [
        body.selectedProducts.courtProductId,
        ...body.selectedProducts.equipmentProductIds,
      ])

    if (productsError || !products?.length) {
      return NextResponse.json({ error: 'Products not found' }, { status: 400 })
    }

    const amount = products.reduce((sum, product) => {
      if (product.type === 'court_rental') {
        // For court rentals, multiply hourly rate by duration
        const hourlyRate = product.price_amount
        const courtAmount = Math.round(hourlyRate * durationInHours)
        return sum + courtAmount
      }
      // Equipment prices are flat rate
      return sum + product.price_amount
    }, 0)

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: company.stripe_currency?.toLowerCase() ?? 'usd',
        payment_method_types: ['card'],
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
          courtProductId: body.selectedProducts.courtProductId,
          equipmentProductIds: JSON.stringify(body.selectedProducts.equipmentProductIds),
        },
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    return NextResponse.json({
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
