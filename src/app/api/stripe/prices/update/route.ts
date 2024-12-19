import { NextResponse } from 'next/server'

import { stripe } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'
import { ProductType, StripePaymentType } from '@/shared/types/graphql'

interface UpdatePriceInput {
  companyId: string
  productId: string
  stripe_price_id: string
  stripe_product_id: string
  name: string
  description?: string
  type: ProductType
  price_amount: number
  stripePaymentType: StripePaymentType
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UpdatePriceInput

    const supabase = createAdminClient()
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id')
      .eq('id', body.companyId)
      .single()

    if (companyError || !company?.stripe_account_id) {
      return NextResponse.json({ error: 'Company not setup for payments' }, { status: 400 })
    }

    await stripe.products.update(
      body.stripe_product_id,
      {
        name: body.name,
        description: body.description,
        metadata: {
          type: body.type,
          updated_at: new Date().toISOString(),
        },
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    await stripe.prices.update(
      body.stripe_price_id,
      {
        active: false,
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    const newPrice = await stripe.prices.create(
      {
        product: body.stripe_product_id,
        unit_amount: body.price_amount,
        currency: 'usd',
        metadata: {
          updated_at: new Date().toISOString(),
        },
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Price updated successfully',
      stripe_price_id: newPrice.id,
    })
  } catch (error) {
    console.error('[stripe/prices/update] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update price' },
      { status: 500 }
    )
  }
}
