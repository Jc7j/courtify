import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'

export async function POST(req: Request) {
  try {
    const { company_id, company_name, reconnect, link_type } = await req.json()
    const supabaseAdmin = createAdminClient()

    if (!company_id || !company_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('stripe_account_id')
      .eq('id', company_id)
      .single()

    if (existingCompany?.stripe_account_id && !reconnect) {
      console.error('Company already has Stripe account:', existingCompany.stripe_account_id)
      throw new Error('Company already has a Stripe account connected')
    }

    let accountId = existingCompany?.stripe_account_id
    let stripeAccount = null

    if (accountId && !reconnect) {
      stripeAccount = await stripe.accounts.retrieve(accountId)
    } else if (!accountId || reconnect) {
      stripeAccount = await stripe.accounts.create({
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
      accountId = stripeAccount.id
    }

    const canUseUpdateLink =
      stripeAccount?.details_submitted && !stripeAccount?.requirements?.currently_due?.length
    const accountLinkType =
      link_type === 'update' && canUseUpdateLink ? 'account_update' : 'account_onboarding'

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.DASHBOARD.SETTINGS.PAYMENT_PROCESSOR}?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.DASHBOARD.SETTINGS.PAYMENT_PROCESSOR}?stripe=success`,
      type: accountLinkType,
    })

    const updateData = {
      stripe_account_id: accountId,
      stripe_account_enabled: false,
      updated_at: new Date().toISOString(),
      ...(stripeAccount && { stripe_account_details: JSON.stringify(stripeAccount) }),
    }

    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update(updateData)
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
