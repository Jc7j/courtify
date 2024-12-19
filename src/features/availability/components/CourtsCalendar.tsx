'use client'

import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import dayjs from 'dayjs'
import { memo, useRef, useState, useCallback } from 'react'

import { CalendarHeader } from './CalendarHeader'
import { CourtAvailabilityDialog } from './CourtAvailabilityDialog'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { useCalendarStore } from '../hooks/useCalendarStore'
import { useCourtAvailability } from '../hooks/useCourtAvailability'
import { getAvailabilityColor } from '../utils/availability-color'

import type { Courts, EnhancedAvailability } from '@/shared/types/graphql'

interface CourtsCalendarProps {
  courts: Courts[]
  loading: boolean
  onDateChange: (startDate: string, endDate: string) => void
  companyId: string
}

function CourtsCalendarComponent({
  courts,
  loading: externalLoading,
  onDateChange,
  companyId,
}: CourtsCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [selectedAvailability, setSelectedAvailability] = useState<EnhancedAvailability | null>(
    null
  )
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDateChanging, setIsDateChanging] = useState(false)

  const { settings, availabilities, setAvailabilities, selectedDate, setSelectedDate } =
    useCalendarStore()
  const { createAvailability, updateAvailability } = useCourtAvailability()

  const { handleSelect, handleEventClick, handleEventDrop, handleEventResize } = useCalendarEvents({
    companyId,
    availabilities,
    setAvailabilities,
    createAvailability,
    updateAvailability,
    onEventClick: setSelectedAvailability,
  })

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

  const loading = externalLoading || isDateChanging

  if (loading) {
    return (
      <div className="relative h-[800px] w-full">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 animate-in fade-in duration-200" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const resources = courts.map((court) => ({
    id: court.court_number.toString().padStart(2, '0'),
    title: court.name || `Court ${court.court_number}`,
    courtNumber: court.court_number,
  }))

  return (
    <div className="bg-background border rounded-lg p-2 sm:p-6 overflow-hidden">
      <CalendarHeader
        onDateChange={handleDateChange}
        calendarRef={calendarRef}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />

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
          selectable={isEditMode}
          selectMirror
          slotDuration={settings.slotDuration}
          selectMinDistance={15}
          timeZone="local"
          resourceOrder="id"
          events={availabilities.map((availability) => ({
            id: `${availability.court_number}-${availability.start_time}`,
            resourceId: availability.court_number.toString().padStart(2, '0'),
            title: availability.booking?.customer_name || '',
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
          editable={isEditMode}
          eventDurationEditable
          eventResizableFromStart
          //
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          // slotLabelInterval="01:00"
          nowIndicatorClassNames={isEditMode ? 'bg-primary' : 'bg-muted-foreground'}
          resourceLabelClassNames={`font-medium text-sm px-4 ${isEditMode ? 'text-primary' : 'text-muted-foreground'}`}
          slotLabelClassNames={`text-xs font-medium pr-2 ${isEditMode ? 'text-primary' : 'text-muted-foreground'}`}
          slotLaneClassNames={`border-x ${isEditMode ? 'border-primary/20' : 'border-border/50'}`}
          eventClassNames={`rounded-md border-none shadow-sm transition-opacity ${
            isEditMode ? 'hover:ring-2 hover:ring-primary/50' : ''
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
          dayCellClassNames={`${isEditMode ? 'hover:bg-primary/5' : 'hover:bg-muted/50'}`}
          // moreLinkClassNames="text-primary font-medium"
          // weekNumbers={false}
          // weekText=""
          expandRows={true}
          // handleWindowResize={true}
        />
        {/* Overlay for smoother transitions */}
        {isDateChanging && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 animate-in fade-in duration-200" />
        )}
      </div>

      {selectedAvailability && (
        <CourtAvailabilityDialog
          availability={selectedAvailability}
          isOpen={!!selectedAvailability}
          onClose={() => setSelectedAvailability(null)}
          readOnly={!isEditMode}
        />
      )}
    </div>
  )
}

export const CourtsCalendar = memo(CourtsCalendarComponent)
