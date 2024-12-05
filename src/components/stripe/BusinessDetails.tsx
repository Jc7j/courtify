import type { StripeAccountDetails } from '@/types/stripe'

interface BusinessDetailsProps {
  accountDetails: StripeAccountDetails
}

export function BusinessDetails({ accountDetails }: BusinessDetailsProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Business Details</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Stripe Account ID</span>
          <span>
            {accountDetails.id} ({accountDetails.object})
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Stripe Account Type</span>
          <span>
            {accountDetails.object} {accountDetails.type}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Email</span>
          <span>{accountDetails.email}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Name</span>
          <span>{accountDetails.business_profile.name}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Website</span>
          <span>
            {accountDetails.business_profile.url ? (
              <a
                href={`https://${accountDetails.business_profile.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {accountDetails.business_profile.url}
              </a>
            ) : (
              'Not provided'
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
