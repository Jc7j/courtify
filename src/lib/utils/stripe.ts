import type { StripeAccountDetails, StripeRequirements } from '@/types/stripe'

/**
 * Type guard to check if requirements exist and have required properties
 */
export function hasStripeRequirements(requirements: unknown): requirements is StripeRequirements {
  if (!requirements || typeof requirements !== 'object') return false

  const req = requirements as Record<string, unknown>
  return Array.isArray(req.currently_due) && Array.isArray(req.eventually_due)
}

/**
 * Calculate Stripe setup completion percentage
 */
export function getStripeCompletionPercentage(requirements: unknown): number {
  if (!hasStripeRequirements(requirements)) return 0

  const totalRequirements = requirements.eventually_due.length
  const completedRequirements = totalRequirements - requirements.currently_due.length

  return totalRequirements ? (completedRequirements / totalRequirements) * 100 : 0
}

/**
 * Get categories from requirement strings
 */
export function getRequirementCategories(requirements: string[]): string[] {
  return Array.from(new Set(requirements.map((req) => req.split('.')[0])))
}

/**
 * Get Stripe dashboard URL based on account status
 */
export function getStripeDashboardUrl(accountId: string, needsSetup: boolean): string {
  return needsSetup
    ? `https://connect.stripe.com/setup/c/${accountId}`
    : `https://dashboard.stripe.com/${accountId}/payments`
}

/**
 * Type guard to check if account details exist and have required properties
 */
export function hasBusinessProfile(
  account: StripeAccountDetails | null
): account is StripeAccountDetails {
  if (!account) return false

  return (
    typeof account.email === 'string' &&
    account.business_profile &&
    typeof account.business_profile === 'object' &&
    'name' in account.business_profile &&
    'url' in account.business_profile
  )
}
