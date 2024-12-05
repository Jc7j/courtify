/**
 * Core Stripe types that focus on what we actually use
 * while remaining flexible to API changes
 */

// Basic requirement structure we depend on
export interface StripeRequirements {
  currently_due: string[]
  eventually_due: string[]
  pending_verification: string[]
}

// Core business profile fields we use
export interface StripeBusinessProfile {
  name: string | null
  url: string | null
}

// Essential account details we need
export interface StripeAccountDetails {
  id: string
  email: string
  object: string
  type: string
  business_profile: StripeBusinessProfile
  capabilities: {
    card_payments: 'active' | 'inactive'
    transfers: 'active' | 'inactive'
  }
  charges_enabled: boolean
  payouts_enabled: boolean
  requirements: StripeRequirements
}

export interface StripeStatus {
  isConnected: boolean
  isEnabled: boolean
  accountDetails: StripeAccountDetails | null
  error: string | null
}
