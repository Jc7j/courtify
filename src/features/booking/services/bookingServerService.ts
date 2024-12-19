import { ApolloClient } from '@apollo/client'

import { BookingStatus, PaymentStatus } from '@/shared/types/graphql'

import { CREATE_BOOKING } from '../graphql/mutations'
import { GET_COMPLETED_BOOKINGS, GET_BOOKING_AVAILABILITIES } from '../graphql/queries'

import type { CreatePaymentIntentInput, PaymentIntentResponse } from '../types'

interface CreateBookingInput {
  companyId: string
  courtNumber: number
  startTime: string
  customerEmail: string
  customerName: string
  customerPhone: string | null
  paymentIntentId: string
  amount: number
}

export class BookingServerService {
  constructor(private client: ApolloClient<any>) {}

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
    stripeAccountId: string
  ): Promise<PaymentIntentResponse> {
    const response = await fetch('/api/stripe/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Stripe-Account': stripeAccountId,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create payment intent')
    }

    return await response.json()
  }

  async createBooking(input: CreateBookingInput) {
    const { data } = await this.client.mutate({
      mutation: CREATE_BOOKING,
      variables: {
        input: {
          company_id: input.companyId,
          court_number: input.courtNumber,
          start_time: input.startTime,
          customer_email: input.customerEmail,
          customer_name: input.customerName,
          customer_phone: input.customerPhone,
          status: BookingStatus.Pending,
          payment_status: PaymentStatus.Processing,
          stripe_payment_intent_id: input.paymentIntentId,
          amount_total: input.amount,
          currency: 'usd',
          metadata: JSON.stringify({
            initialized_at: new Date().toISOString(),
            status: 'pending_payment',
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    })

    return data?.insertIntobookingsCollection?.records?.[0]
  }

  async getCompletedBookings(companyId: string) {
    const { data } = await this.client.query({
      query: GET_COMPLETED_BOOKINGS,
      variables: { company_id: companyId },
      fetchPolicy: 'network-only',
    })

    return data?.bookingsCollection?.edges?.map((edge: any) => edge.node) || []
  }

  async getAvailabilities(companyId: string, startTime: string, endTime: string) {
    const { data } = await this.client.query({
      query: GET_BOOKING_AVAILABILITIES,
      variables: {
        company_id: companyId,
        start_time: startTime,
        end_time: endTime,
      },
      fetchPolicy: 'network-only',
    })

    return {
      courts: data.courtsCollection.edges.map((edge: any) => edge.node),
      availabilities: data.court_availabilitiesCollection.edges.map((edge: any) => edge.node),
    }
  }
}
