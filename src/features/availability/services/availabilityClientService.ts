import dayjs from 'dayjs'

import { AvailabilityStatus } from '@/shared/types/graphql'

import { CreateAvailabilityInput } from '../types'

import type { EnhancedAvailability } from '@/shared/types/graphql'

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

  static findAvailabilityFromEventId(
    eventId: string,
    availabilities: EnhancedAvailability[],
    oldEventStart?: Date | null
  ): EnhancedAvailability | undefined {
    const courtNumber = parseInt(eventId.split('-')[0], 10)

    return availabilities.find(
      (a) =>
        a.court_number === courtNumber &&
        (oldEventStart ? dayjs(a.start_time).isSame(oldEventStart) : true)
    )
  }

  static updateAvailabilityInList(
    availabilities: EnhancedAvailability[],
    oldAvailability: EnhancedAvailability,
    updates: Partial<EnhancedAvailability>
  ): EnhancedAvailability[] {
    return availabilities.map((a) =>
      a.court_number === oldAvailability.court_number && a.start_time === oldAvailability.start_time
        ? { ...a, ...updates }
        : a
    )
  }

  static validateTimeConstraints(selectedStart: string | Date): {
    isValid: boolean
    error?: string
  } {
    const startDateTime = dayjs(selectedStart)
    if (startDateTime.isBefore(dayjs())) {
      return { isValid: false, error: 'Cannot create availability in the past' }
    }
    return { isValid: true }
  }
}
