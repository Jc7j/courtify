'use client'

import { useApolloClient } from '@apollo/client'
import { useMemo } from 'react'

import { AvailabilityServerService } from '@/features/availability/services/availabilityServerService'

import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import { ErrorToast, InfoToast, WarningToast } from '@/shared/components/ui'
import { AvailabilityStatus } from '@/shared/types/graphql'

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
      const validation = BookingClientService.validateBookingInput(input)
      if (!validation.isValid) {
        WarningToast(validation.error || 'Invalid booking input')
        throw new Error(validation.error)
      }

      // 2. Hold the court
      await services.availability.updateAvailability({
        facilityId: input.facilityId,
        courtNumber: input.courtNumber,
        startTime: input.startTime,
        update: { status: AvailabilityStatus.Held },
      })
      InfoToast('Court held for 10 minutes')

      // 3. Create payment intent
      return await services.booking.createPaymentIntent(input, facility.stripe_account_id)
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
        console.error('[Bookings] Release hold error:', releaseError)
      }

      throw error
    }
  }

  return {
    getAvailabilities,
    createPaymentIntent,
  }
}
