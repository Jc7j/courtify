import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'

interface RequestBody {
  companyId: string
  courtNumber: number
  startTime: string
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

    // Get company and verify Stripe setup
    const supabase = createAdminClient()
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_currency')
      .eq('id', body.companyId)
      .single()

    if (!company?.stripe_account_id) {
      return NextResponse.json({ error: 'Company is not setup for payments' }, { status: 400 })
    }

    // Get selected products with prices
    const { data: products } = await supabase
      .from('company_products')
      .select('id, price_amount, name, type')
      .in('id', [
        body.selectedProducts.courtProductId,
        ...body.selectedProducts.equipmentProductIds,
      ])

    if (!products?.length) {
      return NextResponse.json({ error: 'Products not found' }, { status: 400 })
    }

    // Calculate total amount
    const amount = products.reduce((sum, product) => sum + product.price_amount, 0)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: company.stripe_currency?.toLowerCase() ?? 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          companyId: body.companyId,
          courtNumber: body.courtNumber,
          startTime: body.startTime,
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
    })
  } catch (error) {
    console.error('[stripe/create-payment-intent] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
