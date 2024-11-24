'use client'

import { useUserStore } from '@/stores/useUserStore'
import { Button } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

const BOOKING_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://courtify.com'

function DashboardContent({
  company,
}: {
  company: NonNullable<ReturnType<typeof useCompany>['company']>
}) {
  const { user } = useUserStore()

  const [copied, setCopied] = useState(false)

  const handleCopySlug = async () => {
    const bookingUrl = `${BOOKING_BASE_URL}/book/${company.slug}`
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-2 pb-6 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back, {user?.name}
            </h1>
            <p className="text-muted-foreground">
              Manage your courts and view booking activity for {company.name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm text-muted-foreground">Guest booking link</p>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopySlug}
              className="h-9 transition-all duration-200"
            >
              <span className="text-xs text-primary-foreground mr-2">
                {`${BOOKING_BASE_URL}/book/${company.slug}`}
              </span>
              {copied ? (
                <div className="bg-green-500 rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { company, loading, error } = useCompany()

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <p>Loading company data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
        <p className="font-medium">Error loading company data: {error.message}</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
        <p className="font-medium">No company data found</p>
      </div>
    )
  }

  return <DashboardContent company={company} />
}
