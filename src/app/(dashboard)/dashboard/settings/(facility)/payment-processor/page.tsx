'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'

import { PaymentProcessorSection } from '@/features/settings/components/FacilitySettings/PaymentProcessorSection'
import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import StripeConnectProvider from '@/shared/providers/StripeConnectProvider'

import type { StripeStatus } from '@/features/stripe/types'

export default function PaymentProcessorPage() {
  const searchParams = useSearchParams()
  const facility = useFacilityStore((state) => state.facility)
  const { checkStripeStatus, checking } = useStripe()

  const [state, setState] = useState({
    status: null as StripeStatus | null,
    error: null as string | null,
  })

  const shouldRefresh = useMemo(
    () => searchParams.get('refresh') === 'true' || searchParams.get('stripe') === 'success',
    [searchParams]
  )

  useEffect(() => {
    let mounted = true

    async function fetchStatus() {
      try {
        const status = await checkStripeStatus()
        if (!mounted) return

        setState((prev) => ({
          ...prev,
          status,
          error: status.error && status.error !== 'No facility found' ? status.error : null,
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to fetch Stripe status',
        }))
      }
    }

    if (facility?.id) {
      fetchStatus()
    }

    return () => {
      mounted = false
    }
  }, [checkStripeStatus, facility?.id, shouldRefresh])

  const pageContent = (
    <PaymentProcessorSection stripeStatus={state.status} checking={checking} error={state.error} />
  )

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payment Processor</h1>
        <p className="text-sm text-muted-foreground">
          Connect your Stripe account to accept payments
        </p>
      </div>

      <div className="mt-8">
        {!facility?.stripe_account_id ? (
          pageContent
        ) : (
          <StripeConnectProvider>{pageContent}</StripeConnectProvider>
        )}
      </div>
    </div>
  )
}
