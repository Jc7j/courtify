'use client'

import { useUser } from '@/providers/UserProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ROUTES } from '@/constants/routes'

export type OnboardingStep = 'signup' | 'create-intro' | 'create'

interface OnboardingState {
  isOnboarding: boolean
  step: OnboardingStep
  handleCompanyCreated: (companyId: string) => Promise<void>
  handleStepChange: (step: OnboardingStep) => void
}

export function useOnboarding(): OnboardingState {
  const { user, refetch: refetchUser, isAuthenticated } = useUser()
  const { update: updateSession } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStep = (searchParams.get('step') as OnboardingStep) || 'signup'

  const handleStepChange = useCallback(
    (newStep: OnboardingStep) => {
      if (newStep === 'signup') {
        router.replace(ROUTES.AUTH.SIGNUP)
      } else {
        router.replace(`${ROUTES.AUTH.SIGNUP}?step=${newStep}`)
      }
    },
    [router]
  )

  const handleCompanyCreated = useCallback(
    async (companyId: string) => {
      if (!isAuthenticated || !user) {
        throw new Error('User must be authenticated to create a company')
      }

      try {
        const updatedSession = await updateSession({
          user: {
            ...user,
            company_id: companyId,
          },
        })

        if (!updatedSession?.user?.company_id) {
          throw new Error('Failed to update user session')
        }

        await refetchUser()

        router.replace(ROUTES.DASHBOARD)
      } catch (err) {
        console.error('Error completing company creation:', err)
        throw err instanceof Error ? err : new Error('Failed to complete company setup')
      }
    },
    [user, refetchUser, updateSession, router, isAuthenticated]
  )

  return {
    isOnboarding: isAuthenticated && !user?.company_id,
    step: currentStep,
    handleCompanyCreated,
    handleStepChange,
  }
}
