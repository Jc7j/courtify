'use client'

import { useUserStore } from '@/stores/useUserStore'
import { Button, Card } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { Copy, Check, CalendarDays, Users, DollarSign, Clock } from 'lucide-react'
import { useState } from 'react'
import { BaseUser } from '@/types/auth'
import { CompanyCourtCalendar } from '@/components/courts/CompanyCourtCalendar'
import { useCompanyAvailabilities } from '@/hooks/useCourtAvailability'
import { Courts } from '@/types/graphql'
import dayjs from 'dayjs'

const BOOKING_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://courtify.com'

function DashboardContent({
  company,
  user,
}: {
  company: NonNullable<ReturnType<typeof useCompany>['company']>
  user: BaseUser
}) {
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
    const bookingUrl = `${BOOKING_BASE_URL}/book/${company.slug}`
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}! Here&apos;s what&apos;s happening at {company.name}.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm text-muted-foreground">Share your booking page</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySlug}
            className="h-9 transition-all duration-200 hover:border-primary"
          >
            <span className="text-xs mr-2">{`${BOOKING_BASE_URL}/book/${company.slug}`}</span>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today&apos;s Bookings</p>
              <p className="text-2xl font-bold mt-2">12</p>
              <p className="text-xs text-muted-foreground mt-1">4 courts booked</p>
            </div>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold mt-2">48</p>
              <p className="text-xs text-muted-foreground mt-1">+5 this week</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold mt-2">$1,234</p>
              <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
            </div>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Session</p>
              <p className="text-2xl font-bold mt-2">1.5h</p>
              <p className="text-xs text-muted-foreground mt-1">Per booking</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Calendar Section */}
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Today&apos;s Schedule</h2>
            <p className="text-sm text-muted-foreground">
              View and manage court bookings and availability
            </p>
          </div>
        </div>
        <CompanyCourtCalendar
          courts={availabilityCourts as Courts[]}
          availabilities={availabilities}
          loading={availabilitiesLoading}
          onDateChange={handleDateChange}
        />
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { company, loading, error } = useCompany()
  const { user } = useUserStore()

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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

  if (!company || !user) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
        <p className="font-medium">No company data found</p>
      </div>
    )
  }

  return <DashboardContent company={company} user={user} />
}
