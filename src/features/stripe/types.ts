export interface StripeAccountDetails {
  id: string
  email: string | null
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  business_profile: {
    name: string | null
    url: string | null
  }
  capabilities: {
    card_payments: 'active' | 'inactive' | 'pending'
    transfers: 'active' | 'inactive' | 'pending'
  }
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    pending_verification: string[]
  }
  // Allow for future Stripe API additions
  [key: string]: unknown
}

// API Request/Response types
export interface StripeStatusRequest {
  facility_id: string
  stripe_account_id: string
}

export interface StripeStatusResponse {
  accountId: string | null
  isEnabled: boolean
  accountDetails: StripeAccountDetails | null
}

export interface StripeConnectRequest {
  facility_id: string
  facility_name: string
  reconnect?: boolean
  link_type?: 'onboarding' | 'update'
}

export interface StripeConnectResponse {
  url: string | null
  error: string | null
}

export interface StripeStatus {
  isConnected: boolean
  isEnabled: boolean
  accountDetails: StripeAccountDetails | null
  error: string | null
}
