import dayjs from 'dayjs'
import { useCallback } from 'react'

import { ErrorToast, WarningToast } from '@/shared/components/ui'
import { AvailabilityStatus, type EnhancedAvailability } from '@/shared/types/graphql'

import { AvailabilityClientService } from '../services/availabilityClientService'

import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'

interface UseCalendarEventsProps {
  facilityId: string
  availabilities: EnhancedAvailability[]
  setAvailabilities: (
    availabilities:
      | EnhancedAvailability[]
      | ((prev: EnhancedAvailability[]) => EnhancedAvailability[])
  ) => void
  createAvailability: (input: any) => Promise<EnhancedAvailability>
  updateAvailability: (input: any) => Promise<any>
  onEventClick: (availability: EnhancedAvailability) => void
}

export function useCalendarEvents({
  facilityId,
  availabilities,
  setAvailabilities,
  createAvailability,
  updateAvailability,
  onEventClick,
}: UseCalendarEventsProps) {
  const handleSelect = useCallback(
    async (selectInfo: DateSelectArg) => {
      const courtNumber = parseInt(selectInfo.resource?.id || '0', 10)

      if (!courtNumber) {
        console.error('Invalid court number')
        return
      }

      try {
        const start = dayjs(selectInfo.start).toISOString()
        const end = dayjs(selectInfo.end).toISOString()

        selectInfo.view.calendar.unselect()

        const newAvailability = await createAvailability({
          courtNumber,
          startTime: start,
          endTime: end,
          status: AvailabilityStatus.Available,
        })

        setAvailabilities((prev: EnhancedAvailability[]) => [...prev, newAvailability])
      } catch (error) {
        console.error('Failed to create availability:', error)
      }
    },
    [facilityId, availabilities, setAvailabilities, createAvailability]
  )

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const availability = clickInfo.event.extendedProps.availability as EnhancedAvailability
      onEventClick(availability)
    },
    [onEventClick]
  )

  const handleEventModification = useCallback(
    async (
      event: { start: Date | null; end: Date | null; id: string },
      oldEvent: { start: Date | null; end: Date | null },
      revertFunc: () => void,
      newResourceId?: string
    ) => {
      const availability = AvailabilityClientService.findAvailabilityFromEventId(
        event.id,
        availabilities,
        oldEvent.start
      )

      if (!availability) {
        ErrorToast('Availability not found')
        revertFunc()
        return
      }

      if (availability.status === AvailabilityStatus.Booked) {
        revertFunc()
        WarningToast('Cannot modify booked slots')
        return
      }

      const updates = {
        start_time: event.start?.toISOString() || '',
        end_time: event.end?.toISOString() || '',
        ...(newResourceId && { court_number: parseInt(newResourceId) }),
      }

      try {
        // Optimistic update
        setAvailabilities(
          AvailabilityClientService.updateAvailabilityInList(availabilities, availability, updates)
        )

        await updateAvailability({
          facilityId,
          courtNumber: availability.court_number,
          startTime: oldEvent.start?.toISOString() || '',
          update: updates,
        })
      } catch (error) {
        // Revert optimistic update
        setAvailabilities(availabilities)
        revertFunc()
        console.error('[Calendar Events] Modification error:', error)
        ErrorToast('Failed to update court time')
      }
    },
    [facilityId, availabilities, updateAvailability, setAvailabilities]
  )

  const handleEventDrop = useCallback(
    (dropInfo: EventDropArg) => {
      handleEventModification(
        dropInfo.event,
        dropInfo.oldEvent,
        dropInfo.revert,
        dropInfo.newResource?.id
      )
    },
    [handleEventModification]
  )

  const handleEventResize = useCallback(
    (resizeInfo: EventResizeDoneArg) => {
      handleEventModification(resizeInfo.event, resizeInfo.oldEvent, resizeInfo.revert)
    },
    [handleEventModification]
  )

  return {
    handleSelect,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
  }
}
