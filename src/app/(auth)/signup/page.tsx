'use client'

import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

import { SignUpForm } from '@/features/auth/components/SignUpForm'
import { CreateFacility } from '@/features/onboarding/components/CreateFacility'
import { CreateFacilityStep } from '@/features/onboarding/components/CreateFacilityStep'
import { InviteTeam } from '@/features/onboarding/components/InviteTeam'
import { OnboardingStep, useOnboarding } from '@/features/onboarding/hooks/useOnboarding'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { Logo, Progress } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'
import { BaseUser } from '@/shared/types/auth'

const STEPS: Record<OnboardingStep, { number: number; progress: number }> = {
  signup: { number: 1, progress: 25 },
  'create-intro': { number: 2, progress: 50 },
  create: { number: 3, progress: 75 },
  'invite-team': { number: 4, progress: 100 },
} as const

function SignUpContent({
  handleStepChange,
  step,
}: {
  handleStepChange: (step: OnboardingStep) => void
  step: OnboardingStep
}) {
  const { user } = useUserStore()
  const router = useRouter()

  function handleSignupSuccess() {
    handleStepChange('create-intro')
  }

  return (
    <Suspense fallback={null}>
      <OnboardingContent
        user={user}
        onSignupSuccess={handleSignupSuccess}
        router={router}
        step={step}
        handleStepChange={handleStepChange}
      />
    </Suspense>
  )
}

function OnboardingContent({
  user,
  onSignupSuccess,
  router,
  step,
  handleStepChange,
}: {
  user: BaseUser | null
  onSignupSuccess: () => void
  router: ReturnType<typeof useRouter>
  step: OnboardingStep
  handleStepChange: (step: OnboardingStep) => void
}) {
  function handleCreateIntro() {
    handleStepChange('create')
  }

  function renderStep() {
    switch (step) {
      case 'create-intro':
        return <CreateFacilityStep userName={user?.name || ''} onNext={handleCreateIntro} />
      case 'create':
        return <CreateFacility onBack={() => handleStepChange('create-intro')} />
      case 'invite-team':
        return <InviteTeam onComplete={() => router.replace(ROUTES.DASHBOARD.HOME)} />
      default:
        return <SignUpForm onSuccess={onSignupSuccess} />
    }
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          <h1 className="text-3xl font-semibold text-center text-foreground">
            Create your free account
          </h1>

          <SignUpForm onSuccess={onSignupSuccess} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-1/2 min-h-screen bg-background flex flex-col">
        <div className="flex-1 px-8 py-12">
          <div className="mb-12">
            <Logo size="lg" href="/" clickable />
          </div>
          {renderStep()}
        </div>

        <div className="mb-8 space-y-2 px-8">
          <Progress value={STEPS[step].progress} className="h-1" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {STEPS[step].number} of 4</span>
            <span>{STEPS[step].progress}% completed</span>
          </div>
        </div>

        <div className="px-8 py-6 text-sm text-muted-foreground border-t">
          <p>© {new Date().getFullYear()} Courtify. All rights reserved.</p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-secondary items-center justify-center p-12">
        <div className="max-w-lg space-y-4">
          <h2 className="text-2xl font-semibold text-secondary-foreground text-center">
            Welcome to Courtify
          </h2>
          <p className="text-secondary-foreground/80 text-center text-base leading-relaxed">
            Streamline your court management with our comprehensive booking system. Whether
            you&apos;re joining an existing workspace or creating a new one, we&apos;re here to help
            you get started.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const { step, handleStepChange } = useOnboarding()
  return (
    <Suspense fallback={null}>
      <SignUpContent step={step} handleStepChange={handleStepChange} />
    </Suspense>
  )
}
