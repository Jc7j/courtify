import type {
  FacilityProduct,
  Facility,
  ProductType,
  StripePaymentType,
} from '@/shared/types/graphql'

// Facility Types
export type PublicFacility = Pick<
  Facility,
  'id' | 'name' | 'slug' | 'stripe_account_id' | 'stripe_account_enabled'
>

// Product Types
export interface CreateProductInput {
  name: string
  description?: string | null
  type: ProductType
  price_amount: number
  currency?: string
  metadata?: Record<string, unknown>
  stripe_product_id?: string
  stripe_price_id?: string
  stripe_payment_type?: StripePaymentType
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
  is_active?: boolean
}

export interface ProductResponse {
  product: FacilityProduct | null
  error: string | null
}

export interface ArchiveProductResponse {
  success: boolean
  error?: string
}

export interface ListProductsResponse {
  prices: StripeProduct[] | null
  products: FacilityProduct[]
  syncNeeded: boolean
  error: string | null
}

// Stripe Types
export interface StripeProduct {
  id: string
  product: string
  active: boolean
  currency: string
  unit_amount: number
  type: string
  metadata: Record<string, string>
}

// Service Types
export interface FacilityServiceConfig {
  facilityId: string
}

// Hook Types
export interface UseFacilityProductsProps {
  facilityId?: string
}

export interface UseFacilityProps {
  facilityId?: string
}

// Store Types
export interface FacilityState {
  facility: PublicFacility | null
  setFacility: (facility: PublicFacility) => void
  reset: () => void
}

// API Types
export interface CreateProductRequest {
  name: string
  description?: string | null
  type: ProductType
  price_amount: number
  currency?: string
  metadata?: Record<string, unknown>
  facility_id: string
}

export interface ArchiveProductRequest {
  stripe_product_id: string
  stripe_price_id: string
  facility_id: string
  active: boolean
}
