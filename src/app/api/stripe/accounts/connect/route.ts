import { NextResponse } from 'next/server'

import { StripeConnectRequest, StripeConnectResponse } from '@/features/stripe/types'

import { ROUTES } from '@/shared/constants/routes'
import { stripe, handleStripeError } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { facility_id, facility_name, reconnect, link_type } =
      (await req.json()) as StripeConnectRequest

    if (!facility_id || !facility_name) {
      return NextResponse.json<StripeConnectResponse>(
        { url: null, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: facility } = await supabase
      .from('facilities')
      .select('stripe_account_id')
      .eq('id', facility_id)
      .single()

    if (facility?.stripe_account_id && !reconnect) {
      return NextResponse.json<StripeConnectResponse>(
        { url: null, error: 'Facility already has a Stripe account connected' },
        { status: 400 }
      )
    }

    try {
      const stripeAccount =
        facility?.stripe_account_id && !reconnect
          ? await stripe.accounts.retrieve(facility.stripe_account_id)
          : await stripe.accounts.create({
              type: 'standard',
              country: 'US',
              business_type: 'individual',
              capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
              },
              metadata: { facility_id: facility_id },
            })

      const canUseUpdateLink =
        stripeAccount.details_submitted && !stripeAccount.requirements?.currently_due?.length

      const accountLinkType =
        link_type === 'update' && canUseUpdateLink ? 'account_update' : 'account_onboarding'

      const accountLink = await stripe.accountLinks.create({
        account: stripeAccount.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.DASHBOARD.SETTINGS.PAYMENT_PROCESSOR}?refresh=true`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.DASHBOARD.SETTINGS.PAYMENT_PROCESSOR}?stripe=success`,
        type: accountLinkType,
      })

      await supabase
        .from('facilities')
        .update({
          stripe_account_id: stripeAccount.id,
          stripe_account_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', facility_id)
        .throwOnError()

      return NextResponse.json<StripeConnectResponse>({
        url: accountLink.url,
        error: null,
      })
    } catch (stripeError) {
      return NextResponse.json<StripeConnectResponse>(
        { url: null, error: handleStripeError(stripeError) },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json<StripeConnectResponse>(
      { url: null, error: handleStripeError(error) },
      { status: 500 }
    )
  }
}
