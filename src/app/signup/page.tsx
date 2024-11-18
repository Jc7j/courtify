'use client'

import { SignUpForm } from '@/components/auth/SignUpForm'
import { CreateCompanyStep } from '@/components/onboarding/CreateCompanyStep'
import { Logo, Progress } from '@/components/ui'
import { CreateCompany } from '@/components/onboarding/CreateCompany'
import { useUser } from '@/providers/UserProvider'
import { OnboardingStep, useOnboarding } from '@/hooks/useOnboarding'
import { Skeleton } from '@/components/ui/skeleton'

const STEPS: Record<OnboardingStep, { number: number; progress: number }> = {
  signup: { number: 1, progress: 33 },
  'create-intro': { number: 2, progress: 66 },
  create: { number: 3, progress: 100 },
} as const

export default function SignUpPage() {
  const { user, loading } = useUser()
  const { step, handleStepChange } = useOnboarding()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

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
      default:
        return <SignUpForm onSuccess={handleSignupSuccess} />
    }
  }

  if (step === 'signup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          {/* Title */}
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
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 min-h-screen bg-background flex flex-col">
        <div className="flex-1 px-8 py-12">
          {/* Logo */}
          <div className="mb-12">
            <Logo size="lg" href="/" clickable />
          </div>
          {/* Dynamic content based on step */}
          {renderStep()}
        </div>

        <div className="mb-8 space-y-2 px-8">
          <Progress value={STEPS[step].progress} className="h-1" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {STEPS[step].number} of 3</span>
            <span>{STEPS[step].progress}% completed</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-sm text-muted-foreground border-t">
          <p>© {new Date().getFullYear()} Courtify. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Preview/Info */}
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
