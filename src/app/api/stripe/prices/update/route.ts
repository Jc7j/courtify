import { NextResponse } from 'next/server'
import { stripe } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'
import { ProductType, StripePaymentType } from '@/shared/types/graphql'

interface UpdatePriceInput {
  companyId: string
  productId: string
  stripePriceId: string
  stripeProductId: string
  name: string
  description?: string
  type: ProductType
  priceAmount: number
  stripePaymentType: StripePaymentType
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UpdatePriceInput

    const supabase = createAdminClient()
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_currency')
      .eq('id', body.companyId)
      .single()

    if (companyError || !company?.stripe_account_id) {
      return NextResponse.json({ error: 'Company not setup for payments' }, { status: 400 })
    }

    // Update Stripe product first
    await stripe.products.update(
      body.stripeProductId,
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

    // Deactivate old price
    await stripe.prices.update(
      body.stripePriceId,
      {
        active: false,
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    // Create new price with updated amount
    const newPrice = await stripe.prices.create(
      {
        product: body.stripeProductId,
        unit_amount: body.priceAmount,
        currency: company.stripe_currency?.toLowerCase() ?? 'usd',
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
      stripePriceId: newPrice.id,
    })
  } catch (error) {
    console.error('[stripe/prices/update] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update price' },
      { status: 500 }
    )
  }
}
