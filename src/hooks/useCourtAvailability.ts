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
  creating: boolean
  updating: boolean
  refetch: () => Promise<void>
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
    startTime?: string
    endTime?: string
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

  // Query for availabilities
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
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

  // Create mutation
  const [createAvailabilityMutation, { loading: creating }] = useMutation(
    CREATE_COURT_AVAILABILITY,
    {
      update(cache, { data }) {
        const newAvailability = data?.insertIntocourt_availabilitiesCollection?.records?.[0]
        if (newAvailability && user?.company_id) {
          const queries = [
            {
              query: GET_COURT_AVAILABILITIES,
              variables: {
                company_id: user.company_id,
                court_number: newAvailability.court_number,
              },
            },
            {
              query: GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
              variables: { company_id: user.company_id },
            },
          ]

          queries.forEach(({ query, variables }) => {
            try {
              const existingData = cache.readQuery({ query, variables })
              if (existingData) {
                cache.updateQuery({ query, variables }, (data) => ({
                  ...data,
                  court_availabilitiesCollection: {
                    ...data.court_availabilitiesCollection,
                    edges: [
                      ...data.court_availabilitiesCollection.edges,
                      { node: newAvailability },
                    ],
                  },
                }))
              }
            } catch (e) {
              // Query not in cache, skip update
            }
          })
        }
      },
    }
  )

  // Update mutation
  const [updateAvailabilityMutation, { loading: updating }] = useMutation(
    UPDATE_COURT_AVAILABILITY,
    {
      update(cache, { data }) {
        const updatedAvailability = data?.updatecourt_availabilitiesCollection?.records?.[0]
        if (updatedAvailability && user?.company_id) {
          cache.modify({
            fields: {
              court_availabilitiesCollection(existingAvailabilities = { edges: [] }) {
                return {
                  ...existingAvailabilities,
                  edges: existingAvailabilities.edges.map((edge: any) =>
                    edge.node.court_number === updatedAvailability.court_number &&
                    edge.node.start_time === updatedAvailability.start_time
                      ? { ...edge, node: updatedAvailability }
                      : edge
                  ),
                }
              },
            },
          })
        }
      },
    }
  )

  async function createAvailability({
    courtNumber,
    startTime,
    endTime,
    status = 'available',
  }: CreateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication and company required')
    }

    try {
      const { data } = await createAvailabilityMutation({
        variables: {
          objects: [
            {
              company_id: user.company_id,
              court_number: courtNumber,
              start_time: startTime, // Use original ISO string
              end_time: endTime, // Use original ISO string
              status,
            },
          ],
        },
      })

      const newAvailability = data?.insertIntocourt_availabilitiesCollection?.records?.[0]
      if (!newAvailability) {
        throw new Error('Failed to create availability')
      }

      return newAvailability
    } catch (err) {
      console.error('Detailed creation error:', err)
      throw err instanceof Error ? err : new Error('Failed to create availability')
    }
  }

  async function updateAvailability({
    courtNumber,
    startTime,
    update,
  }: UpdateAvailabilityInput): Promise<CourtAvailability> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication and company required')
    }

    if (!update.status && !update.startTime && !update.endTime) {
      throw new Error('At least one update field must be provided')
    }

    try {
      const { data } = await updateAvailabilityMutation({
        variables: {
          company_id: user.company_id,
          court_number: courtNumber,
          start_time: startTime,
          set: {
            ...(update.status && { status: update.status }),
            ...(update.startTime && { start_time: update.startTime }),
            ...(update.endTime && { end_time: update.endTime }),
            updated_at: new Date().toISOString(),
          },
        },
      })

      const updatedAvailability = data?.updatecourt_availabilitiesCollection?.records?.[0]
      if (!updatedAvailability) {
        throw new Error('Failed to update availability')
      }

      return updatedAvailability
    } catch (err) {
      console.error('Error in updateAvailability:', err)
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
    creating,
    updating,
    refetch: refetch as unknown as () => Promise<void>,
  }
}
