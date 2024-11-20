'use client'

import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useCompanyAvailabilities } from '@/hooks/useCourtAvailability'
import dayjs from 'dayjs'
import { Skeleton } from '@/components/ui'
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core'
import { getAvailabilityColor } from '@/lib/utils/availability-color'
import { CourtAvailability } from '@/types/graphql'
import { CourtAvailabilityDialog } from './CourtAvailabilityDialog'

export function CompanyCourtCalendar() {
  const calendarRef = useRef<FullCalendar>(null)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [selectedAvailability, setSelectedAvailability] = useState<CourtAvailability | null>(null)

  const { courts, availabilities, loading } = useCompanyAvailabilities(
    selectedDate.startOf('day').toISOString(),
    selectedDate.endOf('day').toISOString()
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!courts.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No courts available. Please add courts to your company.
      </div>
    )
  }

  // Format courts as resources for FullCalendar
  const resources = courts.map((court) => ({
    id: court.court_number.toString().padStart(2, '0'),
    title: court.name || `Court ${court.court_number}`,
    courtNumber: court.court_number,
  }))

  function handleDatesSet({ start }: DatesSetArg) {
    const newDate = dayjs(start)
    if (!newDate.isSame(selectedDate, 'day')) {
      setSelectedDate(newDate)
    }
  }

  function handleEventClick(clickInfo: EventClickArg) {
    const availability = availabilities.find(
      (a) => `${a.court_number}-${a.start_time}` === clickInfo.event.id
    )

    if (availability) {
      setSelectedAvailability(availability)
    }
  }

  return (
    <div className="bg-background border rounded-lg p-2 sm:p-6 overflow-hidden">
      <style jsx global>{`
        .fc .fc-toolbar {
          gap: 1rem;
          padding: 0.5rem;
        }
        .fc .fc-toolbar-title {
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 500;
        }
        .fc-timegrid-axis-cushion {
          max-width: 60px;
        }
        .fc-col-header-cell-cushion {
          font-weight: 500;
          font-size: 0.875rem;
          padding: 1rem 0.5rem;
          text-align: center;
          width: 100%;
          display: block;
        }
        .fc .fc-timegrid-cols {
          width: 100% !important;
        }
        .fc .fc-timegrid-col {
          min-width: 0 !important;
        }
        .fc-resource-timeline-divider {
          width: 1px !important;
          background-color: hsl(var(--border));
        }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[resourceTimeGridPlugin, interactionPlugin]}
        initialView="resourceTimeGridDay"
        initialDate={selectedDate.toDate()}
        resources={resources}
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }}
        titleFormat={() => selectedDate.format('dddd, MMMM D, YYYY')}
        datesSet={handleDatesSet}
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        height="auto"
        expandRows
        stickyHeaderDates
        nowIndicator
        slotDuration="00:30:00"
        timeZone="local"
        resourceOrder="id"
        events={availabilities.map((availability) => ({
          id: `${availability.court_number}-${availability.start_time}`,
          resourceId: availability.court_number.toString().padStart(2, '0'),
          title: availability.status,
          start: availability.start_time,
          end: availability.end_time,
          backgroundColor: getAvailabilityColor(availability.status),
          borderColor: 'transparent',
          textColor: 'hsl(var(--background))',
        }))}
        slotLabelClassNames="text-muted-foreground text-xs sm:text-sm"
        resourceLabelClassNames="text-muted-foreground text-xs sm:text-sm font-medium"
        allDayClassNames="hidden"
        nowIndicatorClassNames="bg-primary"
        slotLaneClassNames="border-border"
        eventClick={handleEventClick}
      />
      {selectedAvailability && (
        <CourtAvailabilityDialog
          availability={selectedAvailability}
          isOpen={!!selectedAvailability}
          onClose={() => setSelectedAvailability(null)}
          loading={false}
        />
      )}
    </div>
  )
}
