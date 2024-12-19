'use client'

import { useApolloClient } from '@apollo/client'
import dayjs from 'dayjs'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useState, useEffect, useMemo, Suspense } from 'react'

import { CourtsCalendar } from '@/features/availability/components/CourtsCalendar'
import { useCalendarStore } from '@/features/availability/hooks/useCalendarStore'
import { AvailabilityServerService } from '@/features/availability/services/availabilityServerService'

import { DashboardSkeleton } from '@/core/facility/components/Skeletons'
import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'
import { useUserStore } from '@/core/user/hooks/useUserStore'

import { Card, CardContent } from '@/shared/components/ui'
import StripeConnectProvider from '@/shared/providers/StripeConnectProvider'

import type { Courts } from '@/shared/types/graphql'

interface CalendarSectionProps {
  facilityId: string
  hasStripeAccount: boolean
  courts: Courts[]
  loading: boolean
  onDateChange: (start: string, end: string) => void
}

const CalendarSection = memo(function CalendarSection({
  facilityId,
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
      facilityId={facilityId}
    />
  )

  if (!hasStripeAccount) return calendar

  return <StripeConnectProvider>{calendar}</StripeConnectProvider>
})

function DashboardContent() {
  const client = useApolloClient()
  const facility = useFacilityStore((state) => state.facility)
  const user = useUserStore((state) => state.user)
  const setAvailabilities = useCalendarStore((state) => state.setAvailabilities)

  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [courts, setCourts] = useState<Courts[]>([])
  const [selectedDate, setSelectedDate] = useState(() => ({
    start: dayjs().startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  }))

  const facilityId = useMemo(() => facility?.id || '', [facility?.id])
  const availabilityService = useMemo(() => new AvailabilityServerService(client), [client])

  const fetchAvailabilities = useCallback(
    async (start: string, end: string) => {
      if (!facilityId) return

      setLoading(true)
      try {
        const { courts: courtData, availabilities } =
          await availabilityService.getFacilityAvailabilities(facilityId, start, end)
        setCourts(courtData)
        setAvailabilities(availabilities)
      } catch (error) {
        console.error('Failed to fetch availabilities:', error)
      } finally {
        setLoading(false)
      }
    },
    [facilityId, availabilityService, setAvailabilities]
  )

  useEffect(() => {
    if (initialLoading && facility !== undefined && user !== undefined) {
      setInitialLoading(false)
    }
  }, [facility, user, initialLoading])

  useEffect(() => {
    fetchAvailabilities(selectedDate.start, selectedDate.end)
  }, [fetchAvailabilities, selectedDate])

  const handleDateChange = useCallback((start: string, end: string) => {
    setSelectedDate({ start, end })
  }, [])

  if (initialLoading || facility === undefined || user === undefined) {
    return <DashboardSkeleton />
  }

  if (!facility || !user) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
        <p className="font-medium">No facility data found</p>
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
          facilityId={facility.id}
          hasStripeAccount={!!facility.stripe_account_id}
          courts={courts}
          loading={loading}
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
