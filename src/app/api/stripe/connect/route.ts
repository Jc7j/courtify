import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'

export async function POST(req: Request) {
  try {
    const { company_id, company_name } = await req.json()
    const supabaseAdmin = createAdminClient()

    if (!company_id || !company_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const account = await stripe.accounts.create({
      type: 'standard',
      country: 'US',
      business_type: 'company',
      company: { name: company_name },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { company_id },
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.DASHBOARD.SETTINGS.PRODUCTS}?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.DASHBOARD.SETTINGS.PRODUCTS}?stripe=success`,
      type: 'account_onboarding',
    })

    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('stripe_account_id')
      .eq('id', company_id)
      .single()

    if (existingCompany?.stripe_account_id) {
      console.error('Company already has Stripe account:', existingCompany.stripe_account_id)
      throw new Error('Company already has a Stripe account connected')
    }

    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        stripe_account_id: account.id,
        stripe_account_enabled: false,
        stripe_account_details: JSON.stringify(account),
        updated_at: new Date().toISOString(),
      })
      .eq('id', company_id)

    if (updateError) {
      console.error('Database update error:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
      })
      throw new Error(`Failed to update company: ${updateError.message}`)
    }

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect Stripe' },
      { status: 400 }
    )
  }
}
