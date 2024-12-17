import { NextResponse } from 'next/server'

import { stripe } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { company_id } = await req.json()
    const supabaseAdmin = createAdminClient()
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('stripe_account_id, stripe_account_enabled, stripe_account_details')
      .eq('id', company_id)
      .single()

    if (!company?.stripe_account_id) {
      return NextResponse.json({
        accountId: null,
        isEnabled: false,
        accountDetails: null,
      })
    }

    try {
      const account = await stripe.accounts.retrieve(company.stripe_account_id)

      const isEnabled =
        account.charges_enabled && account.payouts_enabled && account.details_submitted

      await supabaseAdmin
        .from('companies')
        .update({
          stripe_account_enabled: isEnabled,
          stripe_account_details: JSON.stringify(account),
          updated_at: new Date().toISOString(),
        })
        .eq('id', company_id)

      return NextResponse.json({
        accountId: company.stripe_account_id,
        isEnabled,
        accountDetails: account,
      })
    } catch (stripeError) {
      console.error('Failed to retrieve Stripe account:', stripeError)

      await supabaseAdmin
        .from('companies')
        .update({
          stripe_account_id: null,
          stripe_account_enabled: false,
          stripe_account_details: null,
          stripe_webhook_secret: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company_id)

      return NextResponse.json({
        accountId: null,
        isEnabled: false,
        accountDetails: null,
      })
    }
  } catch (error) {
    console.error('Stripe status check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check Stripe status' },
      { status: 400 }
    )
  }
}
