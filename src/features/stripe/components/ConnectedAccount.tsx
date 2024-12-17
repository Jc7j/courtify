'use client'

import { ConnectAccountManagement } from '@stripe/react-connect-js'
import { ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useCompany } from '@/core/company/hooks/useCompany'

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  ConfirmationDialog,
  ErrorToast,
  SuccessToast,
} from '@/shared/components/ui'

import { ConnectStripePrompt } from './ConnectStripePrompt'
import { SetupRequirements } from './SetupRequirements'

import type { StripeStatus, StripeAccountDetails } from '@/shared/types/stripe'

function getStripeCompletionPercentage(requirements: StripeAccountDetails['requirements']): number {
  const totalRequirements = requirements.eventually_due.length
  const completedRequirements = totalRequirements - requirements.currently_due.length
  return totalRequirements ? (completedRequirements / totalRequirements) * 100 : 0
}

interface ConnectedAccountProps {
  stripeStatus: StripeStatus | null
  checking: boolean
}

export function ConnectedAccount({ stripeStatus, checking }: ConnectedAccountProps) {
  const router = useRouter()
  const { connectStripe, connecting } = useStripe()
  const { updateCompany } = useCompany()
  const [disconnecting, setDisconnecting] = useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)

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
      ErrorToast(error instanceof Error ? error.message : 'Failed to connect Stripe')
    }
  }

  async function handleDisconnect() {
    try {
      setDisconnecting(true)
      await updateCompany({
        name: stripeStatus?.accountDetails?.business_profile?.name || '',
        slug: '', // This will be ignored by the update
        stripe_account_id: null,
        stripe_account_enabled: false,
        stripe_account_details: null,
      })
      SuccessToast('Stripe account disconnected successfully')
      router.refresh()
    } catch (err) {
      console.error('Error disconnecting Stripe:', err)
      ErrorToast('Failed to disconnect Stripe account')
    } finally {
      setDisconnecting(false)
      setShowDisconnectDialog(false)
    }
  }

  if (checking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
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
      </CardContent>
      <CardFooter className="flex flex-col">
        {stripeStatus?.isConnected && (
          <>
            <ConnectAccountManagement />
            <div className="flex gap-2 mt-8">
              <Button variant="outline-destructive" onClick={() => setShowDisconnectDialog(true)}>
                Disconnect
              </Button>
              <ConfirmationDialog
                open={showDisconnectDialog}
                onOpenChange={setShowDisconnectDialog}
                title="Disconnect Stripe Account"
                description="Are you sure you want to disconnect your Stripe account? This will disable all payment processing capabilities until you reconnect."
                actionLabel={disconnecting ? 'Disconnecting...' : 'Disconnect'}
                onConfirm={handleDisconnect}
                loading={disconnecting}
                variant="destructive"
              />
              <Link
                href="https://dashboard.stripe.com/dashboard"
                target="_blank"
                className="inline-flex h-8 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Stripe Dashboard
              </Link>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
