'use client'

import { useCompany } from '@/hooks/useCompany'
import { CompanyProfileSection } from '@/components/settings/CompanyProfileSection'
import { StripeSection } from '@/components/settings/StripeSection'
import { useStripe } from '@/hooks/useStripe'
import { useEffect, useState } from 'react'
import { StripeStatus } from '@/types/stripe'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const { company, loading: companyLoading, error: companyError } = useCompany()

  const { checkStripeStatus, checking } = useStripe()
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchStripeStatus() {
      if (!company?.id) return

      const status = await checkStripeStatus()
      if (!mounted) return

      if (status.error) {
        setError(new Error(status.error))
        toast.error(status.error)
        return
      }

      setStripeStatus(status)
    }

    fetchStripeStatus()

    return () => {
      mounted = false
    }
  }, [company?.id])

  if (companyError || error) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">Error loading data: {(companyError || error)?.message}</p>
      </div>
    )
  }

  if (companyLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">No company data found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Company Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile and preferences</p>
      </div>

      <div className="grid gap-8 mt-8">
        <CompanyProfileSection company={company} loading={companyLoading} />
        <StripeSection company={company} stripeStatus={stripeStatus} checking={checking} />
      </div>
    </div>
  )
}
