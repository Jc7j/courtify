import type { AvailabilityStatus } from '@/shared/types/graphql'

export interface CreateAvailabilityInput {
  company_id: string
  court_number: number
  start_time: string
  end_time: string
  status: AvailabilityStatus
  created_at: string
  updated_at: string
}
