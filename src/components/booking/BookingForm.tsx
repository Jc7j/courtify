'use client'

import { useState } from 'react'
import { WeeklyCalendar } from './WeeklyCalendar'
import type { Company } from '@/types/graphql'

interface BookingFormProps {
  company: Company
}

export function BookingForm({ company }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{company.name}</h1>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Select a Court & Time</h2>
        <WeeklyCalendar
          startDate={weekStartDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onWeekChange={setWeekStartDate}
        />
      </div>
    </div>
  )
}
