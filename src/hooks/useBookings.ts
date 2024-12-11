'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_COMPLETED_BOOKINGS } from '@/gql/queries/booking'
import { UPDATE_COURT_AVAILABILITY } from '@/gql/mutations/court-availability'
import { useUserStore } from '@/stores/useUserStore'
import type { Booking } from '@/types/graphql'
import { GuestInfo } from '@/components/booking/GuestInfoForm'
import { AvailabilityStatus, BookingStatus, PaymentStatus } from '@/types/graphql'
import { CREATE_BOOKING } from '@/gql/mutations/booking'

import { useGuestStore } from '@/stores/useGuestStore'
import dayjs from 'dayjs'

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
    paymentIntentId: string
    amount: number
  }>
  confirmPaymentIntentAndBook: (companyId: string) => Promise<void>
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
  const [createBooking] = useMutation(CREATE_BOOKING)

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
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        amount: data.amount,
      }
    } catch (err) {
      console.error('❌ Error in createPaymentIntent:', err)
      throw err instanceof Error ? err : new Error('Failed to create booking')
    }
  }

  async function confirmPaymentIntentAndBook(companyId: string) {
    const state = useGuestStore.getState()
    if (!state.selectedAvailability || !state.guestInfo || !state.paymentIntent) {
      throw new Error('Missing booking information')
    }

    try {
      // 1. Create initial booking record with pending status
      const { data: bookingData } = await createBooking({
        variables: {
          input: {
            company_id: companyId,
            court_number: state.selectedAvailability.court_number,
            start_time: state.selectedAvailability.start_time,
            customer_email: state.guestInfo.email,
            customer_name: state.guestInfo.name,
            customer_phone: state.guestInfo.phone || null,
            status: BookingStatus.Pending,
            payment_status: PaymentStatus.Processing,
            stripe_payment_intent_id: state.paymentIntent.paymentIntentId,
            amount_total: state.paymentIntent.amount,
            currency: 'usd',
            metadata: JSON.stringify({
              court_details: {
                end_time: state.selectedAvailability.end_time,
                duration_hours: dayjs(state.selectedAvailability.end_time).diff(
                  dayjs(state.selectedAvailability.start_time),
                  'hour',
                  true
                ),
              },
              customer_preferences: {
                net_height: state.guestInfo.net_height,
              },
              products: {
                court_product: state.guestInfo.selectedCourtProduct,
                equipment: state.guestInfo.selectedEquipment,
              },
              booking_flow: {
                created_from: 'guest_checkout',
                created_at: new Date().toISOString(),
              },
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      })

      if (!bookingData?.insertIntobookingsCollection?.records?.[0]) {
        throw new Error('Failed to create booking record')
      }

      // 2. Update court availability to booked
      await updateCourtAvailability({
        variables: {
          company_id: companyId,
          court_number: state.selectedAvailability.court_number,
          start_time: state.selectedAvailability.start_time,
          set: { status: AvailabilityStatus.Booked },
        },
      })

      return bookingData.insertIntobookingsCollection.records[0]
    } catch (err) {
      console.error('❌ Error in confirmPaymentIntentAndBook:', err)

      // Revert court availability if booking fails
      try {
        await updateCourtAvailability({
          variables: {
            company_id: companyId,
            court_number: state.selectedAvailability.court_number,
            start_time: state.selectedAvailability.start_time,
            set: { status: AvailabilityStatus.Available },
          },
        })
      } catch (revertError) {
        console.error('Failed to revert court availability:', revertError)
      }

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
