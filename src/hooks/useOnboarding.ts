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
  handleCompanyCreated: () => Promise<void>
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

  const handleCompanyCreated = useCallback(async () => {
    try {
      await refetchUser()
      await updateSession()
      router.replace(ROUTES.DASHBOARD.HOME)
    } catch (err) {
      console.error('Error completing company creation:', err)
      throw err instanceof Error ? err : new Error('Failed to complete company setup')
    }
  }, [refetchUser, updateSession, router])

  return {
    isOnboarding: isAuthenticated && !user?.company_id,
    step: currentStep,
    handleCompanyCreated,
    handleStepChange,
  }
}
