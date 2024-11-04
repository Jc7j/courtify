'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingState } from '../types'

export function OnboardingFlow() {
  const [state, setState] = useState<OnboardingState>({
    type: 'new_company',
    step: 0,
    data: {}
  })
  const router = useRouter()

  const handleSubmit = useCallback(async (data: Partial<OnboardingState['data']>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
      step: prev.step + 1
    }))
  }, [])

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Step content will go here */}
      </div>
    </div>
  )
}
