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
  console.log('[stripe/products/create] Received request')

  try {
    // Parse and validate request body first
    const body = (await req.json()) as CreateProductRequest
    console.log('[stripe/products/create] Request body:', {
      ...body,
      priceAmount: body.priceAmount,
    })

    if (!body.name || !body.type || !body.priceAmount || !body.company_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize Supabase admin client
    const supabase = createAdminClient()
    console.log('[stripe/products/create] Initialized Supabase client')

    // Get company's Stripe account directly
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_account_enabled')
      .eq('id', body.company_id)
      .single()

    console.log('[stripe/products/create] Stripe account check:', {
      companyId: body.company_id,
      hasStripeAccount: !!company?.stripe_account_id,
      stripeEnabled: company?.stripe_account_enabled,
    })

    if (!company?.stripe_account_id || !company.stripe_account_enabled) {
      return NextResponse.json({ error: 'Stripe account not configured' }, { status: 400 })
    }

    // Create Stripe price with product data
    console.log('[stripe/products/create] Creating Stripe price...')
    const price = await stripe.prices.create(
      {
        currency: body.currency?.toLowerCase() || 'usd',
        unit_amount: body.priceAmount,
        product_data: {
          name: body.name,
          metadata: {
            company_id: body.company_id,
            type: body.type,
            description: body.description || null,
            ...(body.metadata || {}),
          },
        },
        metadata: {
          company_id: body.company_id,
          product_type: body.type,
        },
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    console.log('[stripe/products/create] Stripe price created:', {
      priceId: price.id,
      productId: price.product,
    })

    return NextResponse.json({
      stripe_price_id: price.id,
      stripe_product_id: price.product as string,
    })
  } catch (error) {
    console.error('[stripe/products/create] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Stripe product' },
      { status: 500 }
    )
  }
}
