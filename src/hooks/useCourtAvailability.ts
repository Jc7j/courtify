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
import type {
  CourtAvailability,
  CourtAvailabilityConnection,
  AvailabilityStatus,
} from '@/types/graphql'
import { useState } from 'react'

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
  status?: AvailabilityStatus
}

interface UpdateAvailabilityInput {
  courtNumber: number
  startTime: string
  update: {
    status?: AvailabilityStatus
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
  const [localAvailabilities, setLocalAvailabilities] = useState<CourtAvailability[]>([])

  const { loading: queryLoading, error: queryError } = useQuery<AvailabilitiesQueryData>(
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
      onCompleted: (data) => {
        const availabilities =
          data?.court_availabilitiesCollection?.edges?.map(
            (edge) => edge.node as CourtAvailability
          ) || []
        setLocalAvailabilities(availabilities)
      },
    }
  )

  const [createAvailabilityMutation] = useMutation(CREATE_COURT_AVAILABILITY)
  const [updateAvailabilityMutation] = useMutation(UPDATE_COURT_AVAILABILITY)

  async function createAvailability(input: CreateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    const newAvailability: CourtAvailability = {
      nodeId: `temp-${Date.now()}`,
      company_id: user.company_id,
      court_number: input.courtNumber,
      start_time: input.startTime,
      end_time: input.endTime,
      status: input.status as AvailabilityStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

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
              status: input.status as AvailabilityStatus,
            },
          ],
        },
      })

      const createdAvailability = data?.insertIntocourt_availabilitiesCollection?.records?.[0]
      if (!createdAvailability) {
        throw new Error('Failed to create availability')
      }

      setLocalAvailabilities((prev) =>
        prev.map((a) => (a.nodeId === newAvailability.nodeId ? createdAvailability : a))
      )

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

    const existingAvailability = localAvailabilities.find(
      (a) => a.court_number === input.courtNumber && a.start_time === input.startTime
    )

    if (!existingAvailability) {
      throw new Error('Availability not found')
    }

    const updatedAvailability: CourtAvailability = {
      ...existingAvailability,
      ...input.update,
      updated_at: new Date().toISOString(),
    }

    setLocalAvailabilities((prev) =>
      prev.map((a) =>
        a.court_number === input.courtNumber && a.start_time === input.startTime
          ? updatedAvailability
          : a
      )
    )

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

      return serverAvailability
    } catch (err) {
      setLocalAvailabilities((prev) =>
        prev.map((a) =>
          a.court_number === input.courtNumber && a.start_time === input.startTime
            ? existingAvailability
            : a
        )
      )
      throw err instanceof Error ? err : new Error('Failed to update availability')
    }
  }

  return {
    availabilities: localAvailabilities,
    loading: userLoading || queryLoading,
    error: queryError ? new Error(queryError.message) : null,
    createAvailability,
    updateAvailability,
  }
}
