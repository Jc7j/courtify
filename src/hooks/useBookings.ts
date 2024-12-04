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
  createBookingWithIntent: (input: CreateBookingInput) => Promise<{ clientSecret: string }>
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

  async function createBookingWithIntent(input: CreateBookingInput) {
    console.log(' Starting createBookingWithIntent:', {
      companyId: input.companyId,
      courtNumber: input.courtNumber,
      startTime: input.startTime,
      products: {
        court: input.selectedProducts.courtProductId,
        equipment: input.selectedProducts.equipmentProductIds,
      },
    })

    try {
      // Log before updating court availability
      console.log('📝 Updating court availability to HELD...')
      const { errors: availabilityError } = await updateCourtAvailability({
        variables: {
          company_id: input.companyId,
          court_number: input.courtNumber,
          start_time: input.startTime,
          set: {
            status: AvailabilityStatus.Held,
          },
        },
      })

      if (availabilityError) {
        console.error('❌ Court availability update failed:', availabilityError)
        throw new Error('Court is no longer available')
      }
      console.log('✅ Court availability updated successfully')

      console.log('💳 Creating payment intent...')
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        console.error('❌ Payment intent creation failed:', response.status)

        // Log reversion attempt
        console.log('🔄 Reverting court availability to AVAILABLE...')
        await updateCourtAvailability({
          variables: {
            company_id: input.companyId,
            court_number: input.courtNumber,
            start_time: input.startTime,
            set: {
              status: AvailabilityStatus.Available,
            },
          },
        })

        const error = await response.json()
        throw new Error(error.message || 'Failed to create payment intent')
      }

      const data = await response.json()
      console.log('✅ Payment intent created successfully')
      return { clientSecret: data.clientSecret }
    } catch (err) {
      console.error('❌ Error in createBookingWithIntent:', err)
      throw err instanceof Error ? err : new Error('Failed to create booking')
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
    createBookingWithIntent,
  }
}
