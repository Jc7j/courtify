'use client'

import { useRef, useState } from 'react'
import { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Courts } from '@/types/graphql'
import { useCourtAvailability } from '@/hooks/useCourtAvailability'
import { toast } from 'sonner'
import { useUser } from '@/providers/UserProvider'
import dayjs from 'dayjs'

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

  console.log('Current Range:', {
    start: currentRange.start,
    end: currentRange.end,
    availabilities,
  })

  const { user } = useUser()

  // Convert availabilities to FullCalendar events with better formatting
  const events = availabilities.map((availability) => ({
    id: `${availability.court_number}-${availability.start_time}`,
    title: `${dayjs(availability.start_time).format('h:mm A')} - ${dayjs(
      availability.end_time
    ).format('h:mm A')}`,
    start: availability.start_time,
    end: availability.end_time,
    backgroundColor: getStatusColor(availability.status),
    borderColor: 'transparent',
    textColor: '#fff',
    extendedProps: {
      status: availability.status,
      courtNumber: availability.court_number,
    },
    classNames: [
      'cursor-pointer',
      'hover:opacity-90',
      availability.status === 'past' ? 'opacity-50' : '',
    ],
  }))

  // Handle slot selection for creating new availability
  const handleSelect = async (selectInfo: DateSelectArg) => {
    if (!user?.company_id) {
      toast.error('Company ID is required')
      return
    }

    // Ensure dates are in ISO format with timezone
    const startTime = new Date(selectInfo.start).toISOString()
    const endTime = new Date(selectInfo.end).toISOString()

    try {
      await createAvailability({
        courtNumber: court.court_number,
        startTime,
        endTime,
        status: 'available',
      })
      toast.success('Availability created')
    } catch (error) {
      console.error('Creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create availability')
    }
  }

  // Handle event click for updating status
  const handleEventClick = async (clickInfo: EventClickArg) => {
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
        events={events}
        select={handleSelect}
        eventClick={handleEventClick}
        datesSet={(dateInfo) => {
          setCurrentRange({
            start: dayjs(dateInfo.start).toISOString(),
            end: dayjs(dateInfo.end).toISOString(),
          })
        }}
        selectConstraint={{
          startTime: '06:00:00',
          endTime: '23:00:00',
        }}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        timeZone="local"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        dayHeaderFormat={{
          weekday: 'short',
          month: 'numeric',
          day: 'numeric',
          omitCommas: true,
        }}
        eventContent={(eventInfo) => (
          <div className="p-1 text-xs">
            <div className="font-semibold">{eventInfo.event.title}</div>
            <div className="opacity-75 capitalize">{eventInfo.event.extendedProps.status}</div>
          </div>
        )}
      />
    </div>
  )
}

// Update color function to include better contrast
function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return '#22c55e' // green-500
    case 'booked':
      return '#ef4444' // red-500
    case 'past':
      return '#6b7280' // gray-500
    default:
      return '#cbd5e1' // slate-300
  }
}
