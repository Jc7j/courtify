'use client'

import { useApolloClient } from '@apollo/client'
import { useMemo } from 'react'

import { AvailabilityServerService } from '@/features/availability/services/availabilityServerService'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import { AvailabilityStatus } from '@/shared/types/graphql'

import { useBookingStore } from './useBookingStore'
import { BookingClientService } from '../services/bookingClientService'
import { BookingServerService } from '../services/bookingServerService'
import { CreatePaymentIntentInput } from '../types'

export function useBookings() {
  const client = useApolloClient()
  const company = useCompanyStore((state) => state.company)
  const bookingService = useMemo(() => new BookingServerService(client), [client])
  const availabilityService = useMemo(() => new AvailabilityServerService(client), [client])

  async function createPaymentIntent(input: CreatePaymentIntentInput) {
    if (!company?.stripe_account_id) {
      throw new Error('Company not setup for payments')
    }

    try {
      // 1. Validate input
      BookingClientService.validateBookingInput(input)

      // 2. Hold the court
      await availabilityService.updateAvailability({
        companyId: input.companyId,
        courtNumber: input.courtNumber,
        startTime: input.startTime,
        update: { status: AvailabilityStatus.Held },
      })

      // 3. Create payment intent
      return await bookingService.createPaymentIntent(input, company.stripe_account_id)
    } catch (error) {
      // Release the hold if payment intent creation fails
      await availabilityService.updateAvailability({
        companyId: input.companyId,
        courtNumber: input.courtNumber,
        startTime: input.startTime,
        update: { status: AvailabilityStatus.Available },
      })
      throw error
    }
  }

  async function confirmPaymentIntentAndBook(companyId: string) {
    const state = useBookingStore.getState()
    if (!state.selectedAvailability || !state.guestInfo || !state.paymentIntent) {
      throw new Error('Missing booking information')
    }

    try {
      // 1. Create booking record
      const booking = await bookingService.createBooking({
        companyId,
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
        companyId,
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
