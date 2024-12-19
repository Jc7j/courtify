import dayjs from 'dayjs'
import { useCallback } from 'react'

import { SuccessToast, ErrorToast } from '@/shared/components/ui'
import { AvailabilityStatus, type EnhancedAvailability } from '@/shared/types/graphql'

import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'

interface UseCalendarEventsProps {
  companyId: string
  availabilities: EnhancedAvailability[]
  setAvailabilities: (availabilities: EnhancedAvailability[]) => void
  createAvailability: (input: any) => Promise<any>
  updateAvailability: (input: any) => Promise<any>
  onEventClick: (availability: EnhancedAvailability) => void
}

export function useCalendarEvents({
  companyId,
  availabilities,
  setAvailabilities,
  createAvailability,
  updateAvailability,
  onEventClick,
}: UseCalendarEventsProps) {
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
      if (availability) onEventClick(availability)
    },
    [availabilities, onEventClick]
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
          companyId,
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
    [availabilities, updateAvailability, companyId, setAvailabilities]
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
          companyId,
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
    [availabilities, updateAvailability, companyId, setAvailabilities]
  )

  return {
    handleSelect,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
  }
}
