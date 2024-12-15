'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_COMPLETED_BOOKINGS } from '@/gql/queries/booking'
import { UPDATE_COURT_AVAILABILITY } from '@/gql/mutations/court-availability'
import { useUserStore } from '@/stores/useUserStore'
import type { Booking, CompanyProduct } from '@/types/graphql'
import { AvailabilityStatus, BookingStatus, PaymentStatus } from '@/types/graphql'
import { CREATE_BOOKING } from '@/gql/mutations/booking'

import { useGuestStore } from '@/stores/useGuestStore'

type ProductInfo = Pick<CompanyProduct, 'id' | 'name' | 'price_amount' | 'type'>

export interface CreatePaymentIntentInput {
  companyId: string
  courtNumber: number
  startTime: string
  endTime: string
  guestInfo: {
    name: string
    email: string
    phone: string
    net_height: string
  }
  selectedProducts: {
    courtProduct: ProductInfo
    equipmentProducts: ProductInfo[]
  }
}

interface UseBookingsReturn {
  completedBookings: Booking[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createPaymentIntent: (input: CreatePaymentIntentInput) => Promise<{
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

  async function createPaymentIntent(input: CreatePaymentIntentInput) {
    try {
      const response = await fetch('/api/stripe/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment intent')
      }

      return response.json()
    } catch (err) {
      console.error('Failed to create payment intent:', err)
      throw err
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
            // Only include minimal initial metadata
            metadata: JSON.stringify({
              initialized_at: new Date().toISOString(),
              status: 'pending_payment',
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
      console.error('Failed to create booking:', err)
      throw err
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
