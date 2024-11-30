export interface StripeAccountDetails {
  requirements?: {
    currently_due?: string[]
    eventually_due?: string[]
  }
  capabilities?: {
    card_payments?: 'active' | 'inactive'
    transfers?: 'active' | 'inactive'
  }
  payouts_enabled?: boolean
}

export interface StripeStatus {
  isConnected: boolean
  isEnabled: boolean
  accountDetails: StripeAccountDetails | null
  error: string | null
}
