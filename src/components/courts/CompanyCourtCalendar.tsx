'use client'

import { useRef, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import dayjs from 'dayjs'
import { Skeleton, Button } from '@/components/ui'
import type { DatesSetArg, EventClickArg, DateSelectArg } from '@fullcalendar/core'
import { getAvailabilityColor } from '@/lib/utils/availability-color'
import { Courts, AvailabilityStatus, EnhancedAvailability } from '@/types/graphql'
import { CourtAvailabilityDialog } from './CourtAvailabilityDialog'
import { toast } from 'sonner'
import { useCourtAvailability } from '@/hooks/useCourtAvailability'
import { Expand, Shrink, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'

// @TODO a quick button set availabilities for a day. Recurring availability, etc.
interface CompanyCourtCalendarProps {
  courts: Courts[]
  availabilities: EnhancedAvailability[]
  loading: boolean
  onDateChange: (startDate: string, endDate: string) => void
}

export function CompanyCourtCalendar({
  courts,
  availabilities,
  loading,
  onDateChange,
}: CompanyCourtCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [selectedAvailability, setSelectedAvailability] = useState<EnhancedAvailability | null>(
    null
  )
  const [isFullHeight, setIsFullHeight] = useState(false)

  const { createAvailability } = useCourtAvailability({
    startTime: selectedDate.startOf('day').toISOString(),
    endTime: selectedDate.endOf('day').toISOString(),
  })

  const handleDatesSet = useCallback(
    ({ start }: DatesSetArg) => {
      const newDate = dayjs(start)
      if (!newDate.isSame(selectedDate, 'day')) {
        setSelectedDate(newDate)
        onDateChange(start.toISOString(), dayjs(start).endOf('day').toISOString())
      }
    },
    [selectedDate, onDateChange]
  )

  const handleSelect = useCallback(
    async (selectInfo: DateSelectArg) => {
      const selectedStart = dayjs(selectInfo.startStr)
      const resourceId = parseInt(selectInfo.resource?.id || '0', 10)

      if (!resourceId) {
        toast.error('Please select a court')
        return
      }

      if (selectedStart.isBefore(dayjs())) {
        toast.error('Cannot create availability in the past')
        return
      }

      const calendarApi = selectInfo.view.calendar
      calendarApi.unselect()

      calendarApi.addEvent({
        id: 'temp',
        resourceId: resourceId.toString().padStart(2, '0'),
        title: 'Creating...',
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        backgroundColor: getAvailabilityColor(AvailabilityStatus.Available),
        classNames: ['opacity-50'],
      })

      try {
        await createAvailability({
          courtNumber: resourceId,
          startTime: selectInfo.startStr,
          endTime: selectInfo.endStr,
          status: AvailabilityStatus.Available,
        })
        toast.success('Availability created')
      } catch (error) {
        console.error('Failed to create availability:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create availability')
        calendarApi.getEventById('temp')?.remove()
      }
    },
    [createAvailability]
  )

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const availability = availabilities.find(
        (a) => `${a.court_number}-${a.start_time}` === clickInfo.event.id
      )
      if (availability) setSelectedAvailability(availability)
    },
    [availabilities]
  )

  // const getEventContent = useCallback((availability: CourtAvailability & { booking?: any }) => {
  //   const isBooked = availability.status === AvailabilityStatus.Booked && availability.booking

  //   return (
  //     <div className="p-1 text-xs">
  //       {dayjs(availability.start_time).format('h:mm A')} -{' '}
  //       {dayjs(availability.end_time).format('h:mm A')}
  //       {isBooked ? (
  //         <>
  //           <div className="font-medium">{availability.booking.customer_name}</div>
  //           <div className="opacity-75">{availability.booking.customer_email}</div>
  //         </>
  //       ) : (
  //         availability.status
  //       )}
  //     </div>
  //   )
  // }, [])
  if (loading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  if (!courts.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No courts available. Please add courts to your company.
      </div>
    )
  }
  console.log('availabilities', availabilities)
  const resources = courts.map((court) => ({
    id: court.court_number.toString().padStart(2, '0'),
    title: court.name || `Court ${court.court_number}`,
    courtNumber: court.court_number,
  }))

  return (
    <div className="bg-background border rounded-lg p-2 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="w-[200px]">{/* Spacer div */}</div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-background/50 ">
            <Button
              variant="outline-primary"
              size="icon"
              onClick={() => {
                const newDate = selectedDate.subtract(1, 'day')
                setSelectedDate(newDate)
                onDateChange(
                  newDate.startOf('day').toISOString(),
                  newDate.endOf('day').toISOString()
                )
                calendarRef.current?.getApi().prev()
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <DatePicker
              date={selectedDate.toDate()}
              onSelect={(date) => {
                const newDate = dayjs(date)
                setSelectedDate(newDate)
                onDateChange(
                  newDate.startOf('day').toISOString(),
                  newDate.endOf('day').toISOString()
                )
                calendarRef.current?.getApi().gotoDate(date)
              }}
              buttonClassName="w-[280px] text-lg font-medium text-primary items-center justify-center"
              variant="ghost"
              leftIcon={<CalendarIcon className="h-4 w-4" />}
            />

            <Button
              variant="outline-primary"
              size="icon"
              onClick={() => {
                const newDate = selectedDate.add(1, 'day')
                setSelectedDate(newDate)
                onDateChange(
                  newDate.startOf('day').toISOString(),
                  newDate.endOf('day').toISOString()
                )
                calendarRef.current?.getApi().next()
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="w-[200px] flex justify-end">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => setIsFullHeight(!isFullHeight)}
            className="gap-2 hover:bg-background/80"
          >
            {isFullHeight ? (
              <>
                <Shrink className="h-4 w-4" />
                Compact View
              </>
            ) : (
              <>
                <Expand className="h-4 w-4" />
                Full View
              </>
            )}
          </Button>
        </div>
      </div>

      <FullCalendar
        schedulerLicenseKey={process.env.FULLCALENDAR_LICENSE_KEY}
        plugins={[resourceTimeGridPlugin, interactionPlugin]}
        initialView="resourceTimeGridDay"
        initialDate={selectedDate.toDate()}
        resources={resources}
        headerToolbar={{
          left: '',
          center: '',
          right: '',
        }}
        titleFormat={() => selectedDate.format('dddd - MMM D, YYYY')}
        slotLabelClassNames="text-muted-foreground text-3xl sm:text-sm"
        resourceLabelClassNames="text-muted-foreground text-xs sm:text-sm font-medium"
        datesSet={handleDatesSet} // prev and next calendar dates
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        height={isFullHeight ? 'auto' : '1000px'}
        nowIndicator
        selectable
        selectMirror
        slotDuration="00:15:00"
        timeZone="local"
        resourceOrder="id"
        events={availabilities.map((availability) => ({
          id: `${availability.court_number}-${availability.start_time}`,
          resourceId: availability.court_number.toString().padStart(2, '0'),
          title: availability.booking
            ? `${availability.booking.customer_name} • ${availability.booking.metadata.products.court_rental.name} ${availability.booking.metadata?.customer_preferences?.net_height} • ${availability.booking.metadata.products.equipment?.map((equipment: { name: string }) => equipment.name).join(', ')}`
            : '',
          start: availability.start_time,
          end: availability.end_time,
          backgroundColor: getAvailabilityColor(availability.status),
          borderColor: 'transparent',
          textColor: 'hsl(var(--background))',
          extendedProps: { availability },
        }))}
        // eventContent={(arg) => getEventContent(arg.event.extendedProps.availability)}
        select={handleSelect} //
        eventClick={handleEventClick}
        snapDuration="00:30:00"
        editable={true} // events can be dragged and resized for updates
        slotEventOverlap={false}
        eventClassNames={(arg) => [
          'transition-opacity duration-200',
          arg.event.id === 'temp' ? 'opacity-50' : 'opacity-100',
        ]}
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
