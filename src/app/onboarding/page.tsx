import { OnboardingFlow } from '@/features/onboarding/components/OnboardingFlow'

export default function OnboardingPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Get Started with Courtify
      </h1>
      <OnboardingFlow />
    </main>
  )
}
