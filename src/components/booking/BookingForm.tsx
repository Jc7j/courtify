'use client'

import { WeeklyCalendar } from './WeeklyCalendar'
import { usePublicCompanyAvailabilities } from '@/hooks/useCourtAvailability'
import type { Company } from '@/types/graphql'
import dayjs from 'dayjs'
import { Card } from '@/components/ui'
import { CourtAvailabilityList } from './CourtAvailabilityList'
import { useBookingStore } from '@/stores/useBookingStore'

interface BookingFormProps {
  company: Company
}

export function BookingForm({ company }: BookingFormProps) {
  const { selectedDate, weekStartDate, setSelectedDate, setWeekStartDate } = useBookingStore()

  const {
    company: companyData,
    availabilities,
    loading,
    error,
  } = usePublicCompanyAvailabilities(
    company.slug,
    dayjs(weekStartDate).startOf('day').toISOString(),
    dayjs(weekStartDate).endOf('week').endOf('day').toISOString()
  )

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        <p>Error loading availabilities: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{companyData?.name || company.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a date to view available court times
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select a Date</h2>
        <WeeklyCalendar
          startDate={weekStartDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onWeekChange={setWeekStartDate}
        />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Available Times for {dayjs(selectedDate).format('dddd, MMMM D')}
        </h2>
        <CourtAvailabilityList
          selectedDate={selectedDate}
          availabilities={availabilities}
          loading={loading}
        />
      </Card>
    </div>
  )
}
