'use client'

import { useRef, useState } from 'react'
import { EventClickArg, DateSelectArg, DatesSetArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Courts } from '@/types/graphql'
import { useCourtAvailability } from '@/hooks/useCourtAvailability'
import { toast } from 'sonner'
import { useUser } from '@/providers/UserProvider'
import dayjs from 'dayjs'
import { getAvailabilityColor } from '@/lib/utils/availablity-color'

interface CourtCalendarProps {
  court: Courts
}

export function CourtCalendar({ court }: CourtCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [currentRange, setCurrentRange] = useState({
    start: dayjs().startOf('week').toISOString(),
    end: dayjs().endOf('week').toISOString(),
  })

  const { availabilities, createAvailability, updateAvailability } = useCourtAvailability({
    courtNumber: court.court_number,
    startTime: currentRange.start,
    endTime: currentRange.end,
  })

  const { user } = useUser()

  async function handleSelect(selectInfo: DateSelectArg) {
    if (!user?.company_id) return

    try {
      await createAvailability({
        courtNumber: court.court_number,
        startTime: selectInfo.startStr,
        endTime: selectInfo.endStr,
      })
      toast.success('Availability created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create availability')
    }
  }

  async function handleEventClick(clickInfo: EventClickArg) {
    const currentStatus = clickInfo.event.extendedProps.status
    const newStatus = currentStatus === 'available' ? 'booked' : 'available'

    try {
      await updateAvailability({
        courtNumber: court.court_number,
        startTime: clickInfo.event.startStr,
        update: { status: newStatus },
      })
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

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
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        height="auto"
        expandRows
        stickyHeaderDates
        nowIndicator
        selectable
        selectMirror
        dayMaxEvents
        weekends
        events={availabilities.map((availability) => ({
          id: `${availability.court_number}-${availability.start_time}`,
          title: `${dayjs(availability.start_time).format('h:mm A')} - ${dayjs(
            availability.end_time
          ).format('h:mm A')}`,
          start: availability.start_time,
          end: availability.end_time,
          backgroundColor: getAvailabilityColor(availability.status),
          borderColor: 'transparent',
          textColor: '#fff',
          extendedProps: { status: availability.status },
        }))}
        select={handleSelect}
        eventClick={handleEventClick}
        datesSet={(dateInfo: DatesSetArg) =>
          setCurrentRange({
            start: dayjs(dateInfo.start).toISOString(),
            end: dayjs(dateInfo.end).toISOString(),
          })
        }
        selectConstraint={{ startTime: '06:00:00', endTime: '23:00:00' }}
        selectOverlap={false}
        slotDuration="00:30:00"
        timeZone="local"
      />
    </div>
  )
}
