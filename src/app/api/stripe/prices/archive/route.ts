import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'

interface ArchiveProductRequest {
  stripe_product_id: string
  stripe_price_id: string
  company_id: string
  active: boolean // true for restore, false for archive
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ArchiveProductRequest

    if (!body.stripe_product_id || !body.company_id || !body.stripe_price_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id')
      .eq('id', body.company_id)
      .single()

    if (!company?.stripe_account_id) {
      return NextResponse.json({ error: 'Stripe account not found' }, { status: 400 })
    }

    await stripe.prices.update(
      body.stripe_price_id,
      { active: body.active },
      { stripeAccount: company.stripe_account_id }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[stripe/products/archive] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update Stripe product status' },
      { status: 500 }
    )
  }
}
