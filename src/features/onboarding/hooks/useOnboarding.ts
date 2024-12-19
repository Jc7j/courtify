'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/shared/providers/AuthProvider'

export type OnboardingStep = 'signup' | 'create-intro' | 'create' | 'invite-team'

interface OnboardingState {
  isOnboarding: boolean
  step: OnboardingStep
  handleCompanyCreated: () => Promise<void>
  handleStepChange: (step: OnboardingStep) => void
}

export function useOnboarding(): OnboardingState {
  const { isAuthenticated, updateUser } = useUserStore()
  const { user } = useAuth()
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
      const currentUser = useUserStore.getState().user
      if (!currentUser?.company_id) {
        throw new Error('Company ID not found after database update')
      }

      // Update the user in our store with the new company_id
      updateUser({ company_id: currentUser.company_id })

      // Verify the update was successful
      const updatedUser = useUserStore.getState().user
      if (!updatedUser?.company_id) {
        throw new Error('Store update verification failed')
      }

      handleStepChange('invite-team')
    } catch (err) {
      console.error('Error completing company creation:', err)
      throw err instanceof Error ? err : new Error('Failed to complete company setup')
    }
  }, [updateUser, handleStepChange])

  return {
    isOnboarding: isAuthenticated && !user?.company_id,
    step: currentStep,
    handleCompanyCreated,
    handleStepChange,
  }
}
