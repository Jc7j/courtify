'use client'

import { Button } from '@/components/ui'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Loader2 } from 'lucide-react'
import type { Company } from '@/types/graphql'
import { useStripe } from '@/hooks/useStripe'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import type { StripeStatus } from '@/types/stripe'

interface StripeSectionProps {
  company: Company
  stripeStatus: StripeStatus | null
  checking: boolean
}

function getRequirementCategories(requirements: string[]): string[] {
  return Array.from(new Set(requirements.map((req) => req.split('.')[0])))
}

export function StripeSection({ company, stripeStatus, checking }: StripeSectionProps) {
  const router = useRouter()
  const { connectStripe, connecting } = useStripe()

  const requirements = stripeStatus?.accountDetails?.requirements || {}
  const hasRequirements = (requirements.currently_due?.length || 0) > 0
  const totalRequirements = requirements.eventually_due?.length || 0
  const completedRequirements = totalRequirements - (requirements.currently_due?.length || 0)
  const completionPercentage = totalRequirements
    ? (completedRequirements / totalRequirements) * 100
    : 0

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
          <Button variant="outline" size="sm" onClick={openStripeSettings} className="h-8">
            <ExternalLink className="mr-2 h-4 w-4" />
            Stripe Dashboard
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {!stripeStatus?.isConnected ? (
          // Case 1: Not connected at all
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

            <Button className="w-full sm:w-auto" onClick={handleConnect} disabled={connecting}>
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
        ) : !stripeStatus?.isEnabled ? (
          // Case 2 & 3: Connected but needs setup or has pending requirements
          <div className="space-y-6">
            {hasRequirements && (
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
              </>
            )}

            <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/50 p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Complete Your Stripe Setup
              </h4>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Additional information is needed before you can start accepting payments.
              </p>
            </div>

            <Button onClick={openStripeSettings} className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" />
              Complete Setup in Stripe
            </Button>
          </div>
        ) : (
          // Fully configured and enabled
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
      </CardContent>
    </Card>
  )
}
