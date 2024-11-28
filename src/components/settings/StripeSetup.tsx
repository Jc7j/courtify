'use client'

import { Button } from '@/components/ui'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Loader2 } from 'lucide-react'
import type { Company } from '@/types/graphql'
import { useStripe } from '@/hooks/useStripe'
import { useSearchParams, useRouter } from 'next/navigation'

interface StripeSetupProps {
  company: Company
}

export function StripeSetup({ company }: StripeSetupProps) {
  const [isConnected, setIsConnected] = useState(company.stripe_account_id)
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

      router.push(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Stripe')
    }
  }

  const openStripeSettings = () => {
    if (!company.stripe_account_id) return
    window?.open(
      `https://dashboard.stripe.com/connect/accounts/${company.stripe_account_id}`,
      '_blank'
    )
  }
  console.log(company)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Processing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium text-green-600 dark:text-green-500">
                  ✓ Stripe Account Connected
                </p>
                {company.stripe_account_id && (
                  <p className="text-xs text-muted-foreground">
                    Account ID: {company.stripe_account_id}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleConnect}
                disabled={connecting || checking}
                className="shrink-0"
              >
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

            <div className="space-y-3">
              <Button variant="secondary" className="w-full sm:w-auto" onClick={openStripeSettings}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Access Stripe Dashboard
              </Button>
              <p className="text-sm text-muted-foreground">
                View your payouts, transaction history, and manage your account settings in the
                Stripe dashboard.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to start accepting payments for court bookings. You'll
                need to:
              </p>
              <ul className="list-disc pl-4 text-sm text-muted-foreground">
                <li>Provide basic business information</li>
                <li>Set up your bank account for payouts</li>
                <li>Verify your identity</li>
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
