'use client'

import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useStripe } from '@/hooks/useStripe'
import { useRouter } from 'next/navigation'
import type { StripeStatus, StripeAccountDetails } from '@/types/stripe'
import Link from 'next/link'
import { BusinessDetails } from './BusinessDetails'
import { ConnectStripePrompt } from './ConnectStripePrompt'
import { SetupRequirements } from './SetupRequirements'

function getStripeCompletionPercentage(requirements: StripeAccountDetails['requirements']): number {
  const totalRequirements = requirements.eventually_due.length
  const completedRequirements = totalRequirements - requirements.currently_due.length
  return totalRequirements ? (completedRequirements / totalRequirements) * 100 : 0
}

function hasBusinessProfile(account: StripeAccountDetails | null): account is StripeAccountDetails {
  if (!account) return false

  return (
    typeof account.email === 'string' &&
    account.business_profile &&
    typeof account.business_profile === 'object' &&
    'name' in account.business_profile &&
    'url' in account.business_profile
  )
}

interface ConnectedAccountProps {
  stripeStatus: StripeStatus | null
  checking: boolean
}

export function ConnectedAccount({ stripeStatus, checking }: ConnectedAccountProps) {
  const router = useRouter()
  const { connectStripe, connecting } = useStripe()

  const requirements = stripeStatus?.accountDetails?.requirements || {
    currently_due: [],
    eventually_due: [],
    pending_verification: [],
  }
  const completionPercentage = getStripeCompletionPercentage(requirements)

  async function handleConnect(
    options: { reconnect?: boolean; linkType?: 'onboarding' | 'update' } = {}
  ): Promise<void> {
    try {
      const shouldUseOnboarding =
        !stripeStatus?.isEnabled ||
        (stripeStatus?.accountDetails?.requirements?.currently_due?.length ?? 0) > 0

      const linkType = shouldUseOnboarding ? 'onboarding' : options.linkType

      const { url, error } = await connectStripe({ ...options, linkType })
      if (error) throw new Error(error)
      if (!url) throw new Error('Failed to get Stripe connect URL')
      router.push(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Stripe')
    }
  }

  if (checking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Processing</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Payment Processing</CardTitle>
        {stripeStatus?.isConnected && (
          <Link
            href="https://dashboard.stripe.com/dashboard"
            target="_blank"
            className="inline-flex h-8 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Stripe Dashboard
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {!stripeStatus?.isConnected && (
          <ConnectStripePrompt
            onConnect={() => handleConnect({ linkType: 'onboarding' })}
            connecting={connecting}
          />
        )}
        {!stripeStatus?.isEnabled && (
          <SetupRequirements
            requirements={requirements}
            completionPercentage={completionPercentage}
            onComplete={() => handleConnect({ reconnect: false, linkType: 'update' })}
          />
        )}
        {stripeStatus?.accountDetails && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${stripeStatus.accountDetails.charges_enabled ? 'bg-green-500' : 'bg-yellow-500'}`}
                  />
                  <div>
                    <p className="font-medium">Card Payments</p>
                    <p className="text-sm text-muted-foreground">
                      {stripeStatus.accountDetails.charges_enabled
                        ? 'Ready to accept payments'
                        : 'Not yet enabled (pending verification by Stripe or update your stripe account)'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${stripeStatus.accountDetails.payouts_enabled ? 'bg-green-500' : 'bg-yellow-500'}`}
                  />
                  <div>
                    <p className="font-medium">Payouts</p>
                    <p className="text-sm text-muted-foreground">
                      {stripeStatus.accountDetails.payouts_enabled
                        ? 'Ready to receive payouts'
                        : 'Not yet enabled (pending verification by Stripe or update your stripe account)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {stripeStatus?.accountDetails && hasBusinessProfile(stripeStatus.accountDetails) && (
          <BusinessDetails accountDetails={stripeStatus.accountDetails} />
        )}
      </CardContent>
    </Card>
  )
}
