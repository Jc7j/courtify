'use client'

import { useApolloClient } from '@apollo/client'
import dayjs from 'dayjs'
import { useMemo, useCallback } from 'react'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { ErrorToast, SuccessToast, WarningToast, InfoToast } from '@/shared/components/ui'
import { AvailabilityStatus } from '@/shared/types/graphql'

import { AvailabilityClientService } from '../services/availabilityClientService'
import { AvailabilityServerService } from '../services/availabilityServerService'

import type { CourtAvailability, EnhancedAvailability, Courts } from '@/shared/types/graphql'

interface CreateAvailabilityInput {
  courtNumber: number
  startTime: string
  endTime: string
  status?: AvailabilityStatus
}

interface UpdateAvailabilityInput {
  facilityId: string
  courtNumber: number
  startTime: string
  update: {
    status?: AvailabilityStatus
    court_number?: number
    start_time?: string
    end_time?: string
  }
}

interface DeleteAvailabilityInput {
  courtNumber: number
  startTime: string
  status: AvailabilityStatus
  endTime: string
}

interface GetFacilityAvailabilitiesResponse {
  courts: Courts[]
  availabilities: EnhancedAvailability[]
}

export function useCourtAvailability() {
  const client = useApolloClient()
  const { user, isAuthenticated } = useUserStore()

  const services = useMemo(
    () => ({
      availability: new AvailabilityServerService(client),
    }),
    [client]
  )

  const getFacilityAvailabilities = useCallback(
    async (
      facilityId: string,
      start: string,
      end: string
    ): Promise<GetFacilityAvailabilitiesResponse> => {
      try {
        const { courts, availabilities } = await services.availability.getFacilityAvailabilities(
          facilityId,
          start,
          end
        )
        return { courts, availabilities: availabilities as EnhancedAvailability[] }
      } catch (error) {
        console.error('[Court Availability] Get facility availabilities error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          facilityId,
          start,
          end,
        })
        ErrorToast('Failed to load court schedule')
        throw error
      }
    },
    [services]
  )

  async function updateAvailability(input: UpdateAvailabilityInput): Promise<CourtAvailability> {
    try {
      const result = await services.availability.updateAvailability(input)

      if (input.update.status) {
        switch (input.update.status) {
          case 'held':
            InfoToast('Court is now on hold')
            break
          case 'booked':
            SuccessToast('Booking created')
            break
          case 'available':
            WarningToast('Court released back to available')
            break
          default:
            SuccessToast('Availability updated')
        }
      } else {
        SuccessToast('Availability updated')
      }

      return result
    } catch (error) {
      console.error('[Court Availability] Update error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        input,
      })

      if (error instanceof Error) {
        if (error.message.includes('overlapping')) {
          ErrorToast('This time slot conflicts with another booking')
        } else if (error.message.includes('permission')) {
          ErrorToast('You do not have permission to update this court')
        } else {
          ErrorToast('Failed to update court availability')
        }
      } else {
        ErrorToast('Failed to update court availability')
      }

      throw error
    }
  }

  async function createAvailability(input: CreateAvailabilityInput): Promise<CourtAvailability> {
    try {
      if (!isAuthenticated || !user?.facility_id) {
        ErrorToast('Authentication required')
        throw new Error('Authentication required')
      }

      const validation = AvailabilityClientService.validateTimeRange(input.startTime, input.endTime)
      if (!validation.isValid) {
        WarningToast(validation.error || 'Invalid time range')
        throw new Error(validation.error)
      }

      const formattedInput = AvailabilityClientService.formatAvailabilityInput(
        user.facility_id,
        input.courtNumber,
        input.startTime,
        input.endTime,
        input.status
      )

      const result = await services.availability.createAvailability(formattedInput)
      SuccessToast('Availability created')
      return result
    } catch (error) {
      console.error('[Court Availability] Create error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        input,
      })

      if (error instanceof Error) {
        if (error.message.includes('overlapping')) {
          ErrorToast('This time slot conflicts with another availability')
        } else {
          ErrorToast(error.message)
        }
      } else {
        ErrorToast('Failed to create court availability')
      }

      throw error
    }
  }

  async function deleteAvailability(input: DeleteAvailabilityInput): Promise<void> {
    try {
      if (!isAuthenticated || !user?.facility_id) {
        ErrorToast('Authentication required')
        throw new Error('Authentication required')
      }

      if (input.status !== AvailabilityStatus.Available) {
        ErrorToast('Only available slots can be deleted')
        throw new Error('Only available slots can be deleted')
      }

      if (dayjs(input.endTime).isBefore(dayjs())) {
        ErrorToast('Cannot delete past availabilities')
        throw new Error('Cannot delete past availabilities')
      }

      await services.availability.deleteAvailability({
        facilityId: user.facility_id,
        courtNumber: input.courtNumber,
        startTime: input.startTime,
      })

      SuccessToast('Court availability deleted successfully')
    } catch (error) {
      console.error('[Court Availability] Delete error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        input,
      })

      throw error
    }
  }

  return {
    createAvailability,
    updateAvailability,
    deleteAvailability,
    getFacilityAvailabilities,
  }
}
