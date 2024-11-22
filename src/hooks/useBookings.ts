'use client'

import { useQuery } from '@apollo/client'
import { GET_COMPLETED_BOOKINGS } from '@/gql/queries/booking'
import { useUser } from '@/providers/UserProvider'
import { Booking } from '@/types/graphql'
interface UseBookingsReturn {
  completedBookings: Booking[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useBookings(): UseBookingsReturn {
  const { user } = useUser()

  const {
    data,
    loading,
    error,
    refetch: refetchQuery,
  } = useQuery(GET_COMPLETED_BOOKINGS, {
    variables: { company_id: user?.company_id },
    skip: !user?.company_id,
    fetchPolicy: 'cache-and-network',
  })

  const completedBookings =
    data?.bookingsCollection?.edges?.map((edge: { node: Booking }) => edge.node) || []

  const refetch = async () => {
    try {
      await refetchQuery()
    } catch (err) {
      console.error('Error refetching bookings:', err)
    }
  }

  return {
    completedBookings,
    loading,
    error: error ? new Error(error.message) : null,
    refetch,
  }
}
