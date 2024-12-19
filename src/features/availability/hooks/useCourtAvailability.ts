'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useMemo } from 'react'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { AvailabilityClientService } from '../services/availabilityClientService'
import { AvailabilityServerService } from '../services/availabilityServerService'

import type { CourtAvailability, AvailabilityStatus } from '@/shared/types/graphql'

interface CreateAvailabilityInput {
  courtNumber: number
  startTime: string
  endTime: string
  status?: AvailabilityStatus
}

interface UpdateAvailabilityInput {
  companyId: string
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
}

export function useCourtAvailability() {
  const client = useApolloClient()
  const { user, isAuthenticated } = useUserStore()
  const availabilityService = useMemo(() => new AvailabilityServerService(client), [client])

  const createAvailability = useCallback(
    async (input: CreateAvailabilityInput): Promise<CourtAvailability> => {
      if (!isAuthenticated || !user?.company_id) {
        throw new Error('Authentication required')
      }

      const validation = AvailabilityClientService.validateTimeRange(input.startTime, input.endTime)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      const formattedInput = AvailabilityClientService.formatAvailabilityInput(
        user.company_id,
        input.courtNumber,
        input.startTime,
        input.endTime,
        input.status
      )

      return availabilityService.createAvailability(formattedInput)
    },
    [isAuthenticated, user?.company_id, availabilityService]
  )

  const updateAvailability = useCallback(
    async (input: UpdateAvailabilityInput): Promise<CourtAvailability> => {
      return availabilityService.updateAvailability(input)
    },
    [availabilityService]
  )

  const deleteAvailability = useCallback(
    async (input: DeleteAvailabilityInput): Promise<void> => {
      if (!isAuthenticated || !user?.company_id) {
        throw new Error('Authentication required')
      }

      return availabilityService.deleteAvailability({
        companyId: user.company_id,
        ...input,
      })
    },
    [isAuthenticated, user?.company_id, availabilityService]
  )

  return {
    createAvailability,
    updateAvailability,
    deleteAvailability,
  }
}
