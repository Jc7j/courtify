'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { ErrorToast, InfoToast, SuccessToast } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/shared/providers/AuthProvider'

export type OnboardingStep = 'signup' | 'create-intro' | 'create' | 'invite-team'

interface OnboardingState {
  isOnboarding: boolean
  step: OnboardingStep
  handleFacilityCreated: () => Promise<void>
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
      try {
        if (newStep === 'signup') {
          router.replace(ROUTES.AUTH.SIGNUP)
        } else {
          router.replace(`${ROUTES.AUTH.SIGNUP}?step=${newStep}`)
        }
      } catch (error) {
        console.error('[Onboarding] Step change error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          newStep,
        })
        ErrorToast('Failed to navigate to next step')
      }
    },
    [router]
  )

  const handleFacilityCreated = useCallback(async () => {
    try {
      const currentUser = useUserStore.getState().user
      if (!currentUser?.facility_id) {
        ErrorToast('Facility setup incomplete')
        throw new Error('Facility ID not found after database update')
      }

      // Update the user in our store with the new facility_id
      updateUser({ facility_id: currentUser.facility_id })

      // Verify the update was successful
      const updatedUser = useUserStore.getState().user
      if (!updatedUser?.facility_id) {
        ErrorToast('Failed to update user information')
        throw new Error('Store update verification failed')
      }

      SuccessToast('Facility created successfully')
      handleStepChange('invite-team')
    } catch (err) {
      console.error('[Onboarding] Facility creation error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      ErrorToast('Failed to complete facility setup')
      throw err instanceof Error ? err : new Error('Failed to complete facility setup')
    }
  }, [updateUser, handleStepChange])

  return {
    isOnboarding: isAuthenticated && !user?.facility_id,
    step: currentStep,
    handleFacilityCreated,
    handleStepChange,
  }
}
