'use client'

import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import dayjs from 'dayjs'
import { memo, useRef, useCallback } from 'react'

import { cn } from '@/shared/lib/utils/cn'

import { CalendarEvent } from './CalendarEvent'
import { CalendarHeader } from './CalendarHeader'
import { useCalendarEvents } from '../../hooks/useCalendarEvents'
import { useCalendarStore } from '../../hooks/useCalendarStore'
import { useCourtAvailability } from '../../hooks/useCourtAvailability'
import { getAvailabilityColor } from '../../utils/availability-color'

import type { Courts, EnhancedAvailability } from '@/shared/types/graphql'

interface CourtsCalendarProps {
  courts: Courts[]
  loading: boolean
  onDateChange: (startDate: string, endDate: string) => void
  facilityId: string
}

function CourtsCalendarComponent({ courts, onDateChange, facilityId }: CourtsCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)

  const {
    settings,
    availabilities,
    setAvailabilities,
    selectedDate,
    setSelectedDate,
    setSelectedAvailability,
  } = useCalendarStore()

  const { createAvailability, updateAvailability } = useCourtAvailability()

  const { handleSelect, handleEventClick, handleEventDrop, handleEventResize } = useCalendarEvents({
    facilityId,
    availabilities,
    setAvailabilities,
    createAvailability,
    updateAvailability,
    onEventClick: setSelectedAvailability,
  })

  const handleDateChange = useCallback(
    async (start: string, end: string) => {
      setSelectedDate(dayjs(start))
      await onDateChange(start, end)
    },
    [setSelectedDate, onDateChange]
  )

  const resources = courts.map((court) => ({
    id: court.court_number.toString().padStart(2, '0'),
    title: court.name || `Court ${court.court_number}`,
    courtNumber: court.court_number,
  }))

  function getBookingTitle(availability: EnhancedAvailability) {
    if (!availability.booking) return ''

    try {
      const metadata =
        typeof availability.booking.metadata === 'string'
          ? JSON.parse(availability.booking.metadata)
          : availability.booking.metadata

      const courtRental = metadata.products?.court_rental?.name || ''
      const netHeight = metadata.customer_preferences?.net_height || ''
      const equipment =
        metadata.products?.equipment?.map((eq: { name: string }) => eq.name).join(', ') || ''

      let title = availability.booking.customer_name

      if (courtRental || netHeight) {
        title += ` • ${courtRental} ${netHeight}`.trim()
      }

      if (equipment) {
        title += ` • ${equipment}`
      }

      return title
    } catch (error) {
      console.error('Error parsing booking metadata:', error)
      return availability.booking.customer_name || ''
    }
  }

  return (
    <>
      <CalendarHeader onDateChange={handleDateChange} calendarRef={calendarRef} />

      <div className="relative">
        <FullCalendar
          schedulerLicenseKey={process.env.NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY}
          ref={calendarRef}
          plugins={[resourceTimeGridPlugin, interactionPlugin]}
          initialView="resourceTimeGridDay"
          initialDate={selectedDate.toDate()}
          resources={resources}
          headerToolbar={false}
          slotMinTime={settings.slotMinTime}
          slotMaxTime={settings.slotMaxTime}
          allDaySlot={false}
          height={settings.isFullHeight ? 'auto' : '800px'}
          nowIndicator
          selectable={settings.editMode}
          selectMirror
          slotDuration={settings.slotDuration}
          selectMinDistance={15}
          timeZone="local"
          resourceOrder="id"
          events={availabilities.map((availability) => ({
            id: `${availability.court_number}-${availability.start_time}`,
            resourceId: availability.court_number.toString().padStart(2, '0'),
            title: getBookingTitle(availability),
            start: availability.start_time,
            end: availability.end_time,
            backgroundColor: getAvailabilityColor(availability.status),
            borderColor: 'transparent',
            textColor: 'hsl(var(--background))',
            extendedProps: { availability },
          }))}
          eventContent={(eventInfo) => {
            const availability = eventInfo.event.extendedProps.availability
            return (
              <CalendarEvent
                availability={availability}
                className={cn(
                  eventInfo.isStart && 'rounded-l-md',
                  eventInfo.isEnd && 'rounded-r-md'
                )}
              >
                <div className="w-full h-full p-1">
                  <div className="fc-event-time">{eventInfo.timeText}</div>
                  <div className="fc-event-title">{eventInfo.event.title}</div>
                </div>
              </CalendarEvent>
            )
          }}
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          snapDuration={settings.slotDuration}
          slotEventOverlap={false}
          selectOverlap={false}
          eventOverlap={false}
          editable={settings.editMode}
          eventDurationEditable
          eventResizableFromStart
          //
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          nowIndicatorClassNames={settings.editMode ? 'bg-primary' : 'bg-muted-foreground'}
          resourceLabelClassNames={`font-semibold text-md px-4 ${settings.editMode ? 'text-primary' : 'text-black'}`}
          slotLabelClassNames={`text-xs font-medium pr-2 ${settings.editMode ? 'text-primary' : 'text-muted-foreground'}`}
          slotLaneClassNames={`border-x ${settings.editMode ? 'border-primary/20' : 'border-border/50'}`}
          selectConstraint={{
            start: '00:00',
            end: '24:00',
            overlap: false,
          }}
          // dayMinWidth={200}
          // stickyHeaderDates={true}
          // viewClassNames="border rounded-lg bg-background shadow-sm"
          dayCellClassNames={`${settings.editMode ? 'hover:bg-primary/5' : 'hover:bg-muted/50'}`}
          // moreLinkClassNames="text-primary font-medium"
          // weekNumbers={false}
          // weekText=""
          expandRows={true}
          handleWindowResize={true}
        />
      </div>
    </>
  )
}

export const CourtsCalendar = memo(CourtsCalendarComponent)
