import { Button } from '@/components/ui'
import { Building2 } from 'lucide-react'
import { BaseUser } from '@/types/auth'

interface CreateCompanyStepProps {
  userName: BaseUser['name']
  onNext: () => void
}

export function CreateCompanyStep({ userName, onNext }: CreateCompanyStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome {userName}! Let&apos;s get started
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Create your company workspace to start managing your courts.
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full h-auto p-6 flex flex-col items-center space-y-4"
        onClick={onNext}
      >
        <Building2 className="h-8 w-8 text-muted-foreground" />
        <div className="space-y-1.5 text-center">
          <h3 className="text-base font-medium">Create your company</h3>
          <p className="text-sm text-muted-foreground">Set up a new workspace for your team</p>
        </div>
      </Button>
    </div>
  )
}
