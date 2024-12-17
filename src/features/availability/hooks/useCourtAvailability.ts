'use client'

import { useMutation, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useState } from 'react'

import {
  CREATE_COURT_AVAILABILITY,
  UPDATE_COURT_AVAILABILITY,
  DELETE_COURT_AVAILABILITY,
} from '@/features/availability/graphql/mutations'
import {
  GET_COURT_AVAILABILITIES,
  GET_COURT_AVAILABILITIES_BY_DATE_RANGE,
  GET_COMPANY_COURTS_AVAILABILITIES,
} from '@/features/availability/graphql/queries'

import { useUserStore } from '@/shared/stores/useUserStore'

import type {
  CourtAvailability,
  AvailabilityStatus,
  Courts,
  EnhancedAvailability,
} from '@/shared/types/graphql'

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

interface useCompanyCourtAvailabilitiesReturn {
  courts: Pick<Courts, 'court_number' | 'name'>[]
  availabilities: EnhancedAvailability[]
  loading: boolean
  error: Error | null
}

export function useCompanyCourtAvailabilities(
  companyId: string,
  startTime?: string,
  endTime?: string
): useCompanyCourtAvailabilitiesReturn {
  const [courts, setCourts] = useState<Array<{ court_number: number; name: string }>>([])

  const transformBookingMetadata = (metadata: string): Record<string, any> => {
    try {
      return JSON.parse(metadata)
    } catch (e) {
      console.error('Failed to parse booking metadata:', e)
      return {}
    }
  }

  const {
    loading: queryLoading,
    error: queryError,
    data,
  } = useQuery<CompanyAvailabilitiesData>(GET_COMPANY_COURTS_AVAILABILITIES, {
    variables: {
      company_id: companyId,
      start_time: startTime,
      end_time: endTime,
    },
    skip: !companyId || !startTime || !endTime,
    fetchPolicy: 'network-only' as const,
    onCompleted: (data) => {
      const courts = data?.courtsCollection?.edges?.map((edge) => edge.node) || []
      setCourts(courts)
    },
  })

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

  return {
    courts,
    availabilities: availabilities as EnhancedAvailability[],
    loading: queryLoading,
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
    try {
      const { data } = await updateAvailabilityMutation({
        variables: {
          company_id: input.companyId,
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
      console.error('Update failed:', err)
      throw err
    }
  }

  async function deleteAvailability(input: DeleteAvailabilityInput): Promise<void> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication required')
    }

    try {
      await deleteAvailabilityMutation({
        variables: {
          company_id: user.company_id,
          court_number: input.courtNumber,
          start_time: input.startTime,
        },
      })
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete availability')
    }
  }

  return {
    createAvailability,
    updateAvailability,
    deleteAvailability,
  }
}
