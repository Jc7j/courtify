'use client'

import { Button } from '@/components/ui'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Loader2 } from 'lucide-react'
import type { Company } from '@/types/graphql'
import { useStripe } from '@/hooks/useStripe'
import { useSearchParams, useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

interface StripeSetupProps {
  company: Company
}

interface StripeAccountDetails {
  requirements?: {
    currently_due?: string[]
    eventually_due?: string[]
  }
  capabilities?: {
    card_payments?: 'active' | 'inactive'
    transfers?: 'active' | 'inactive'
  }
  payouts_enabled?: boolean
}

function getRequirementCategories(requirements: string[]): string[] {
  return Array.from(new Set(requirements.map((req) => req.split('.')[0])))
}

export function StripeSetup({ company }: StripeSetupProps) {
  const [isConnected, setIsConnected] = useState<boolean>(!!company.stripe_account_id)
  const router = useRouter()
  const { connectStripe, checkStripeStatus, connecting, checking } = useStripe()
  const searchParams = useSearchParams()
  const isReturningFromStripe = searchParams.get('stripe') === 'success'

  const stripeDetails: StripeAccountDetails | null = (() => {
    if (!company.stripe_account_details) return null
    if (typeof company.stripe_account_details !== 'string') return null
    try {
      return JSON.parse(company.stripe_account_details) as StripeAccountDetails
    } catch {
      return null
    }
  })()

  const requirements = stripeDetails?.requirements || {}
  const hasRequirements = (requirements.currently_due?.length || 0) > 0

  const totalRequirements = requirements.eventually_due?.length || 0
  const completedRequirements = totalRequirements - (requirements.currently_due?.length || 0)
  const completionPercentage = totalRequirements
    ? (completedRequirements / totalRequirements) * 100
    : 0

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

  const handleConnect = async (): Promise<void> => {
    try {
      const { url, error } = await connectStripe()
      if (error) throw new Error(error)
      if (!url) throw new Error('Failed to get Stripe connect URL')
      router.push(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Stripe')
    }
  }

  const openStripeSettings = (): void => {
    if (!company.stripe_account_id) return
    window?.open(
      `https://dashboard.stripe.com/connect/accounts/${company.stripe_account_id}`,
      '_blank'
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Processing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isConnected ? (
          <div className="space-y-6">
            {hasRequirements ? (
              <>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Setup Progress</h3>
                    <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-1" />
                </div>

                <div className="grid gap-2">
                  {getRequirementCategories(requirements.currently_due || []).map(
                    (category, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
                      >
                        <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
                        <span className="text-sm font-medium capitalize">
                          {category.replace('_', ' ')}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <Button onClick={openStripeSettings} className="w-full sm:w-auto">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Complete Setup in Stripe
                </Button>
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Card Payments</p>
                      <p className="text-sm text-muted-foreground">Ready to accept payments</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Payouts</p>
                      <p className="text-sm text-muted-foreground">Ready to receive payouts</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium">Accept Payments with Stripe</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
                  Provide business information
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
                  Set up bank account
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
                  Verify identity
                </li>
              </ul>
            </div>

            <Button
              className="w-full sm:w-auto"
              onClick={handleConnect}
              disabled={connecting || checking}
            >
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
