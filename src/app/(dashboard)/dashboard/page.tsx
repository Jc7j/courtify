'use client'

import { useUserStore } from '@/stores/useUserStore'
import { Button, Card } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { CompanyCourtCalendar } from '@/components/courts/CompanyCourtCalendar'
import { useCompanyAvailabilities } from '@/hooks/useCourtAvailability'
import dayjs from 'dayjs'
import { Courts } from '@/types/graphql'
import StripeConnectProvider from '@/providers/StripeConnectProvider'

const BOOKING_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://courtify.app'

export default function DashboardPage() {
  const { company, loading: companyLoading, error: companyError } = useCompany()
  const { user } = useUserStore()
  const [copied, setCopied] = useState(false)
  const [selectedDate, setSelectedDate] = useState({
    start: dayjs().startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  })

  const {
    courts: availabilityCourts,
    availabilities,
    loading: availabilitiesLoading,
  } = useCompanyAvailabilities(selectedDate.start, selectedDate.end)

  const handleDateChange = (start: string, end: string) => {
    setSelectedDate({ start, end })
  }

  const handleCopySlug = async () => {
    if (!company?.slug) return
    const bookingUrl = `${BOOKING_BASE_URL}/book/${company.slug}`
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (companyLoading) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (companyError) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
        <p className="font-medium">Error loading company data: {companyError.message}</p>
      </div>
    )
  }

  if (!company || !user) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
        <p className="font-medium">No company data found</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {user?.name}!</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-col gap-1 items-end">
            <p className="text-sm text-muted-foreground">Guest booking link</p>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleCopySlug}
              className="h-9 transition-all duration-200 hover:border-primary"
            >
              <p className="text-xs mr-2">{`${BOOKING_BASE_URL}/book/${company.slug}`}</p>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-primary hover:text-primary-foreground hover:bg-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      {/* <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Today&apos;s Schedule</h2>
            <p className="text-sm text-muted-foreground">
              View and manage court bookings and availability
            </p>
          </div>
        </div> */}
      <StripeConnectProvider companyId={company.id}>
        <CompanyCourtCalendar
          courts={availabilityCourts as Courts[]}
          availabilities={availabilities}
          loading={availabilitiesLoading}
          onDateChange={handleDateChange}
        />
      </StripeConnectProvider>
      {/* </Card> */}
    </div>
  )
}
