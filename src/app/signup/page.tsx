'use client'

import { SignUpForm } from '@/components/auth/SignUpForm'
import { CreateCompanyStep } from '@/components/onboarding/CreateCompanyStep'
import { Logo, Progress } from '@/components/ui'
import { CreateCompany } from '@/components/onboarding/CreateCompany'
import { useUserStore } from '@/stores/useUserStore'
import { OnboardingStep, useOnboarding } from '@/hooks/useOnboarding'
import { InviteTeam } from '@/components/onboarding/InviteTeam'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { Suspense } from 'react'

const STEPS: Record<OnboardingStep, { number: number; progress: number }> = {
  signup: { number: 1, progress: 25 },
  'create-intro': { number: 2, progress: 50 },
  create: { number: 3, progress: 75 },
  'invite-team': { number: 4, progress: 100 },
} as const

function SignUpContent() {
  const { user } = useUserStore()
  const { step, handleStepChange } = useOnboarding()
  const router = useRouter()

  function handleSignupSuccess() {
    handleStepChange('create-intro')
  }

  function handleCreateIntro() {
    handleStepChange('create')
  }

  function renderStep() {
    switch (step) {
      case 'create-intro':
        return <CreateCompanyStep userName={user?.name || ''} onNext={handleCreateIntro} />
      case 'create':
        return <CreateCompany onBack={() => handleStepChange('create-intro')} />
      case 'invite-team':
        return (
          <InviteTeam
            onBack={() => handleStepChange('create')}
            onComplete={() => router.replace(ROUTES.DASHBOARD.HOME)}
          />
        )
      default:
        return <SignUpForm onSuccess={handleSignupSuccess} />
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

          <SignUpForm onSuccess={handleSignupSuccess} />
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
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  )
}
