import type { CreatePaymentIntentInput } from '../types'

export class BookingClientService {
  static validateBookingInput(input: CreatePaymentIntentInput) {
    if (!input.facilityId) throw new Error('Facility ID is required')
    if (!input.courtNumber) throw new Error('Court number is required')
    if (!input.startTime) throw new Error('Start time is required')
    if (!input.endTime) throw new Error('End time is required')
    if (!input.guestInfo) throw new Error('Guest information is required')
    if (!input.selectedProducts.courtProduct) throw new Error('Court product is required')
    return true
  }
}
