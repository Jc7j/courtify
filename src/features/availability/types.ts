import type { AvailabilityStatus, CourtAvailability, Courts } from '@/shared/types/graphql'

export interface CreateAvailabilityInput {
  facility_id: string
  court_number: number
  start_time: string
  end_time: string
  status: AvailabilityStatus
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: string
  payment_status: string
  amount_total: number
  amount_paid: number | null
  currency: string
  metadata: string
}

export interface FlattenedAvailability extends CourtAvailability {
  nodeId: string
  facility_id: string
  created_at: string
  updated_at: string
  booking: Booking | null
}

export interface GetFacilityAvailabilitiesResponse {
  courts: Courts[]
  availabilities: FlattenedAvailability[]
}
