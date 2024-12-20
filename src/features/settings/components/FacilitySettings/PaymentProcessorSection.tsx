'use client'

import { ConnectAccountManagement } from '@stripe/react-connect-js'
import { ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { memo, useCallback, useState } from 'react'

import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useFacility } from '@/core/facility/hooks/useFacility'
import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  ConfirmationDialog,
  Progress,
} from '@/shared/components/ui'

import type { StripeStatus, StripeAccountDetails } from '@/features/stripe/types'

interface PaymentStatusProps {
  type: 'charges' | 'payouts'
  enabled: boolean
  title: string
  description: string
}

const PaymentStatus = memo(function PaymentStatus({
  enabled,
  title,
  description,
}: PaymentStatusProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
})

interface ConnectPromptProps {
  onConnect: () => void
  connecting: boolean
}

const ConnectPrompt = memo(function ConnectPrompt({ onConnect, connecting }: ConnectPromptProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h4 className="font-medium">Accept Payments with Stripe</h4>
        <ul className="mt-2 space-y-2">
          {['Provide business information', 'Set up bank account', 'Verify identity'].map(
            (text, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
                {text}
              </li>
            )
          )}
        </ul>
      </div>

      <Button className="w-full sm:w-auto" onClick={onConnect} disabled={connecting}>
        {connecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          'Connect Stripe Account'
        )}
      </Button>
    </div>
  )
})

interface SetupProgressProps {
  requirements: StripeAccountDetails['requirements']
  completionPercentage: number
}

const SetupProgress = memo(function SetupProgress({
  requirements,
  completionPercentage,
}: SetupProgressProps) {
  const categories = Array.from(new Set(requirements.currently_due.map((req) => req.split('.')[0])))

  if (!requirements.currently_due.length) return null

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Setup Progress</h3>
          <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress value={completionPercentage} className="h-1" />
      </div>

      <div className="grid gap-2">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3">
            <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
            <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

interface PaymentProcessorSectionProps {
  stripeStatus: StripeStatus | null
  checking: boolean
  error?: string | null
}

export function PaymentProcessorSection({
  stripeStatus,
  checking,
  error,
}: PaymentProcessorSectionProps) {
  const { connectStripe, connecting } = useStripe()
  const { updateFacility, error: facilityError } = useFacility()
  const facility = useFacilityStore((state) => state.facility)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)

  const handleConnect = useCallback(async () => {
    try {
      const shouldUseOnboarding =
        !stripeStatus?.isEnabled ||
        (stripeStatus?.accountDetails?.requirements?.currently_due?.length ?? 0) > 0

      const { url, error } = await connectStripe({
        linkType: shouldUseOnboarding ? 'onboarding' : 'update',
      })
      if (error) throw new Error(error)
      if (!url) throw new Error('Failed to get Stripe connect URL')
      window.location.href = url
    } catch (err) {
      console.error('[Payment Processor] Connect error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      throw err
    }
  }, [
    stripeStatus?.isEnabled,
    stripeStatus?.accountDetails?.requirements?.currently_due,
    connectStripe,
  ])

  const handleDisconnect = useCallback(async () => {
    try {
      setDisconnecting(true)
      await updateFacility({
        name: stripeStatus?.accountDetails?.business_profile?.name || '',
        slug: '',
        stripe_account_id: null,
        stripe_account_enabled: false,
      })
      window.location.reload()
    } catch (err) {
      console.error('[Payment Processor] Disconnect error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      throw err
    } finally {
      setDisconnecting(false)
      setShowDisconnectDialog(false)
    }
  }, [stripeStatus?.accountDetails?.business_profile?.name, updateFacility])

  if (checking || !stripeStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error || facilityError) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">{error || facilityError?.message}</p>
      </div>
    )
  }

  const requirements = stripeStatus.accountDetails?.requirements || {
    currently_due: [],
    eventually_due: [],
    pending_verification: [],
  }

  const completionPercentage =
    requirements.eventually_due.length > 0
      ? ((requirements.eventually_due.length - requirements.currently_due.length) /
          requirements.eventually_due.length) *
        100
      : 0

  return (
    <Card>
      <CardContent className="space-y-6 pt-4">
        {!facility?.stripe_account_id && (
          <ConnectPrompt onConnect={handleConnect} connecting={connecting} />
        )}

        {facility?.stripe_account_id && facility?.stripe_account_enabled && (
          <SetupProgress requirements={requirements} completionPercentage={completionPercentage} />
        )}

        {stripeStatus.accountDetails && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <PaymentStatus
                type="charges"
                enabled={stripeStatus.accountDetails.charges_enabled}
                title="Card Payments"
                description={
                  stripeStatus.accountDetails.charges_enabled
                    ? 'Ready to accept payments'
                    : 'Not yet enabled (pending verification by Stripe or update your stripe account)'
                }
              />
              <PaymentStatus
                type="payouts"
                enabled={stripeStatus.accountDetails.payouts_enabled}
                title="Payouts"
                description={
                  stripeStatus.accountDetails.payouts_enabled
                    ? 'Ready to receive payouts'
                    : 'Not yet enabled (pending verification by Stripe or update your stripe account)'
                }
              />
            </div>

            {facility?.stripe_account_id && <ConnectAccountManagement />}
          </>
        )}
      </CardContent>

      {stripeStatus.isConnected && (
        <CardFooter className="flex flex-col">
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
        </CardFooter>
      )}
    </Card>
  )
}
