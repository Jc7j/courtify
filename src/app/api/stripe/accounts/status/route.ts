import { NextResponse } from 'next/server'

import { stripe, handleStripeError } from '@/shared/lib/stripe/stripe'
import { StripeStatusRequest, StripeStatusResponse } from '@/shared/types/stripe'

export async function POST(req: Request) {
  try {
    const { company_id } = (await req.json()) as StripeStatusRequest
    const stripeAccountId = req.headers.get('X-Stripe-Account')

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
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
