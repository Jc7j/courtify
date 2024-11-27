import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST(req: Request) {
  try {
    const { company_id, company_name } = await req.json()

    if (!company_id || !company_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Attempting to update company:', {
      company_id,
      company_name,
      adminClientExists: !!supabaseAdmin,
    })

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized')
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

    console.log('Stripe account created:', account)

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=success`,
      type: 'account_onboarding',
    })
    console.log('Stripe account link created:', accountLink)

    const { data: existingCompany, error: fetchError } = await supabaseAdmin
      .from('companies')
      .select('stripe_account_id')
      .eq('id', company_id)
      .single()

    if (existingCompany?.stripe_account_id) {
      console.error('Company already has Stripe account:', existingCompany.stripe_account_id)
      throw new Error('Company already has a Stripe account connected')
    }

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        stripe_account_id: account.id,
        stripe_account_enabled: false,
        stripe_account_details: account,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company_id)
      .select()

    if (updateError) {
      console.error('Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
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
