import { Progress } from '@/components/ui/progress'
import { ExternalLink } from 'lucide-react'
import type { StripeAccountDetails } from '@/types/stripe'
import Link from 'next/link'

function getRequirementCategories(requirements: string[]): string[] {
  return Array.from(new Set(requirements.map((req) => req.split('.')[0])))
}

interface SetupRequirementsProps {
  requirements: StripeAccountDetails['requirements']
  completionPercentage: number
}

export function SetupRequirements({ requirements, completionPercentage }: SetupRequirementsProps) {
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
    </div>
  )
}
