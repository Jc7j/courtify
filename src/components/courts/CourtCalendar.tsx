'use client'

import { useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Courts } from '@/types/graphql'

interface CourtCalendarProps {
  court: Courts
}

export function CourtCalendar({ court }: CourtCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)

  return (
    <div className="mt-8 bg-background border rounded-lg p-6">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay',
        }}
        slotMinTime="06:00:00" // Start at 6 AM
        slotMaxTime="23:00:00" // End at 11 PM
        allDaySlot={false}
        height="auto"
        expandRows={true}
        stickyHeaderDates={true}
        nowIndicator={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        select={async (selectInfo) => {
          // Handle slot selection
          console.log('Selected:', selectInfo)
        }}
        eventClick={async (clickInfo) => {
          // Handle event click
          console.log('Event clicked:', clickInfo)
        }}
        events={[]} // We'll add events later
      />
    </div>
  )
}
