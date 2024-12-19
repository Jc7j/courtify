'use client'

import { useApolloClient } from '@apollo/client'
import { useMemo } from 'react'

import { AvailabilityServerService } from '@/features/availability/services/availabilityServerService'

import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import { AvailabilityStatus } from '@/shared/types/graphql'

import { useBookingStore } from './useBookingStore'
import { BookingClientService } from '../services/bookingClientService'
import { BookingServerService } from '../services/bookingServerService'
import { CreatePaymentIntentInput } from '../types'

export function useBookings() {
  const client = useApolloClient()
  const facility = useFacilityStore((state) => state.facility)
  const bookingService = useMemo(() => new BookingServerService(client), [client])
  const availabilityService = useMemo(() => new AvailabilityServerService(client), [client])

  async function createPaymentIntent(input: CreatePaymentIntentInput) {
    if (!facility?.stripe_account_id) {
      throw new Error('Facility not setup for payments')
    }

    try {
      // 1. Validate input
      BookingClientService.validateBookingInput(input)

      // 2. Hold the court
      await availabilityService.updateAvailability({
        facilityId: input.facilityId,
        courtNumber: input.courtNumber,
        startTime: input.startTime,
        update: { status: AvailabilityStatus.Held },
      })

      // 3. Create payment intent
      return await bookingService.createPaymentIntent(input, facility.stripe_account_id)
    } catch (error) {
      // Release the hold if payment intent creation fails
      await availabilityService.updateAvailability({
        facilityId: input.facilityId,
        courtNumber: input.courtNumber,
        startTime: input.startTime,
        update: { status: AvailabilityStatus.Available },
      })
      throw error
    }
  }

  async function confirmPaymentIntentAndBook(facilityId: string) {
    const state = useBookingStore.getState()
    if (!state.selectedAvailability || !state.guestInfo || !state.paymentIntent) {
      throw new Error('Missing booking information')
    }

    try {
      // 1. Create booking record
      const booking = await bookingService.createBooking({
        facilityId,
        courtNumber: state.selectedAvailability.court_number,
        startTime: state.selectedAvailability.start_time,
        customerEmail: state.guestInfo.email,
        customerName: state.guestInfo.name,
        customerPhone: state.guestInfo.phone || null,
        paymentIntentId: state.paymentIntent.paymentIntentId,
        amount: state.paymentIntent.amount,
      })

      if (!booking) throw new Error('Failed to create booking record')

      // 2. Update court availability
      await availabilityService.updateAvailability({
        facilityId,
        courtNumber: state.selectedAvailability.court_number,
        startTime: state.selectedAvailability.start_time,
        update: { status: AvailabilityStatus.Booked },
      })

      return booking
    } catch (error) {
      console.error('Failed to create booking:', error)
      throw error
    }
  }

  return {
    createPaymentIntent,
    confirmPaymentIntentAndBook,
  }
}
