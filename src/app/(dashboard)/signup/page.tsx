'use client'

import { useState, useEffect } from 'react'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { JoinOrCreate } from '@/components/onboarding/JoinOrCreate'
import { Logo } from '@/components/ui/Logo'
import { Progress } from '@/components/ui/progress'
import { useUser } from '@/hooks/useUser'
import { useOnboarding } from '@/hooks/useOnboarding'
import { CreateCompany } from '@/components/onboarding/CreateCompany'

type OnboardingStep = 'signup' | 'join-or-create' | 'join' | 'create'

const STEPS = {
  signup: { number: 1, progress: 33 },
  'join-or-create': { number: 2, progress: 66 },
  join: { number: 3, progress: 100 },
  create: { number: 3, progress: 100 },
} as const

export default function SignUpPage() {
  const { loading } = useUser()
  const { step: urlStep } = useOnboarding()
  const [step, setStep] = useState<OnboardingStep>('signup')

  // Sync step with URL
  useEffect(() => {
    if (urlStep === 'join-or-create') {
      setStep('join-or-create')
    }
  }, [urlStep])

  const handleSignupSuccess = () => {
    setStep('join-or-create')
  }

  const handleJoinOrCreate = (type: 'join' | 'create') => {
    setStep(type)
  }

  const handleCreateCompany = async (data: { name: string; inviteCode: string }) => {
    // We'll implement the actual company creation later
    console.log('Creating company:', data)
  }

  // Show appropriate step
  const renderStep = () => {
    switch (step) {
      case 'join-or-create':
        return <JoinOrCreate onSelect={handleJoinOrCreate} isLoading={loading} />
      case 'create':
        return (
          <CreateCompany
            onSubmit={handleCreateCompany}
            isLoading={loading}
            onBack={() => setStep('join-or-create')}
          />
        )
      default:
        return <SignUpForm onSuccess={handleSignupSuccess} />
    }
  }

  // Conditional layout based on step
  if (step === 'signup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-emphasis px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold text-center text-foreground-emphasis">
            Create your free account
          </h1>

          <SignUpForm onSuccess={handleSignupSuccess} />
        </div>
      </div>
    )
  }

  // Split screen layout for other steps
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 min-h-screen bg-background-emphasis flex flex-col">
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
          <div className="flex justify-between text-sm text-foreground-muted">
            <span>Step {STEPS[step].number} of 3</span>
            <span>{STEPS[step].progress}% completed</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-sm text-foreground-muted border-t border-default">
          <p>© {new Date().getFullYear()} Courtify. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Preview/Info */}
      <div className="hidden lg:flex flex-1 bg-background-subtle items-center justify-center p-12">
        <div className="max-w-lg space-y-4">
          <h2 className="text-2xl font-semibold text-foreground-emphasis text-center">
            Welcome to Courtify
          </h2>
          <p className="text-foreground-subtle text-center text-base leading-relaxed">
            Streamline your court management with our comprehensive booking system. Whether
            you&apos;re joining an existing workspace or creating a new one, we&apos;re here to help
            you get started.
          </p>
        </div>
      </div>
    </div>
  )
}
