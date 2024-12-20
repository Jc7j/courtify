'use client'

import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import dayjs from 'dayjs'
import { memo, useRef, useState, useCallback } from 'react'

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
  const [isDateChanging, setIsDateChanging] = useState(false)

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
  console.log('availabilities', availabilities)
  const handleDateChange = useCallback(
    async (start: string, end: string) => {
      setIsDateChanging(true)
      setSelectedDate(dayjs(start))
      await onDateChange(start, end)
      // Small delay to ensure smooth transition
      setTimeout(() => setIsDateChanging(false), 100)
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

      return `${availability.booking.customer_name} • ${courtRental} ${netHeight} • ${equipment}`
    } catch (error) {
      console.error('Error parsing booking metadata:', error)
      return availability.booking.customer_name || ''
    }
  }

  return (
    <div
      className={`bg-background border rounded-lg p-2 sm:p-6 overflow-hidden transition-all duration-300 ease-in-out`}
    >
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
          eventClassNames={`rounded-md border-none shadow-sm transition-opacity ${
            settings.editMode ? 'hover:ring-2 hover:ring-primary/50' : ''
          }`}
          // eventMinHeight={24}
          // eventShortHeight={24}
          selectConstraint={{
            start: '00:00',
            end: '24:00',
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
        {/* Overlay for smoother transitions */}
        {isDateChanging && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 animate-in fade-in duration-200" />
        )}
      </div>

      {/* {selectedAvailability && (
        <CourtAvailabilityDialog
          availability={selectedAvailability}
          isOpen={!!selectedAvailability}
          onClose={() => setSelectedAvailability(null)}
          readOnly={!isEditMode}
        />
      )} */}
    </div>
  )
}

export const CourtsCalendar = memo(CourtsCalendarComponent)
