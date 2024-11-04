'use client'

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { ROUTES } from '@/constants/routes'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const signIn = useCallback(async (email: string) => {
    return nextAuthSignIn('email', {
      email,
      callbackUrl: ROUTES.DASHBOARD,
    })
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Redirect to verify page
      router.push(ROUTES.AUTH.VERIFY)
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }, [router])

  const signOut = useCallback(async () => {
    await Promise.all([
      nextAuthSignOut({ callbackUrl: ROUTES.AUTH.SIGNIN }),
      supabase.auth.signOut(),
    ])
  }, [])

  const loading = status === 'loading'
  const isAuthenticated = !!session?.user

  return {
    user: session?.user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  }
}
