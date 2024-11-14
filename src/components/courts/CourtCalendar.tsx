'use client'

import { useRef, useState } from 'react'
import { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useCourtAvailability } from '@/hooks/useCourtAvailability'
import { toast } from 'sonner'
import { useUser } from '@/providers/UserProvider'
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

  const { availabilities, createAvailability, updateAvailability, deleteAvailability } =
    useCourtAvailability({
      courtNumber: court.court_number,
      startTime: currentRange.start,
      endTime: currentRange.end,
    })

  const { user } = useUser()
  const [selectedAvailability, setSelectedAvailability] = useState<CourtAvailability | null>(null)

  async function handleSelect(selectInfo: DateSelectArg) {
    if (!user?.company_id) return

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

  async function handleEventClick(clickInfo: EventClickArg) {
    console.log('Event clicked:', {
      eventStart: clickInfo.event.startStr,
      eventId: clickInfo.event.id,
      availabilities: availabilities.map((a) => ({
        court: a.court_number,
        start: a.start_time,
      })),
    })

    const availability = availabilities.find(
      (a) => `${a.court_number}-${a.start_time}` === clickInfo.event.id
    )

    if (availability) {
      setSelectedAvailability(availability)
    } else {
      console.error('No matching availability found')
    }
  }

  async function handleStatusChange(newStatus: AvailabilityStatus) {
    if (!selectedAvailability) return

    try {
      await updateAvailability({
        courtNumber: court.court_number,
        startTime: selectedAvailability.start_time,
        update: { status: newStatus },
      })
      toast.success(`Status updated to ${newStatus.toLowerCase()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  async function handleDelete() {
    if (!selectedAvailability) return

    try {
      await deleteAvailability({
        courtNumber: court.court_number,
        startTime: selectedAvailability.start_time,
      })
      setSelectedAvailability(null)
      toast.success('Availability deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete availability')
    }
  }

  return (
    <>
      <div className="mt-8 bg-background border rounded-lg p-2 sm:p-6 overflow-hidden">
        <style jsx global>{`
          .fc .fc-toolbar {
            gap: 1rem;
            padding: 0.5rem;
          }
          .fc .fc-toolbar-title {
            font-size: 0.85rem;
            line-height: 1.25rem;
            font-weight: 500;
            text-align: center;
          }
          @media (min-width: 640px) {
            .fc .fc-toolbar-title {
              font-size: 1rem;
              line-height: 1.5rem;
            }
          }
          .fc .fc-button {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          @media (min-width: 640px) {
            .fc .fc-button {
              font-size: 0.875rem;
              line-height: 1.25rem;
            }
          }
        `}</style>
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
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
            extendedProps: {
              status: availability.status,
              courtNumber: availability.court_number,
            },
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
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          loading={false}
        />
      )}
    </>
  )
}
