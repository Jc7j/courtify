'use client'

import dayjs from 'dayjs'

import { CourtAvailabilityList } from '@/features/booking/components/CourtAvailabilityList'
import { WeeklyCalendar } from '@/features/booking/components/WeeklyCalendar'

import { Card } from '@/shared/components/ui'
import { CourtAvailability } from '@/shared/types/graphql'

interface BookingFormProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  weekStartDate: Date
  setWeekStartDate: (date: Date) => void
  availabilities: CourtAvailability[]
}

export function BookingForm({
  selectedDate,
  setSelectedDate,
  weekStartDate,
  setWeekStartDate,
  availabilities,
}: BookingFormProps) {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select a Date</h2>
        <WeeklyCalendar
          startDate={weekStartDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onWeekChange={setWeekStartDate}
          availabilities={availabilities}
        />
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Available Times for {dayjs(selectedDate).format('dddd, MMMM D')}
        </h2>
        <CourtAvailabilityList
          selectedDate={selectedDate}
          availabilities={availabilities}
          loading={false}
        />
      </Card>
    </div>
  )
}