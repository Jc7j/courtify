import { NextResponse } from 'next/server'

import { stripe, handleStripeError } from '@/shared/lib/stripe/stripe'
import { createAdminClient } from '@/shared/lib/supabase/server'

interface SessionResponse {
  client_secret: string
  expires_at?: number
  error?: string
}

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json()

    if (!companyId) {
      return NextResponse.json<SessionResponse>(
        {
          client_secret: '',
          error: 'Company ID is required',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_account_id')
      .eq('id', companyId)
      .single()

    if (!company?.stripe_account_id) {
      return NextResponse.json<SessionResponse>(
        {
          client_secret: '',
          error: 'Company not setup for payments',
        },
        { status: 400 }
      )
    }

    try {
      const accountSession = await stripe.accountSessions.create({
        account: company.stripe_account_id,
        components: {
          account_management: {
            enabled: true,
            features: {
              external_account_collection: true,
            },
          },
          payment_details: {
            enabled: true,
            features: {
              refund_management: true,
              dispute_management: true,
              capture_payments: true,
              destination_on_behalf_of_charge_management: false,
            },
          },
        },
      })

      if (!accountSession.client_secret) {
        return NextResponse.json<SessionResponse>(
          {
            client_secret: '',
            error: 'Failed to create account session',
          },
          { status: 500 }
        )
      }

      return NextResponse.json<SessionResponse>({
        client_secret: accountSession.client_secret,
        expires_at: accountSession.expires_at,
      })
    } catch (stripeError) {
      return NextResponse.json<SessionResponse>(
        {
          client_secret: '',
          error: handleStripeError(stripeError),
        },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json<SessionResponse>(
      {
        client_secret: '',
        error: handleStripeError(error),
      },
      { status: 500 }
    )
  }
}
