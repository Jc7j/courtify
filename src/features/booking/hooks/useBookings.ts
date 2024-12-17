'use client'

import { useMutation } from '@apollo/client'

import { UPDATE_COURT_AVAILABILITY } from '@/features/availability/graphql/mutations'
import { CREATE_BOOKING } from '@/features/booking/graphql/mutations'

import { useBookingStore } from '@/shared/stores/useBookingStore'
import { AvailabilityStatus, BookingStatus, PaymentStatus } from '@/shared/types/graphql'

import type { CompanyProduct } from '@/shared/types/graphql'

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
  createPaymentIntent: (input: CreatePaymentIntentInput) => Promise<{
    clientSecret: string
    paymentIntentId: string
    amount: number
  }>
  confirmPaymentIntentAndBook: (companyId: string) => Promise<void>
}

export function useBookings(): UseBookingsReturn {
  const [updateCourtAvailability] = useMutation(UPDATE_COURT_AVAILABILITY)
  const [createBooking] = useMutation(CREATE_BOOKING)

  async function createPaymentIntent(input: CreatePaymentIntentInput) {
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
    const state = useBookingStore.getState()
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

  return {
    createPaymentIntent,
    confirmPaymentIntentAndBook,
  }
}
