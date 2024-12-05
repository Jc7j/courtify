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

    const prices = await stripe.prices.list(
      { limit: 100, active: true },
      { stripeAccount: company.stripe_account_id }
    )

    return NextResponse.json({
      prices: prices.data,
      count: prices.data.length,
      account_id: company.stripe_account_id, // Include this for debugging
    })
  } catch (error) {
    console.error('Error fetching Stripe prices:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Stripe prices' },
      { status: 500 }
    )
  }
}
