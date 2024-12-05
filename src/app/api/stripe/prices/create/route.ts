import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { ProductType } from '@/types/graphql'

interface CreateProductRequest {
  name: string
  description?: string | null
  type: ProductType
  priceAmount: number
  currency?: string
  metadata?: Record<string, unknown>
  company_id: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateProductRequest

    if (!body.name || !body.type || !body.priceAmount || !body.company_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_account_enabled')
      .eq('id', body.company_id)
      .single()

    if (!company?.stripe_account_id || !company.stripe_account_enabled) {
      return NextResponse.json({ error: 'Stripe account not configured' }, { status: 400 })
    }

    const price = await stripe.prices.create(
      {
        currency: body.currency?.toLowerCase() || 'usd',
        unit_amount: body.priceAmount,
        product_data: {
          name: body.name,
          metadata: {
            company_id: body.company_id,
            type: body.type,
            ...(typeof body.metadata === 'string'
              ? JSON.parse(body.metadata)
              : body.metadata || {}),
          },
        },
        metadata: {
          product_name: body.name,
          company_id: body.company_id,
          product_type: body.type,
        },
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    return NextResponse.json({
      stripe_price_id: price.id,
      stripe_product_id: price.product as string,
    })
  } catch (error) {
    console.error('[stripe/prices/create] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Stripe product' },
      { status: 500 }
    )
  }
}
