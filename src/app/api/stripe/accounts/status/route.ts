import { NextResponse } from 'next/server'

import { StripeStatusRequest, StripeStatusResponse } from '@/features/stripe/types'

import { stripe, handleStripeError } from '@/shared/lib/stripe/stripe'

export async function POST(req: Request) {
  try {
    const { facility_id } = (await req.json()) as StripeStatusRequest
    const stripeAccountId = req.headers.get('X-Stripe-Account')

    if (!facility_id) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    if (!stripeAccountId) {
      return NextResponse.json<StripeStatusResponse>({
        accountId: null,
        isEnabled: false,
        accountDetails: null,
      })
    }

    try {
      const account = await stripe.accounts.retrieve(stripeAccountId)

      const isEnabled =
        account.charges_enabled && account.payouts_enabled && account.details_submitted

      return NextResponse.json<StripeStatusResponse>({
        accountId: stripeAccountId,
        isEnabled,
        accountDetails: account as any,
      })
    } catch (stripeError) {
      return NextResponse.json({ error: handleStripeError(stripeError) }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: handleStripeError(error) }, { status: 500 })
  }
}
