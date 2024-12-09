'use client'

import { useRef, useState, useCallback } from 'react'
import type { DateSelectArg, EventClickArg, DatesSetArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useCourtAvailability } from '@/hooks/useCourtAvailability'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { getAvailabilityColor } from '@/lib/utils/availability-color'
import type { CourtAvailability, Courts } from '@/types/graphql'
import { AvailabilityStatus } from '@/types/graphql'
import { useIsMobile } from '@/hooks/useMobile'
import { CourtAvailabilityDialog } from './CourtAvailabilityDialog'

interface CourtCalendarProps {
  court: Courts
}

export function CourtCalendar({ court }: CourtCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const isMobile = useIsMobile()
  const [currentRange, setCurrentRange] = useState(() => ({
    start: dayjs().startOf('week').toISOString(),
    end: isMobile
      ? dayjs().startOf('day').add(3, 'days').endOf('day').toISOString()
      : dayjs().endOf('week').toISOString(),
  }))

  const { availabilities, createAvailability, loading, error } = useCourtAvailability({
    courtNumber: court.court_number,
    startTime: currentRange.start,
    endTime: currentRange.end,
  })
  const handleDatesSet = useCallback((dateInfo: DatesSetArg) => {
    setCurrentRange({
      start: dateInfo.startStr,
      end: dateInfo.endStr,
    })
  }, [])

  const [selectedAvailability, setSelectedAvailability] = useState<CourtAvailability | null>(null)

  if (loading) {
    return (
      <div className="mt-8 bg-background border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-full" />
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 bg-background border rounded-lg p-6">
        <div className="text-destructive">
          Failed to load calendar data. Please try again later.
        </div>
      </div>
    )
  }

  async function handleSelect(selectInfo: DateSelectArg) {
    const selectedStart = dayjs(selectInfo.startStr)
    const now = dayjs()

    if (selectedStart.isBefore(now.startOf('day'))) {
      toast.error('Cannot create availability for past dates')
      return
    }

    try {
      await createAvailability({
        courtNumber: court.court_number,
        startTime: selectInfo.startStr,
        endTime: selectInfo.endStr,
        status: AvailabilityStatus.Available,
      })
      toast.success('Availability created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create availability')
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
    <>
      <div className="mt-8 bg-background border rounded-lg p-2 sm:p-6 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          datesSet={handleDatesSet}
          duration={{ days: isMobile ? 4 : 7 }}
          firstDay={0}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today',
          }}
          titleFormat={{
            month: isMobile ? 'short' : 'long',
            day: 'numeric',
            weekday: isMobile ? 'short' : undefined,
          }}
          dayHeaderFormat={{
            weekday: isMobile ? 'narrow' : 'short',
            month: isMobile ? 'numeric' : 'short',
            day: 'numeric',
            omitCommas: true,
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          height="auto"
          expandRows
          stickyHeaderDates
          nowIndicator
          selectable
          selectMirror
          dayMaxEvents={isMobile ? 2 : true}
          weekends
          events={availabilities.map((availability) => ({
            id: `${availability.court_number}-${availability.start_time}`,
            title: isMobile ? availability.status : `${availability.status.toUpperCase()}`,
            start: availability.start_time,
            end: availability.end_time,
            backgroundColor: getAvailabilityColor(availability.status),
            borderColor: 'transparent',
            textColor: 'hsl(var(--background))',
            classNames: [
              'cursor-pointer hover:opacity-90 transition-opacity',
              availability.status === AvailabilityStatus.Past ? 'opacity-50' : '',
            ],
          }))}
          select={handleSelect}
          eventClick={handleEventClick}
          selectConstraint={{
            start: dayjs().startOf('day').toISOString(),
            end: dayjs().add(6, 'months').toISOString(),
          }}
          selectOverlap={false}
          slotDuration="00:30:00"
          timeZone="local"
          slotLabelClassNames="text-muted-foreground text-xs sm:text-sm"
          dayHeaderClassNames="text-muted-foreground text-xs sm:text-sm font-medium"
          allDayClassNames="hidden"
          nowIndicatorClassNames="bg-primary"
          eventClassNames="rounded-md shadow-sm text-xs sm:text-sm"
          slotLaneClassNames="border-border"
          eventContent={(eventInfo) => (
            <div className="p-1 text-xs sm:text-sm font-medium truncate">
              {!isMobile && (
                <div className="opacity-75">
                  {dayjs(eventInfo.event.start).format('h:mm A')} -
                  {dayjs(eventInfo.event.end).format('h:mm A')}
                </div>
              )}
              <div>
                {isMobile
                  ? `${dayjs(eventInfo.event.start).format('h:mm A')} - ${dayjs(
                      eventInfo.event.end
                    ).format('h:mm A')}`
                  : eventInfo.event.title}
              </div>
            </div>
          )}
        />
      </div>

      {selectedAvailability && (
        <CourtAvailabilityDialog
          availability={selectedAvailability}
          isOpen={!!selectedAvailability}
          onClose={() => setSelectedAvailability(null)}
          loading={false}
        />
      )}
    </>
  )
}
