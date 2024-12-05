import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { company_id } = await req.json()
    const supabaseAdmin = createAdminClient()

    if (!company_id) {
      return NextResponse.json({ error: 'Missing company id' }, { status: 400 })
    }

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('stripe_account_id')
      .eq('id', company_id)
      .single()

    if (!company?.stripe_account_id) {
      return NextResponse.json({ error: 'No Stripe account found' }, { status: 400 })
    }

    // Get all products from Stripe
    const products = await stripe.products.list(
      { limit: 100 },
      { stripeAccount: company.stripe_account_id }
    )

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching Stripe products:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Stripe products' },
      { status: 500 }
    )
  }
}
