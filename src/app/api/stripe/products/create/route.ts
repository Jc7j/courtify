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
}

export async function POST(req: Request) {
  try {
    // 1. Initialize Supabase admin client (no cookies needed)
    const supabase = createAdminClient()

    // 2. Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // 4. Get company's Stripe account
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_account_enabled')
      .eq('id', userData.company_id)
      .single()

    if (!company?.stripe_account_id || !company.stripe_account_enabled) {
      return NextResponse.json({ error: 'Stripe account not configured' }, { status: 400 })
    }

    // 5. Parse and validate request body
    const body = (await req.json()) as CreateProductRequest
    if (!body.name || !body.type || !body.priceAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Creating Stripe price for company:', {
      company_id: userData.company_id,
      product_name: body.name,
    })

    // 6. Create Stripe price with product data
    const price = await stripe.prices.create(
      {
        currency: body.currency?.toLowerCase() || 'usd',
        unit_amount: body.priceAmount,
        product_data: {
          name: body.name,
          metadata: {
            company_id: userData.company_id,
            type: body.type,
            description: body.description || null,
            ...(body.metadata || {}),
          },
        },
        metadata: {
          company_id: userData.company_id,
          product_type: body.type,
        },
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    console.log('Stripe price created:', price.id)

    return NextResponse.json({
      stripe_price_id: price.id,
      stripe_product_id: price.product as string,
    })
  } catch (error) {
    console.error('Error creating Stripe product:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Stripe product' },
      { status: 500 }
    )
  }
}
