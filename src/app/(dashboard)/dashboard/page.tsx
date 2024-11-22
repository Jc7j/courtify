'use client'

import { useUser } from '@/providers/UserProvider'
import { Button, Skeleton } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

const BOOKING_BASE_URL = 'https://courtify.com/book'

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser()
  const { company, loading: companyLoading, error } = useCompany()
  const [copied, setCopied] = useState(false)

  const loading = userLoading || companyLoading

  const handleCopySlug = async () => {
    if (!company?.slug) return
    const bookingUrl = `${BOOKING_BASE_URL}/${company.slug}`
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 mt-8">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[160px] rounded-lg" />
            <Skeleton className="h-[160px] rounded-lg" />
            <Skeleton className="h-[160px] rounded-lg" />
          </div>
        </div>
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

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-2 pb-6 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {company?.name}
            </h1>
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
                {`${BOOKING_BASE_URL}/${company?.slug}`}
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border bg-card">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Lifetime Total Bookings</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Today&apos;s Bookings</p>
            <p className="text-2xl font-semibold">0</p>
          </div>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Revenue</p>
            <p className="text-2xl font-semibold">$0</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
          </Button>
        </div>
        <div className="rounded-lg border bg-card">
          <div className="p-6 text-center text-muted-foreground">No recent activity to show</div>
        </div>
      </div>
    </div>
  )
}
