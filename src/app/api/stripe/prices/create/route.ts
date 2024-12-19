import { NextResponse } from 'next/server'

import { stripe } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'
import { ProductType } from '@/shared/types/graphql'

interface CreateProductRequest {
  name: string
  description?: string | null
  type: ProductType
  price_amount: number
  currency?: string
  metadata?: Record<string, unknown>
  facility_id: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateProductRequest

    if (!body.name || !body.type || !body.price_amount || !body.facility_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: facility } = await supabase
      .from('facilities')
      .select('stripe_account_id, stripe_account_enabled')
      .eq('id', body.facility_id)
      .single()

    if (!facility?.stripe_account_id || !facility.stripe_account_enabled) {
      return NextResponse.json({ error: 'Stripe account not configured' }, { status: 400 })
    }

    const price = await stripe.prices.create(
      {
        currency: body.currency?.toLowerCase() || 'usd',
        unit_amount: body.price_amount,
        product_data: {
          name: body.name,
          metadata: {
            facility_id: body.facility_id,
            type: body.type,
            ...(typeof body.metadata === 'string'
              ? JSON.parse(body.metadata)
              : body.metadata || {}),
          },
        },
        metadata: {
          product_name: body.name,
          facility_id: body.facility_id,
          product_type: body.type,
        },
      },
      {
        stripeAccount: facility.stripe_account_id,
      }
    )
    return NextResponse.json({
      id: price.id,
      product: price.product as string,
      currency: price.currency,
      unit_amount: price.unit_amount,
      type: price.type,
      metadata: price.metadata,
    })
  } catch (error) {
    console.error('[stripe/prices/create] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Stripe product' },
      { status: 500 }
    )
  }
}
