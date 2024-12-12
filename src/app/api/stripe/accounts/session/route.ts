import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json()

    if (!companyId) {
      return NextResponse.json(
        {
          error: 'Company ID is required',
          client_secret: '',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_currency')
      .eq('id', companyId)
      .single()

    if (companyError) {
      console.error('❌ Supabase error:', companyError)
    }

    if (!company?.stripe_account_id) {
      return NextResponse.json(
        {
          error: 'Company not setup for payments',
          client_secret: '',
        },
        { status: 400 }
      )
    }

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
      console.error('❌ No client secret in account session')
      return NextResponse.json(
        {
          error: 'Failed to create account session',
          client_secret: '',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      client_secret: accountSession.client_secret,
      expires_at: accountSession.expires_at,
    })
  } catch (error) {
    console.error('💥 Error in session route:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        client_secret: '',
      },
      { status: 500 }
    )
  }
}
