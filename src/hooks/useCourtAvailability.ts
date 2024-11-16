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
import { useUser } from '@/providers/UserProvider'
import type {
  CourtAvailability,
  CourtAvailabilityConnection,
  AvailabilityStatus,
} from '@/types/graphql'
import { useState } from 'react'
import dayjs from 'dayjs'

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
  deleteAvailability: (input: DeleteAvailabilityInput) => Promise<void>
}

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
  court_availabilitiesCollection: CourtAvailabilityConnection
}

interface UseCompanyAvailabilitiesReturn {
  courts: Array<{ court_number: number; name: string }>
  availabilities: CourtAvailability[]
  loading: boolean
  error: Error | null
}

export function useCompanyAvailabilities(
  startTime?: string,
  endTime?: string
): UseCompanyAvailabilitiesReturn {
  const { user, loading: userLoading, isAuthenticated } = useUser()
  const [localAvailabilities, setLocalAvailabilities] = useState<CourtAvailability[]>([])
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

  const { loading: queryLoading, error: queryError } = useQuery<CompanyAvailabilitiesData>(
    GET_COMPANY_COURTS_AVAILABILITIES,
    {
      ...queryOptions,
      onCompleted: (data) => {
        const availabilities =
          data?.court_availabilitiesCollection?.edges?.map(
            (edge) => edge.node as CourtAvailability
          ) || []
        const courts = data?.courtsCollection?.edges?.map((edge) => edge.node) || []

        setLocalAvailabilities(availabilities)
        setCourts(courts)
      },
    }
  )

  return {
    courts,
    availabilities: localAvailabilities,
    loading: userLoading || queryLoading,
    error: queryError ? new Error(queryError.message) : null,
  }
}
export function useCourtAvailability({
  courtNumber,
  startTime,
  endTime,
}: UseCourtAvailabilityProps = {}): UseCourtAvailabilityReturn {
  const { user, loading: userLoading, isAuthenticated } = useUser()
  const [localAvailabilities, setLocalAvailabilities] = useState<CourtAvailability[]>([])

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

  const [createAvailabilityMutation] = useMutation(CREATE_COURT_AVAILABILITY, {
    refetchQueries: [
      {
        query: courtNumber ? GET_COURT_AVAILABILITIES : GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
        variables: queryOptions.variables,
      },
    ],
    awaitRefetchQueries: true,
  })

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

  async function createAvailability(input: CreateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    // Validate time constraints
    const startTime = dayjs(input.startTime)
    const endTime = dayjs(input.endTime)
    const now = dayjs()

    // Allow creating availability if it's today or in the future
    if (startTime.isBefore(now.startOf('day'))) {
      throw new Error('Cannot create availability for past dates')
    }

    // Check if the end time is before start time
    if (endTime.isBefore(startTime)) {
      throw new Error('End time must be after start time')
    }

    const newAvailability: CourtAvailability = {
      nodeId: `temp-${Date.now()}`,
      company_id: user.company_id,
      court_number: input.courtNumber,
      start_time: input.startTime,
      end_time: input.endTime,
      status: input.status as AvailabilityStatus.Available,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optimistic update
    setLocalAvailabilities((prev) => [...prev, newAvailability])

    try {
      const { data } = await createAvailabilityMutation({
        variables: {
          objects: [
            {
              company_id: user.company_id,
              court_number: input.courtNumber,
              start_time: input.startTime,
              end_time: input.endTime,
              status: input.status as AvailabilityStatus.Available,
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
      setLocalAvailabilities((prev) => prev.filter((a) => a.nodeId !== newAvailability.nodeId))
      throw err instanceof Error ? err : new Error('Failed to create availability')
    }
  }

  async function updateAvailability(input: UpdateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    // Find the availability to update
    const existingAvailability = localAvailabilities.find(
      (a) => a.court_number === input.courtNumber && a.start_time === input.startTime
    )

    if (!existingAvailability) {
      throw new Error('Availability not found')
    }

    try {
      const { data } = await updateAvailabilityMutation({
        variables: {
          company_id: user.company_id,
          court_number: input.courtNumber,
          start_time: input.startTime,
          set: input.update,
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
    loading: userLoading || queryLoading,
    error: queryError ? new Error(queryError.message) : null,
    createAvailability,
    updateAvailability,
    deleteAvailability,
  }
}
