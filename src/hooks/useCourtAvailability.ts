'use client'

import { useMutation, useQuery } from '@apollo/client'
import {
  GET_COURT_AVAILABILITIES,
  GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
  GET_COMPANY_COURTS_AVAILABILITIES,
} from '@/gql/queries/court-availability'
import {
  CREATE_COURT_AVAILABILITY,
  UPDATE_COURT_AVAILABILITY,
  DELETE_COURT_AVAILABILITY,
} from '@/gql/mutations/court-availability'
import { useUserStore } from '@/stores/useUserStore'
import type {
  CourtAvailability,
  CourtAvailabilityConnection,
  AvailabilityStatus,
  Courts,
  EnhancedAvailability,
} from '@/types/graphql'
import { useState } from 'react'
import dayjs from 'dayjs'

interface CreateAvailabilityInput {
  courtNumber: number
  startTime: string
  endTime: string
  status?: AvailabilityStatus
}

interface UpdateAvailabilityInput {
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

interface AvailabilitiesQueryData {
  court_availabilitiesCollection: CourtAvailabilityConnection
}

interface CompanyAvailabilitiesData {
  courtsCollection: {
    edges: Array<{
      node: {
        court_number: number
        name: string
      }
    }>
  }
  court_availabilitiesCollection: {
    edges: Array<{
      node: {
        nodeId: string
        company_id: string
        court_number: number
        start_time: string
        end_time: string
        status: AvailabilityStatus
        created_at: string
        updated_at: string
        booking?: {
          edges: Array<{
            node: {
              id: string
              customer_name: string
              customer_email: string
              customer_phone: string | null
              status: string
              payment_status: string
              amount_total: number
              amount_paid: number
              currency: string
              metadata: string
            }
          }>
        }
      }
    }>
  }
}

interface UseCompanyAvailabilitiesReturn {
  courts: Pick<Courts, 'court_number' | 'name'>[]
  availabilities: EnhancedAvailability[]
  loading: boolean
  error: Error | null
}

export function useCompanyAvailabilities(
  startTime?: string,
  endTime?: string
): UseCompanyAvailabilitiesReturn {
  const { user, isAuthenticated, isLoading } = useUserStore()
  const [localAvailabilities, setLocalAvailabilities] = useState<EnhancedAvailability[]>([])
  const [courts, setCourts] = useState<Array<{ court_number: number; name: string }>>([])

  const queryOptions = {
    variables: {
      company_id: user?.company_id,
      start_time: startTime,
      end_time: endTime,
    },
    skip: !isAuthenticated || !user?.company_id || !startTime || !endTime,
    fetchPolicy: 'network-only' as const,
  }

  const transformBookingMetadata = (metadata: string): Record<string, any> => {
    try {
      return JSON.parse(metadata)
    } catch (e) {
      console.error('Failed to parse booking metadata:', e)
      return {}
    }
  }

  const { loading: queryLoading, error: queryError } = useQuery<CompanyAvailabilitiesData>(
    GET_COMPANY_COURTS_AVAILABILITIES,
    {
      ...queryOptions,
      onCompleted: (data) => {
        const availabilities =
          data?.court_availabilitiesCollection?.edges?.map((edge) => {
            const availability = edge.node
            const bookingEdge = availability.booking?.edges[0]

            if (!bookingEdge) return { ...availability, booking: null }

            return {
              ...availability,
              booking: {
                ...bookingEdge.node,
                metadata: transformBookingMetadata(bookingEdge.node.metadata),
              },
            }
          }) || []

        const courts = data?.courtsCollection?.edges?.map((edge) => edge.node) || []

        setLocalAvailabilities(availabilities)
        setCourts(courts)
      },
    }
  )

  return {
    courts,
    availabilities: localAvailabilities,
    loading: isLoading || queryLoading,
    error: queryError ? new Error(queryError.message) : null,
  }
}

export function useCourtAvailability({
  courtNumber,
  startTime,
  endTime,
}: {
  courtNumber?: number
  startTime?: string
  endTime?: string
} = {}) {
  const { user, isAuthenticated } = useUserStore()
  const [localAvailabilities, setLocalAvailabilities] = useState<CourtAvailability[]>([])

  const [createAvailabilityMutation] = useMutation(CREATE_COURT_AVAILABILITY, {
    refetchQueries: ['GetCompanyAvailabilities'],
    awaitRefetchQueries: true,
  })

  async function createAvailability(input: CreateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    const startDateTime = dayjs(input.startTime)
    const endDateTime = dayjs(input.endTime)
    const currentTime = dayjs()

    if (startDateTime.isBefore(currentTime.startOf('day'))) {
      throw new Error('Cannot create availability for past dates')
    }

    if (endDateTime.isBefore(startDateTime)) {
      throw new Error('End time must be after start time')
    }

    const timestamp = new Date().toISOString()

    try {
      const { data } = await createAvailabilityMutation({
        variables: {
          objects: [
            {
              company_id: user.company_id,
              court_number: input.courtNumber,
              start_time: startDateTime.format(), // Will be stored as TIMESTAMPTZ
              end_time: endDateTime.format(),
              status: input.status as AvailabilityStatus,
              created_at: timestamp,
              updated_at: timestamp,
            },
          ],
        },
      })

      const createdAvailability = data?.insertIntocourt_availabilitiesCollection?.records?.[0]
      if (!createdAvailability) {
        throw new Error('Failed to create availability')
      }

      return createdAvailability
    } catch (err) {
      console.error('Failed to create availability:', err)
      throw err instanceof Error ? err : new Error('Failed to create availability')
    }
  }

  const queryOptions = {
    variables: {
      company_id: user?.company_id,
      court_number: courtNumber,
      start_time: startTime,
      end_time: endTime,
    },
    skip: !isAuthenticated || !user?.company_id || !startTime || !endTime,
  }

  const { loading: queryLoading, error: queryError } = useQuery<AvailabilitiesQueryData>(
    courtNumber ? GET_COURT_AVAILABILITIES : GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
    {
      ...queryOptions,
      fetchPolicy: 'cache-and-network',
      onCompleted: (data) => {
        const availabilities =
          data?.court_availabilitiesCollection?.edges?.map(
            (edge) => edge.node as CourtAvailability
          ) || []
        setLocalAvailabilities(availabilities)
      },
    }
  )

  const [updateAvailabilityMutation] = useMutation(UPDATE_COURT_AVAILABILITY, {
    refetchQueries: [
      {
        query: courtNumber ? GET_COURT_AVAILABILITIES : GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
        variables: queryOptions.variables,
      },
    ],
    awaitRefetchQueries: true,
  })

  const [deleteAvailabilityMutation] = useMutation(DELETE_COURT_AVAILABILITY, {
    refetchQueries: [
      {
        query: courtNumber ? GET_COURT_AVAILABILITIES : GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
        variables: queryOptions.variables,
      },
    ],
    awaitRefetchQueries: true,
  })

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
            ...input.update,
            updated_at: new Date().toISOString(),
          },
        },
      })

      const serverAvailability = data?.updatecourt_availabilitiesCollection?.records?.[0]
      if (!serverAvailability) {
        throw new Error('Failed to update availability')
      }

      // Update local state with server response
      setLocalAvailabilities((prev) =>
        prev.map((a) =>
          a.court_number === input.courtNumber && a.start_time === input.startTime
            ? serverAvailability
            : a
        )
      )

      return serverAvailability
    } catch (err) {
      console.error('Update failed:', err)
      throw err
    }
  }

  async function deleteAvailability(input: DeleteAvailabilityInput): Promise<void> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    const availabilityToDelete = localAvailabilities.find(
      (a) => a.court_number === input.courtNumber && a.start_time === input.startTime
    )

    if (!availabilityToDelete) {
      throw new Error('Availability not found')
    }

    // Allow deleting if it's today or in the future
    if (dayjs(availabilityToDelete.start_time).isBefore(dayjs().startOf('day'))) {
      throw new Error('Cannot delete past availability')
    }

    // Optimistic update
    setLocalAvailabilities((prev) =>
      prev.filter(
        (a) => !(a.court_number === input.courtNumber && a.start_time === input.startTime)
      )
    )

    try {
      await deleteAvailabilityMutation({
        variables: {
          company_id: user.company_id,
          court_number: input.courtNumber,
          start_time: input.startTime,
        },
      })
    } catch (err) {
      // Rollback optimistic update if deletion fails
      if (availabilityToDelete) {
        setLocalAvailabilities((prev) => [...prev, availabilityToDelete])
      }
      throw err instanceof Error ? err : new Error('Failed to delete availability')
    }
  }

  return {
    availabilities: localAvailabilities,
    loading: queryLoading,
    error: queryError ? new Error(queryError.message) : null,
    createAvailability,
    updateAvailability,
    deleteAvailability,
  }
}
