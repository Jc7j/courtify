'use client'

import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'
import { useRef, useState, useCallback, useEffect } from 'react'

import { useCourtAvailability } from '@/features/availability/hooks/useCourtAvailability'

import {
  Skeleton,
  Button,
  Switch,
  SuccessToast,
  ErrorToast,
  DatePicker,
} from '@/shared/components/ui'
import { supabase } from '@/shared/lib/supabase/client'
import { getAvailabilityColor } from '@/shared/lib/utils/availability-color'
import { useCalendarStore } from '@/shared/stores/useCalendarStore'
import { Courts, AvailabilityStatus, EnhancedAvailability } from '@/shared/types/graphql'

import { CalendarOptionsMenu } from './CalendarOptionsMenu'
import { CourtAvailabilityDialog } from './CourtAvailabilityDialog'

import type { DatesSetArg, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'

// @TODO a quick button set availabilities for a day. Recurring availability, etc.
interface CourtsCalendarProps {
  courts: Courts[]
  loading: boolean
  onDateChange: (startDate: string, endDate: string) => void
  companyId: string
}

export function CourtsCalendar({ courts, loading, onDateChange, companyId }: CourtsCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [selectedAvailability, setSelectedAvailability] = useState<EnhancedAvailability | null>(
    null
  )
  const { settings, availabilities, setAvailabilities } = useCalendarStore()
  const [isEditMode, setIsEditMode] = useState(false)

  const { createAvailability, updateAvailability } = useCourtAvailability({
    startTime: selectedDate.startOf('day').toISOString(),
    endTime: selectedDate.endOf('day').toISOString(),
  })

  useEffect(() => {
    if (!companyId) return

    const channel = supabase
      .channel('court-availabilities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'court_availabilities',
          filter: `company_id=eq.${companyId}`,
        },
        (payload: any) => {
          console.log('Received realtime update:', payload)

          if (payload.errors) {
            console.error('Realtime payload error:', payload.errors)
            return
          }

          switch (payload.eventType) {
            case 'INSERT': {
              const exists = availabilities.some(
                (avail) =>
                  avail.court_number === payload.new.court_number &&
                  avail.start_time === payload.new.start_time
              )
              if (exists) return

              // Preserve existing booking if it exists
              const existingAvailability = availabilities.find(
                (avail) =>
                  avail.court_number === payload.new.court_number &&
                  avail.start_time === payload.new.start_time
              )

              const newAvailability: EnhancedAvailability = {
                ...payload.new,
                booking: existingAvailability?.booking || null,
              }
              setAvailabilities([...availabilities, newAvailability])
              break
            }
            case 'UPDATE': {
              const updatedAvailabilities = availabilities.map((avail) =>
                avail.court_number === payload.new.court_number &&
                avail.start_time === payload.new.start_time
                  ? {
                      ...avail, // Preserve existing fields
                      ...payload.new, // Update with new data
                      booking: avail.booking, // Explicitly preserve booking
                      status: payload.new.status, // Ensure status is updated
                    }
                  : avail
              )
              setAvailabilities(updatedAvailabilities)
              break
            }
            case 'DELETE': {
              const filteredAvailabilities = availabilities.filter(
                (avail) =>
                  !(
                    avail.court_number === payload.old.court_number &&
                    avail.start_time === payload.old.start_time
                  )
              )
              setAvailabilities(filteredAvailabilities)
              break
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId, availabilities, setAvailabilities])

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
        ErrorToast('Please select a court')
        return
      }

      if (selectedStart.isBefore(dayjs())) {
        ErrorToast('Cannot create availability in the past')
        return
      }

      const calendarApi = selectInfo.view.calendar
      calendarApi.unselect()

      const newAvailability = {
        company_id: companyId,
        court_number: resourceId,
        start_time: selectInfo.startStr,
        end_time: selectInfo.endStr,
        status: AvailabilityStatus.Available,
        booking: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setAvailabilities([...availabilities, newAvailability as EnhancedAvailability])

      try {
        await createAvailability({
          courtNumber: resourceId,
          startTime: selectInfo.startStr,
          endTime: selectInfo.endStr,
          status: AvailabilityStatus.Available,
        })
        SuccessToast('Availability created')
      } catch (error) {
        setAvailabilities(availabilities)
        ErrorToast(error instanceof Error ? error.message : 'Failed to create availability')
      }
    },
    [availabilities, createAvailability, companyId, setAvailabilities]
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

  const handleEventDrop = useCallback(
    async (dropInfo: EventDropArg) => {
      const { event, oldEvent } = dropInfo
      const availability = availabilities.find(
        (a) => `${a.court_number}-${a.start_time}` === event.id
      )

      if (!availability) return

      if (availability.status === AvailabilityStatus.Booked) {
        dropInfo.revert()
        ErrorToast("Can't move booked slots")
        return
      }

      if (dayjs(event.start).isBefore(dayjs())) {
        dropInfo.revert()
        ErrorToast("Can't move availability to past dates")
        return
      }

      const newCourtNumber = parseInt(event.getResources()[0]?.id || '0', 10)
      const oldCourtNumber = parseInt(oldEvent.getResources()[0]?.id || '0', 10)

      const updatedAvailability = {
        ...availability,
        court_number: newCourtNumber,
        start_time: event.start?.toISOString() || '',
        end_time: event.end?.toISOString() || '',
        updated_at: new Date().toISOString(),
      }

      setAvailabilities(
        availabilities.map((a) =>
          a.court_number === oldCourtNumber && a.start_time === availability.start_time
            ? updatedAvailability
            : a
        )
      )

      try {
        await updateAvailability({
          companyId: companyId,
          courtNumber: oldCourtNumber,
          startTime: oldEvent.start?.toISOString() || '',
          update: {
            court_number: newCourtNumber,
            start_time: event.start?.toISOString() || '',
            end_time: event.end?.toISOString() || '',
          },
        })
        SuccessToast('Availability updated')
      } catch (error) {
        setAvailabilities(availabilities)
        dropInfo.revert()
        ErrorToast(error instanceof Error ? error.message : 'Failed to update availability')
      }
    },
    [availabilities, updateAvailability, setAvailabilities]
  )

  const handleEventResize = useCallback(
    async (resizeInfo: EventResizeDoneArg) => {
      const { event, oldEvent } = resizeInfo
      const availability = availabilities.find(
        (a) => `${a.court_number}-${a.start_time}` === event.id
      )

      if (!availability) return

      if (availability.status === AvailabilityStatus.Booked) {
        resizeInfo.revert()
        ErrorToast("Can't resize booked slots")
        return
      }

      const updatedAvailability = {
        ...availability,
        start_time: event.start?.toISOString() || '',
        end_time: event.end?.toISOString() || '',
        updated_at: new Date().toISOString(),
      }

      setAvailabilities(
        availabilities.map((a) =>
          a.court_number === availability.court_number && a.start_time === availability.start_time
            ? updatedAvailability
            : a
        )
      )

      try {
        await updateAvailability({
          companyId: companyId,
          courtNumber: availability.court_number,
          startTime: oldEvent.start?.toISOString() || '',
          update: {
            start_time: event.start?.toISOString() || '',
            end_time: event.end?.toISOString() || '',
          },
        })
        SuccessToast('Availability updated')
      } catch (error) {
        setAvailabilities(availabilities)
        resizeInfo.revert()
        ErrorToast(error instanceof Error ? error.message : 'Failed to update availability')
      }
    },
    [availabilities, updateAvailability, setAvailabilities]
  )

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

  const resources = courts.map((court) => ({
    id: court.court_number.toString().padStart(2, '0'),
    title: court.name || `Court ${court.court_number}`,
    courtNumber: court.court_number,
  }))

  console.log('availabilities', availabilities)

  // Helper function to safely access booking metadata
  const getBookingTitle = (availability: EnhancedAvailability) => {
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
    <div className="bg-background border rounded-lg p-2 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="w-[200px] flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isEditMode ? 'Edit Mode' : 'Read Only'}
            </span>
            <Switch checked={isEditMode} onCheckedChange={setIsEditMode} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-background/50">
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
          <CalendarOptionsMenu />
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
        slotLabelClassNames="text-muted-foreground text-xs sm:text-sm"
        resourceLabelClassNames="text-muted-foreground text-xs sm:text-sm font-medium"
        datesSet={handleDatesSet}
        slotMinTime={settings.slotMinTime}
        slotMaxTime={settings.slotMaxTime}
        allDaySlot={false}
        height={settings.isFullHeight ? 'auto' : '800px'}
        nowIndicator
        selectable={isEditMode}
        selectMirror
        slotDuration="00:15:00"
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
        snapDuration="00:30:00"
        slotEventOverlap={false}
        editable={isEditMode}
        eventDurationEditable
        eventResizableFromStart
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
