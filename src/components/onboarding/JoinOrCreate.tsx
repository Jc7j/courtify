'use client'

import { Button } from '@/components/ui/Button'
import { Building2 } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ROUTES } from '@/constants/routes'

interface CreateCompanyStepProps {
  onNext: () => void
  isLoading?: boolean
}

export function CreateCompanyStep({ onNext, isLoading }: CreateCompanyStepProps) {
  const { user, loading } = useUser()
  const router = useRouter()

  // Check if user already has a company
  useEffect(() => {
    if (loading) return

    if (user?.company_id) {
      router.push(ROUTES.DASHBOARD)
    }
  }, [user?.company_id, loading, router])

  // Show loading state while checking
  if (loading) {
    return null // Or a loading spinner if preferred
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground-emphasis">
          Welcome! Let&apos;s get started
        </h1>
        <p className="text-base text-foreground-muted leading-relaxed">
          Create your company workspace to start managing your courts.
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full h-auto p-6 flex flex-col items-center space-y-4 bg-background-emphasis hover:bg-background-subtle"
        onClick={onNext}
        disabled={isLoading}
      >
        <Building2 className="h-8 w-8 text-foreground-subtle" />
        <div className="space-y-1.5 text-center">
          <h3 className="text-base font-medium text-foreground-emphasis">Create your company</h3>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Set up a new workspace for your team
          </p>
        </div>
      </Button>
    </div>
  )
}
