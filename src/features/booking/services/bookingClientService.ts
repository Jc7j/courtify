import type { CreatePaymentIntentInput } from '../types'

export class BookingClientService {
  static validateBookingInput(input: CreatePaymentIntentInput): {
    isValid: boolean
    error?: string
  } {
    if (!input.facilityId) return { isValid: false, error: 'Facility ID is required' }
    if (!input.courtNumber) return { isValid: false, error: 'Court number is required' }
    if (!input.startTime) return { isValid: false, error: 'Start time is required' }
    if (!input.endTime) return { isValid: false, error: 'End time is required' }
    if (!input.guestInfo) return { isValid: false, error: 'Guest information is required' }
    return { isValid: true }
  }
}
