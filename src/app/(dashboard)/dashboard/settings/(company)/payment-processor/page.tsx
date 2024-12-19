'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { PaymentProcessorSection } from '@/features/settings/components/CompanySettings/PaymentProcessorSection'
import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import { ErrorToast } from '@/shared/components/ui'
import StripeConnectProvider from '@/shared/providers/StripeConnectProvider'

import type { StripeStatus } from '@/shared/types/stripe'

export default function PaymentProcessorPage() {
  const searchParams = useSearchParams()
  const company = useCompanyStore((state) => state.company)
  const { checkStripeStatus, checking } = useStripe()
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchStatus() {
      try {
        const status = await checkStripeStatus()
        if (!mounted) return

        if (status.error && status.error !== 'No company found') {
          ErrorToast(status.error)
          return
        }

        setStripeStatus(status)
      } catch (error) {
        ErrorToast(`Failed to fetch Stripe status: ${error}`)
      }
    }

    if (company?.id) {
      if (searchParams.get('refresh') === 'true' || searchParams.get('stripe') === 'success') {
        fetchStatus()
      } else {
        fetchStatus()
      }
    }

    return () => {
      mounted = false
    }
  }, [checkStripeStatus, searchParams, company?.id])

  const pageContent = <PaymentProcessorSection stripeStatus={stripeStatus} checking={checking} />

  const content = (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payment Processor</h1>
        <p className="text-sm text-muted-foreground">
          Connect your Stripe account to accept payments
        </p>
      </div>

      <div className="mt-8">
        {!company?.stripe_account_id ? (
          pageContent
        ) : (
          <StripeConnectProvider>{pageContent}</StripeConnectProvider>
        )}
      </div>
    </div>
  )

  return content
}
