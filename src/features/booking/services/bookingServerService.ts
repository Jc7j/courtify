import { ApolloClient } from '@apollo/client'

import { GET_COMPLETED_BOOKINGS, GET_BOOKING_AVAILABILITIES } from '../graphql/queries'

import type { CreatePaymentIntentInput, PaymentIntentResponse } from '../types'

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

  async getCompletedBookings(facilityId: string) {
    const { data } = await this.client.query({
      query: GET_COMPLETED_BOOKINGS,
      variables: { facility_id: facilityId },
      fetchPolicy: 'network-only',
    })

    return data?.bookingsCollection?.edges?.map((edge: any) => edge.node) || []
  }

  async getAvailabilities(facilityId: string, startTime: string, endTime: string) {
    const { data } = await this.client.query({
      query: GET_BOOKING_AVAILABILITIES,
      variables: {
        facility_id: facilityId,
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
