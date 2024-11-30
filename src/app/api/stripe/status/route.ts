import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { company_id } = await req.json()

    const { data: company } = await supabase
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

    // Check account status
    const account = await stripe.accounts.retrieve(company.stripe_account_id)

    const isEnabled =
      account.charges_enabled && account.payouts_enabled && account.details_submitted

    // Update company status
    await supabase
      .from('companies')
      .update({
        stripe_account_enabled: isEnabled,
        stripe_account_details: account,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company_id)

    return NextResponse.json({
      accountId: company.stripe_account_id,
      isEnabled,
      accountDetails: account,
    })
  } catch (error) {
    console.error('Stripe status check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check Stripe status' },
      { status: 400 }
    )
  }
}
