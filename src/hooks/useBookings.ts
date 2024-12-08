'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_COMPLETED_BOOKINGS } from '@/gql/queries/booking'
import { UPDATE_COURT_AVAILABILITY } from '@/gql/mutations/court-availability'
import { useUserStore } from '@/stores/useUserStore'
import type { Booking } from '@/types/graphql'
import { GuestInfo } from '@/components/booking/GuestInfoForm'
import { AvailabilityStatus } from '@/types/graphql'

interface CreateBookingInput {
  companyId: string
  courtNumber: number
  startTime: string
  endTime: string
  guestInfo: GuestInfo
  selectedProducts: {
    courtProductId: string
    equipmentProductIds: string[]
  }
}

interface UseBookingsReturn {
  completedBookings: Booking[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createPaymentIntent: (input: CreateBookingInput) => Promise<{
    clientSecret: string
    amount: number
  }>
  confirmPaymentItentAndBook: () => Promise<void>
}

export function useBookings(): UseBookingsReturn {
  const { user, isLoading } = useUserStore()

  const {
    data,
    loading: queryLoading,
    error,
    refetch: refetchQuery,
  } = useQuery(GET_COMPLETED_BOOKINGS, {
    variables: { company_id: user?.company_id },
    skip: !user?.company_id,
    fetchPolicy: 'cache-and-network',
  })

  const [updateCourtAvailability] = useMutation(UPDATE_COURT_AVAILABILITY)

  const completedBookings =
    data?.bookingsCollection?.edges?.map((edge: { node: Booking }) => edge.node) || []

  async function createPaymentIntent(input: CreateBookingInput) {
    try {
      const { errors: availabilityError } = await updateCourtAvailability({
        variables: {
          company_id: input.companyId,
          court_number: input.courtNumber,
          start_time: input.startTime,
          end_time: input.endTime,
          set: {
            status: AvailabilityStatus.Held,
          },
        },
      })

      if (availabilityError) {
        console.error('❌ Court availability update failed:', availabilityError)
        throw new Error('Court is no longer available')
      }

      const response = await fetch('/api/stripe/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        console.error('❌ Payment intent creation failed:', response.status)

        await updateCourtAvailability({
          variables: {
            company_id: input.companyId,
            court_number: input.courtNumber,
            start_time: input.startTime,
            end_time: input.endTime,
            set: {
              status: AvailabilityStatus.Available,
            },
          },
        })

        const error = await response.json()
        throw new Error(error.message || 'Failed to create payment intent')
      }

      const data = await response.json()
      return { clientSecret: data.clientSecret, amount: data.amount }
    } catch (err) {
      console.error('❌ Error in createPaymentIntent:', err)
      throw err instanceof Error ? err : new Error('Failed to create booking')
    }
  }

  async function confirmPaymentIntentAndBook() {
    try {
      console.log('💳 Confirming payment intent and booking...')
    } catch (err) {
      console.error('❌ Error in confirmPaymentIntentAndBook:', err)
      throw err instanceof Error ? err : new Error('Failed to confirm payment intent and book')
    }
  }

  async function refetch() {
    try {
      await refetchQuery()
    } catch (err) {
      console.error('Error refetching bookings:', err)
    }
  }

  return {
    completedBookings,
    loading: isLoading || queryLoading,
    error: error ? new Error(error.message) : null,
    refetch,
    createPaymentIntent,
    confirmPaymentIntentAndBook,
  }
}
