'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ROUTES } from '@/constants/routes'

export type OnboardingStep = 'signup' | 'create-intro' | 'create'

interface UseOnboardingReturn {
  step: OnboardingStep
  isOnboarding: boolean
  loading: boolean
  handleStepChange: (step: OnboardingStep) => void
  handleCompanyCreated: (companyId: string) => Promise<void>
}

export function useOnboarding(): UseOnboardingReturn {
  const { user, loading: userLoading, refetch: refetchUser } = useUser()
  const { update: updateSession } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlStep = searchParams.get('step') as OnboardingStep | null
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('signup')
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Handle URL sync and redirects
  useEffect(() => {
    if (userLoading || isRedirecting) return

    // If user has company_id and there's a step parameter, redirect to dashboard
    if (user?.company_id && urlStep) {
      router.replace(ROUTES.DASHBOARD)
      return
    }

    // Otherwise, sync step with URL if it's valid
    if (urlStep && (urlStep === 'create-intro' || urlStep === 'create')) {
      setCurrentStep(urlStep)
    }
  }, [user?.company_id, urlStep, userLoading, isRedirecting, router])

  // Handle step changes with URL updates
  const handleStepChange = useCallback(
    (newStep: OnboardingStep) => {
      setCurrentStep(newStep)
      if (newStep === 'signup') {
        router.replace(ROUTES.AUTH.SIGNUP)
      } else {
        router.replace(`${ROUTES.AUTH.SIGNUP}?step=${newStep}`)
      }
    },
    [router]
  )

  // Handle company creation success
  const handleCompanyCreated = useCallback(
    async (companyId: string) => {
      if (!user) return

      setIsRedirecting(true)
      try {
        await Promise.all([
          refetchUser(),
          updateSession({
            user: {
              ...user,
              company_id: companyId,
            },
          }),
        ])

        router.replace(ROUTES.DASHBOARD)
      } catch (err) {
        setIsRedirecting(false)
        console.error('Error updating session after company creation:', err)
        throw err
      }
    },
    [user, refetchUser, updateSession, router]
  )

  return {
    step: currentStep,
    isOnboarding: !user?.company_id,
    loading: userLoading || isRedirecting,
    handleStepChange,
    handleCompanyCreated,
  }
}
