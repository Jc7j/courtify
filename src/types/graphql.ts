export type Maybe<T> = T | null

export interface Node {
  nodeId: string
}

export interface User {
  id: string
  email: string
  name: string
  company_id?: string | null
  active: boolean
  email_verified_at?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  address: string
  sports: string
  businessinfo: string
  slug: string
  stripe_account_id?: string | null
  stripe_account_enabled: boolean
  stripe_account_details?: Record<string, unknown> | null
  stripe_webhook_secret?: string | null
  stripe_payment_methods: string[]
  stripe_currency: string
  created_at: string
  updated_at: string
}

export interface Courts {
  company_id: string
  court_number: number
  name: string
  created_at: string
  updated_at: string
}

export interface CourtAvailability {
  nodeId: string
  company_id: string
  court_number: number
  start_time: string
  end_time: string
  status: AvailabilityStatus
  created_at: string
  updated_at: string
}

export enum AvailabilityStatus {
  Available = 'available',
  Booked = 'booked',
  Past = 'past',
}

export enum BookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Completed = 'completed',
  NoShow = 'no_show',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Refunded = 'refunded',
  Failed = 'failed',
}

export interface Booking {
  id: string
  company_id: string
  court_number: number
  start_time: string
  customer_email: string
  customer_name: string
  customer_phone?: string | null
  booking_status: BookingStatus
  payment_status: PaymentStatus
  stripe_customer_id?: string | null
  stripe_payment_intent_id?: string | null
  stripe_session_id?: string | null
  amount_total: number
  amount_paid?: number | null
  currency: string
  booking_info?: Record<string, unknown> | null
  notes?: string | null
  created_at: string
  updated_at: string
  cancelled_at?: string | null
}

export interface CourtsEdge {
  node: Courts
  __typename: 'CourtsEdge'
}

export interface CourtsConnection {
  edges: CourtsEdge[]
  __typename: 'CourtsConnection'
}

export interface CourtAvailabilityEdge {
  node: CourtAvailability
  __typename: 'CourtAvailabilityEdge'
}

export interface CourtAvailabilityConnection {
  edges: CourtAvailabilityEdge[]
  __typename: 'CourtAvailabilityConnection'
}

export interface CompaniesEdge {
  node: Company
  __typename: 'CompaniesEdge'
}

export interface CompaniesConnection {
  edges: CompaniesEdge[]
  __typename: 'CompaniesConnection'
}

export interface BookingEdge {
  node: Booking
  __typename: 'BookingEdge'
}

export interface BookingConnection {
  edges: BookingEdge[]
  __typename: 'BookingConnection'
}
