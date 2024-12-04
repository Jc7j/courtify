import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'

interface DeleteProductRequest {
  stripe_product_id: string
  stripe_price_id: string
  company_id: string
}

export async function POST(req: Request) {
  console.log('[stripe/products/delete] Received request')

  try {
    const body = (await req.json()) as DeleteProductRequest
    console.log('[stripe/products/delete] Request body:', body)

    if (!body.stripe_product_id || !body.company_id || !body.stripe_price_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get company's Stripe account
    const supabase = createAdminClient()
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id')
      .eq('id', body.company_id)
      .single()

    if (!company?.stripe_account_id) {
      return NextResponse.json({ error: 'Stripe account not found' }, { status: 400 })
    }

    // 1. First, archive the price
    console.log('[stripe/products/delete] Archiving price:', body.stripe_price_id)
    await stripe.prices.update(
      body.stripe_price_id,
      { active: false },
      { stripeAccount: company.stripe_account_id }
    )

    // 2. Then, archive and delete the product
    console.log('[stripe/products/delete] Archiving and deleting product:', body.stripe_product_id)
    await stripe.products.update(
      body.stripe_product_id,
      { active: false },
      { stripeAccount: company.stripe_account_id }
    )

    await stripe.products.del(body.stripe_product_id, {
      stripeAccount: company.stripe_account_id,
    })

    console.log('[stripe/products/delete] Product and price deleted from Stripe')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[stripe/products/delete] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete Stripe product' },
      { status: 500 }
    )
  }
}
