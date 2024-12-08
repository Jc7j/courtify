import { Button } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { ExternalLink } from 'lucide-react'
import type { StripeAccountDetails } from '@/types/stripe'

function getRequirementCategories(requirements: string[]): string[] {
  return Array.from(new Set(requirements.map((req) => req.split('.')[0])))
}

interface SetupRequirementsProps {
  requirements: StripeAccountDetails['requirements']
  completionPercentage: number
  onComplete: () => void
}

export function SetupRequirements({
  requirements,
  completionPercentage,
  onComplete,
}: SetupRequirementsProps) {
  const hasRequirements = requirements.currently_due.length > 0
  return (
    <div className="space-y-6">
      {hasRequirements && (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Setup Progress</h3>
              <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-1" />
          </div>

          <div className="grid gap-2">
            {getRequirementCategories(requirements.currently_due || []).map((category, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
                <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/50 p-4">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
          Complete Your Stripe Setup
        </h4>
        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
          Additional information is needed before you can start accepting payments.
        </p>
      </div>

      <Button onClick={onComplete} className="w-full sm:w-auto">
        <ExternalLink className="mr-2 h-4 w-4" />
        Complete Setup in Stripe
      </Button>
    </div>
  )
}
