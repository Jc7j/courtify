export type Maybe<T> = T | null

export interface Node {
  nodeId: string
}

export enum MemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export interface User {
  id: string
  email: string
  name: string
  company_id?: string | null
  role: MemberRole
  is_active: boolean
  invited_by?: string | null
  joined_at?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
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
  Held = 'held',
  Booked = 'booked',
  Past = 'past',
}

export enum BookingStatus {
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Completed = 'completed',
}

export enum PaymentStatus {
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
  status: BookingStatus
  payment_status: PaymentStatus
  stripe_payment_intent_id?: string | null
  product_id?: string | null
  amount_total: number
  amount_paid?: number | null
  currency: string
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export enum ProductType {
  CourtRental = 'court_rental',
  Equipment = 'equipment',
  // Membership = 'membership',
  // Class = 'class',
  // Event = 'event',
}

export enum StripePaymentType {
  Recurring = 'recurring',
  OneTime = 'one_time',
}

export interface CompanyProduct {
  id: string
  company_id: string
  name: string
  description?: string | null
  type: ProductType
  price_amount: number
  currency: string
  stripe_price_id: string | null
  stripe_product_id: string | null
  stripe_payment_type: StripePaymentType | null
  metadata: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserEdge {
  node: User
  __typename: 'UserEdge'
}
export interface UsersConnection {
  edges: UserEdge[]
  __typename: 'UsersConnection'
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

export interface CompanyProductEdge {
  node: CompanyProduct
  __typename: 'CompanyProductEdge'
}

export interface CompanyProductConnection {
  edges: CompanyProductEdge[]
  __typename: 'CompanyProductConnection'
}
