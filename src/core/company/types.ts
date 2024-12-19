import type {
  CompanyProduct,
  Company,
  ProductType,
  StripePaymentType,
} from '@/shared/types/graphql'

// Company Types
export type PublicCompany = Pick<
  Company,
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
  product: CompanyProduct | null
  error: string | null
}

export interface ArchiveProductResponse {
  success: boolean
  error?: string
}

export interface ListProductsResponse {
  prices: StripeProduct[] | null
  products: CompanyProduct[]
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
export interface CompanyServiceConfig {
  companyId: string
}

// Hook Types
export interface UseCompanyProductsProps {
  companyId?: string
}

export interface UseCompanyProps {
  companyId?: string
}

// Store Types
export interface CompanyState {
  company: PublicCompany | null
  setCompany: (company: PublicCompany) => void
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
  company_id: string
}

export interface ArchiveProductRequest {
  stripe_product_id: string
  stripe_price_id: string
  company_id: string
  active: boolean
}
