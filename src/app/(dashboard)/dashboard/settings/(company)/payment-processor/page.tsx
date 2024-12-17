'use client'

import { useEffect, useState } from 'react'

import { ConnectedAccount } from '@/features/stripe/components/ConnectedAccount'
import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useCompany } from '@/core/company/hooks/useCompany'

import { ErrorToast } from '@/shared/components/ui'
import StripeConnectProvider from '@/shared/providers/StripeConnectProvider'
import { StripeStatus } from '@/shared/types/stripe'

export default function PaymentProcessorPage() {
  const { company } = useCompany()
  const { checkStripeStatus, checking } = useStripe()
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchStatus() {
      if (!company?.id) return
      try {
        const status = await checkStripeStatus()
        if (!mounted) return

        if (status.error) {
          ErrorToast(status.error)
          return
        }

        setStripeStatus(status)
      } catch (error) {
        console.error('[PaymentProcessorPage] Error fetching status:', error)
        ErrorToast('Failed to fetch Stripe status')
      }
    }

    fetchStatus()

    return () => {
      mounted = false
    }
  }, [company?.id, checkStripeStatus])

  if (!company) return null

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payment Processor</h1>
        <p className="text-sm text-muted-foreground">
          Connect your Stripe account to accept payments
        </p>
      </div>

      <div className="grid gap-8 mt-8">
        {company.stripe_account_id ? (
          <StripeConnectProvider companyId={company.id}>
            <ConnectedAccount stripeStatus={stripeStatus} checking={checking} />
          </StripeConnectProvider>
        ) : (
          <ConnectedAccount stripeStatus={stripeStatus} checking={checking} />
        )}
      </div>
    </div>
  )
}
