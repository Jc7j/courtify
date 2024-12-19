import dayjs from 'dayjs'

import { AvailabilityStatus } from '@/shared/types/graphql'

import { CreateAvailabilityInput } from '../types'

export class AvailabilityClientService {
  static validateTimeRange(
    startTime: string,
    endTime: string
  ): { isValid: boolean; error?: string } {
    const startDateTime = dayjs(startTime)
    const endDateTime = dayjs(endTime)
    const currentTime = dayjs()

    if (startDateTime.isBefore(currentTime.startOf('day'))) {
      return { isValid: false, error: 'Cannot create availability for past dates' }
    }

    if (endDateTime.isBefore(startDateTime)) {
      return { isValid: false, error: 'End time must be after start time' }
    }

    return { isValid: true }
  }

  static formatAvailabilityInput(
    facilityId: string,
    courtNumber: number,
    startTime: string,
    endTime: string,
    status: AvailabilityStatus = AvailabilityStatus.Available
  ): CreateAvailabilityInput {
    const timestamp = new Date().toISOString()

    return {
      facility_id: facilityId,
      court_number: courtNumber,
      start_time: dayjs(startTime).format(),
      end_time: dayjs(endTime).format(),
      status,
      created_at: timestamp,
      updated_at: timestamp,
    }
  }

  static transformBookingMetadata(metadata: string): Record<string, any> {
    try {
      return JSON.parse(metadata)
    } catch (e) {
      console.error('Failed to parse booking metadata:', e)
      return {}
    }
  }
}
