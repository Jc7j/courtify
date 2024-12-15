'use client'

import { useCompany } from '@/hooks/useCompany'
import { ConnectedAccount } from '@/components/stripe/ConnectedAccount'
import { useStripe } from '@/hooks/useStripe'
import { useEffect, useState } from 'react'
import { StripeStatus } from '@/types/stripe'
import { toast } from 'sonner'
import StripeConnectProvider from '@/providers/StripeConnectProvider'

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
          toast.error(status.error)
          return
        }

        setStripeStatus(status)
      } catch (error) {
        console.error('[PaymentProcessorPage] Error fetching status:', error)
        toast.error('Failed to fetch Stripe status')
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
        <StripeConnectProvider companyId={company.id}>
          <ConnectedAccount stripeStatus={stripeStatus} checking={checking} />
        </StripeConnectProvider>
      </div>
    </div>
  )
}
