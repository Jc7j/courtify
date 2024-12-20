import dayjs from 'dayjs'
import { useCallback } from 'react'

import { ErrorToast, SuccessToast, WarningToast } from '@/shared/components/ui'
import { AvailabilityStatus, type EnhancedAvailability } from '@/shared/types/graphql'

import { AvailabilityClientService } from '../services/availabilityClientService'

import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'

interface UseCalendarEventsProps {
  facilityId: string
  availabilities: EnhancedAvailability[]
  setAvailabilities: (availabilities: EnhancedAvailability[]) => void
  createAvailability: (input: any) => Promise<any>
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
      try {
        const selectedStart = dayjs(selectInfo.startStr).toDate()
        const resourceId = parseInt(selectInfo.resource?.id || '0', 10)

        if (!resourceId) {
          ErrorToast('Please select a court')
          return
        }

        const { isValid, error } = AvailabilityClientService.validateTimeConstraints(selectedStart)
        if (!isValid) {
          WarningToast(error!)
          return
        }

        const calendarApi = selectInfo.view.calendar
        calendarApi.unselect()

        const newAvailability = {
          facility_id: facilityId,
          court_number: resourceId,
          start_time: selectInfo.startStr,
          end_time: selectInfo.endStr,
          status: AvailabilityStatus.Available,
          booking: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Optimistic update
        setAvailabilities([...availabilities, newAvailability as EnhancedAvailability])

        await createAvailability({
          courtNumber: resourceId,
          startTime: selectInfo.startStr,
          endTime: selectInfo.endStr,
          status: AvailabilityStatus.Available,
        })

        SuccessToast('Court time created successfully')
      } catch (error) {
        // Revert optimistic update
        setAvailabilities(availabilities)
        console.error('[Calendar Events] Create error:', error)
        ErrorToast('Failed to create court time')
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
