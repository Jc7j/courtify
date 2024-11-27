'use client'

import { Button } from '@/components/ui'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { Company } from '@/types/graphql'
import { useStripe } from '@/hooks/useStripe'
import { useSearchParams, useRouter } from 'next/navigation'

interface StripeSetupProps {
  company: Company
}

export function StripeSetup({ company }: StripeSetupProps) {
  const [isConnected, setIsConnected] = useState(company.stripe_account_enabled)
  const router = useRouter()
  const { connectStripe, checkStripeStatus, connecting, checking } = useStripe()
  const searchParams = useSearchParams()
  const isReturningFromStripe = searchParams.get('stripe') === 'success'

  // Check status when returning from Stripe
  useEffect(() => {
    if (isReturningFromStripe) {
      checkStripeStatus().then(({ isEnabled, error }) => {
        if (error) {
          toast.error(error)
          return
        }
        setIsConnected(isEnabled)
        if (isEnabled) {
          toast.success('Stripe account connected successfully')
        }
      })
    }
  }, [isReturningFromStripe, checkStripeStatus])

  async function handleConnect() {
    try {
      const { url, error } = await connectStripe()

      if (error) {
        throw new Error(error)
      }

      if (!url) {
        throw new Error('Failed to get Stripe connect URL')
      }

      // Redirect to Stripe Connect
      router.push(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Stripe')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Account Status</CardTitle>
        <CardDescription>Manage your payment processing settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Stripe Connected</p>
              <p className="text-sm text-muted-foreground">
                Your Stripe account is connected and ready to accept payments
              </p>
              {company.stripe_account_details && (
                <p className="text-xs text-muted-foreground">
                  Account ID: {company.stripe_account_id}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={handleConnect} disabled={connecting || checking}>
              {connecting || checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                'Reconnect'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="font-medium">Connect Stripe Account</p>
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to start accepting payments for court bookings.
                You&apos;ll need:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                <li>Business information</li>
                <li>Bank account details</li>
                <li>Valid government ID</li>
              </ul>
            </div>
            <Button onClick={handleConnect} disabled={connecting || checking}>
              {connecting || checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Stripe Account'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
