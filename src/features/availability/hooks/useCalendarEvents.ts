import dayjs from 'dayjs'
import { useCallback } from 'react'

import { ErrorToast, SuccessToast, WarningToast, InfoToast } from '@/shared/components/ui'
import { AvailabilityStatus, type EnhancedAvailability } from '@/shared/types/graphql'

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
        const selectedStart = dayjs(selectInfo.startStr)
        const resourceId = parseInt(selectInfo.resource?.id || '0', 10)

        if (!resourceId) {
          ErrorToast('Please select a court')
          return
        }

        if (selectedStart.isBefore(dayjs())) {
          WarningToast('Cannot create availability in the past')
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

        SuccessToast('Court availability created successfully')
      } catch (error) {
        // Revert optimistic update
        setAvailabilities(availabilities)

        console.error('[Calendar Events] Create error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          selectInfo,
        })
        ErrorToast('Failed to create court availability')
      }
    },
    [availabilities, createAvailability, facilityId, setAvailabilities]
  )

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      try {
        const availability = availabilities.find(
          (a) => `${a.court_number}-${a.start_time}` === clickInfo.event.id
        )
        if (availability) onEventClick(availability)
      } catch (error) {
        console.error('[Calendar Events] Click error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          clickInfo,
        })
        ErrorToast('Failed to handle event click')
      }
    },
    [availabilities, onEventClick]
  )

  const handleEventDrop = useCallback(
    async (dropInfo: EventDropArg) => {
      const { event, oldEvent } = dropInfo
      try {
        const availability = availabilities.find(
          (a) => `${a.court_number}-${a.start_time}` === event.id
        )

        if (!availability) {
          InfoToast('No changes needed - availability not found')
          return
        }

        if (availability.status === AvailabilityStatus.Booked) {
          dropInfo.revert()
          WarningToast('Cannot move booked slots')
          return
        }

        if (dayjs(event.start).isBefore(dayjs())) {
          dropInfo.revert()
          WarningToast('Cannot move availability to past dates')
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

        // Optimistic update
        setAvailabilities(
          availabilities.map((a) =>
            a.court_number === oldCourtNumber && a.start_time === availability.start_time
              ? updatedAvailability
              : a
          )
        )

        await updateAvailability({
          facilityId,
          courtNumber: oldCourtNumber,
          startTime: oldEvent.start?.toISOString() || '',
          update: {
            court_number: newCourtNumber,
            start_time: event.start?.toISOString() || '',
            end_time: event.end?.toISOString() || '',
          },
        })

        SuccessToast('Court time moved successfully')
      } catch (error) {
        // Revert optimistic update
        setAvailabilities(availabilities)
        dropInfo.revert()

        console.error('[Calendar Events] Drop error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          dropInfo,
        })
        ErrorToast('Failed to move court time')
      }
    },
    [availabilities, updateAvailability, facilityId, setAvailabilities]
  )

  const handleEventResize = useCallback(
    async (resizeInfo: EventResizeDoneArg) => {
      const { event, oldEvent } = resizeInfo
      try {
        const availability = availabilities.find(
          (a) => `${a.court_number}-${a.start_time}` === event.id
        )

        if (!availability) {
          InfoToast('No changes needed - availability not found')
          return
        }

        if (availability.status === AvailabilityStatus.Booked) {
          resizeInfo.revert()
          WarningToast('Cannot resize booked slots')
          return
        }

        const updatedAvailability = {
          ...availability,
          start_time: event.start?.toISOString() || '',
          end_time: event.end?.toISOString() || '',
        }

        // Optimistic update
        setAvailabilities(
          availabilities.map((a) =>
            a.court_number === availability.court_number && a.start_time === availability.start_time
              ? updatedAvailability
              : a
          )
        )

        await updateAvailability({
          facilityId,
          courtNumber: availability.court_number,
          startTime: oldEvent.start?.toISOString() || '',
          update: {
            start_time: event.start?.toISOString() || '',
            end_time: event.end?.toISOString() || '',
          },
        })

        SuccessToast('Court time duration updated successfully')
      } catch (error) {
        // Revert optimistic update
        setAvailabilities(availabilities)
        resizeInfo.revert()

        console.error('[Calendar Events] Resize error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          resizeInfo,
        })
        ErrorToast('Failed to update court time duration')
      }
    },
    [availabilities, updateAvailability, facilityId, setAvailabilities]
  )

  return {
    handleSelect,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
  }
}
