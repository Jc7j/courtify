'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { ROUTES } from '@/constants/routes'

export function useOnboarding() {
  const { user, loading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get('step')

  useEffect(() => {
    if (loading) return

    // If user has no company_id and we're not already on signup page
    if (user && !user.company_id && !window.location.pathname.includes(ROUTES.AUTH.SIGNUP)) {
      router.push(`${ROUTES.AUTH.SIGNUP}?step=join-or-create`)
    }
  }, [user, loading, router])

  return {
    isOnboarding: !user?.company_id,
    step: step || 'signup',
  }
} 
