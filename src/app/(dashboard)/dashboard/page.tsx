'use client'

import dayjs from 'dayjs'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useState, useEffect, useMemo, Suspense } from 'react'

import { CourtsCalendar } from '@/features/availability/components/CourtsCalendar'
import { useCalendarStore } from '@/features/availability/hooks/useCalendarStore'
import { useCompanyCourtAvailabilities } from '@/features/availability/hooks/useCourtAvailability'

import { DashboardSkeleton } from '@/core/company/components/Skeletons'
import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'
import { useUserStore } from '@/core/user/hooks/useUserStore'

import { Card, CardContent } from '@/shared/components/ui'
import StripeConnectProvider from '@/shared/providers/StripeConnectProvider'

import type { Courts } from '@/shared/types/graphql'

interface CalendarSectionProps {
  companyId: string
  hasStripeAccount: boolean
  courts: Courts[]
  loading: boolean
  onDateChange: (start: string, end: string) => void
}

const CalendarSection = memo(function CalendarSection({
  companyId,
  hasStripeAccount,
  courts,
  loading,
  onDateChange,
}: CalendarSectionProps) {
  const calendar = (
    <CourtsCalendar
      courts={courts}
      loading={loading}
      onDateChange={onDateChange}
      companyId={companyId}
    />
  )

  if (!hasStripeAccount) return calendar

  return <StripeConnectProvider>{calendar}</StripeConnectProvider>
})

function DashboardContent() {
  const company = useCompanyStore((state) => state.company)
  const user = useUserStore((state) => state.user)
  const setAvailabilities = useCalendarStore((state) => state.setAvailabilities)
  const [initialLoading, setInitialLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => ({
    start: dayjs().startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  }))

  const companyId = useMemo(() => company?.id || '', [company?.id])

  const {
    courts: availabilityCourts,
    loading: availabilitiesLoading,
    availabilities,
  } = useCompanyCourtAvailabilities(companyId, selectedDate.start, selectedDate.end)

  useEffect(() => {
    if (initialLoading && company !== undefined && user !== undefined) {
      setInitialLoading(false)
    }
  }, [company, user, initialLoading])

  useEffect(() => {
    if (availabilities) {
      setAvailabilities(availabilities)
    }
  }, [availabilities, setAvailabilities])

  const handleDateChange = useCallback((start: string, end: string) => {
    setSelectedDate({ start, end })
  }, [])

  if (initialLoading || company === undefined || user === undefined) {
    return <DashboardSkeleton />
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
      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        }
      >
        <CalendarSection
          companyId={company.id}
          hasStripeAccount={!!company.stripe_account_id}
          courts={availabilityCourts as Courts[]}
          loading={availabilitiesLoading}
          onDateChange={handleDateChange}
        />
      </Suspense>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
