'use client'

import { useApolloClient } from '@apollo/client'
import { useMemo } from 'react'

import { AvailabilityServerService } from '@/features/availability/services/availabilityServerService'

import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import { ErrorToast, InfoToast, SuccessToast, WarningToast } from '@/shared/components/ui'
import { AvailabilityStatus } from '@/shared/types/graphql'

import { useBookingStore } from './useBookingStore'
import { BookingClientService } from '../services/bookingClientService'
import { BookingServerService } from '../services/bookingServerService'

import type { CreatePaymentIntentInput } from '../types'

export function useBookings() {
  const client = useApolloClient()
  const facility = useFacilityStore((state) => state.facility)

  const services = useMemo(
    () => ({
      booking: new BookingServerService(client),
      availability: new AvailabilityServerService(client),
    }),
    [client]
  )

  async function getAvailabilities(facilityId: string, startTime: string, endTime: string) {
    try {
      const result = await services.booking.getAvailabilities(facilityId, startTime, endTime)
      return result
    } catch (error) {
      console.error('[Bookings] Get availabilities error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        facilityId,
        startTime,
        endTime,
      })
      ErrorToast('Failed to load court availabilities')
      throw error
    }
  }

  async function createPaymentIntent(input: CreatePaymentIntentInput) {
    if (!facility?.stripe_account_id) {
      ErrorToast('Facility not setup for payments')
      throw new Error('Facility not setup for payments')
    }

    try {
      // 1. Validate input
      BookingClientService.validateBookingInput(input)

      // 2. Hold the court
      await services.availability.updateAvailability({
        facilityId: input.facilityId,
        courtNumber: input.courtNumber,
        startTime: input.startTime,
        update: { status: AvailabilityStatus.Held },
      })
      InfoToast('Court held for your booking')

      // 3. Create payment intent
      const result = await services.booking.createPaymentIntent(input, facility.stripe_account_id)
      SuccessToast('Payment session created')
      return result
    } catch (error) {
      // Release the hold if payment intent creation fails
      try {
        await services.availability.updateAvailability({
          facilityId: input.facilityId,
          courtNumber: input.courtNumber,
          startTime: input.startTime,
          update: { status: AvailabilityStatus.Available },
        })
        WarningToast('Court released - payment setup failed')
      } catch (releaseError) {
        console.error('[Bookings] Release hold error:', {
          error: releaseError instanceof Error ? releaseError.message : 'Unknown error',
          input,
        })
      }

      console.error('[Bookings] Create payment intent error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        input,
      })
      ErrorToast('Failed to setup payment')
      throw error
    }
  }

  async function confirmPaymentIntentAndBook(facilityId: string) {
    const state = useBookingStore.getState()
    if (!state.selectedAvailability || !state.guestInfo || !state.paymentIntent) {
      ErrorToast('Missing booking information')
      throw new Error('Missing booking information')
    }

    try {
      // 1. Create booking record
      const booking = await services.booking.createBooking({
        facilityId,
        courtNumber: state.selectedAvailability.court_number,
        startTime: state.selectedAvailability.start_time,
        customerEmail: state.guestInfo.email,
        customerName: state.guestInfo.name,
        customerPhone: state.guestInfo.phone || null,
        paymentIntentId: state.paymentIntent.paymentIntentId,
        amount: state.paymentIntent.amount,
      })

      if (!booking) {
        ErrorToast('Failed to create booking record')
        throw new Error('Failed to create booking record')
      }

      // 2. Update court availability
      await services.availability.updateAvailability({
        facilityId,
        courtNumber: state.selectedAvailability.court_number,
        startTime: state.selectedAvailability.start_time,
        update: { status: AvailabilityStatus.Booked },
      })

      SuccessToast('Booking confirmed successfully')
      return booking
    } catch (error) {
      console.error('Failed to create booking:', error)
      ErrorToast('Failed to confirm booking')
      throw error
    }
  }

  return {
    getAvailabilities,
    createPaymentIntent,
    confirmPaymentIntentAndBook,
  }
}
