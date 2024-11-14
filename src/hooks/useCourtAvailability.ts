'use client'

import { useMutation, useQuery } from '@apollo/client'
import {
  GET_COURT_AVAILABILITIES,
  GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
} from '@/gql/queries/court-availability'
import {
  CREATE_COURT_AVAILABILITY,
  UPDATE_COURT_AVAILABILITY,
} from '@/gql/mutations/court-availability'
import { useUser } from '@/providers/UserProvider'
import type { CourtAvailability, CourtAvailabilityConnection } from '@/types/graphql'

interface UseCourtAvailabilityProps {
  courtNumber?: number
  startTime?: string
  endTime?: string
}

interface UseCourtAvailabilityReturn {
  availabilities: CourtAvailability[]
  loading: boolean
  error: Error | null
  createAvailability: (input: CreateAvailabilityInput) => Promise<CourtAvailability>
  updateAvailability: (input: UpdateAvailabilityInput) => Promise<CourtAvailability>
}

interface CreateAvailabilityInput {
  courtNumber: number
  startTime: string
  endTime: string
  status?: 'available' | 'booked'
}

interface UpdateAvailabilityInput {
  courtNumber: number
  startTime: string
  update: {
    status?: 'available' | 'booked'
  }
}

interface AvailabilitiesQueryData {
  court_availabilitiesCollection: CourtAvailabilityConnection
}

export function useCourtAvailability({
  courtNumber,
  startTime,
  endTime,
}: UseCourtAvailabilityProps = {}): UseCourtAvailabilityReturn {
  const { user, loading: userLoading, isAuthenticated } = useUser()

  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery<AvailabilitiesQueryData>(
    courtNumber ? GET_COURT_AVAILABILITIES : GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
    {
      variables: {
        company_id: user?.company_id,
        court_number: courtNumber,
        start_time: startTime,
        end_time: endTime,
      },
      skip: !isAuthenticated || !user?.company_id || !startTime || !endTime,
      fetchPolicy: 'cache-and-network',
    }
  )

  const [createAvailabilityMutation] = useMutation(CREATE_COURT_AVAILABILITY)
  const [updateAvailabilityMutation] = useMutation(UPDATE_COURT_AVAILABILITY)

  async function createAvailability(input: CreateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    try {
      const { data } = await createAvailabilityMutation({
        variables: {
          objects: [
            {
              company_id: user.company_id,
              court_number: input.courtNumber,
              start_time: input.startTime,
              end_time: input.endTime,
              status: input.status || 'available',
            },
          ],
        },
      })

      return data?.insertIntocourt_availabilitiesCollection?.records?.[0]
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create availability')
    }
  }

  async function updateAvailability(input: UpdateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    try {
      const { data } = await updateAvailabilityMutation({
        variables: {
          company_id: user.company_id,
          court_number: input.courtNumber,
          start_time: input.startTime,
          set: {
            status: input.update.status,
            updated_at: new Date().toISOString(),
          },
        },
      })

      return data?.updatecourt_availabilitiesCollection?.records?.[0]
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update availability')
    }
  }

  return {
    availabilities:
      data?.court_availabilitiesCollection?.edges?.map((edge) => edge.node as CourtAvailability) ||
      [],
    loading: userLoading || queryLoading,
    error: queryError ? new Error(queryError.message) : null,
    createAvailability,
    updateAvailability,
  }
}
