import { NextResponse } from 'next/server'

import { stripe } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { facility_id } = await req.json()
    const supabaseAdmin = createAdminClient()

    if (!facility_id) {
      return NextResponse.json({ error: 'Missing facility id' }, { status: 400 })
    }

    const { data: facility } = await supabaseAdmin
      .from('facilities')
      .select('stripe_account_id')
      .eq('id', facility_id)
      .single()

    if (!facility?.stripe_account_id) {
      return NextResponse.json({ error: 'No Stripe account found' }, { status: 400 })
    }

    const prices = await stripe.prices.list(
      { limit: 100, active: true },
      { stripeAccount: facility.stripe_account_id }
    )

    return NextResponse.json({
      prices: prices.data,
      count: prices.data.length,
      account_id: facility.stripe_account_id,
    })
  } catch (error) {
    console.error('Error fetching Stripe prices:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Stripe prices' },
      { status: 500 }
    )
  }
}
