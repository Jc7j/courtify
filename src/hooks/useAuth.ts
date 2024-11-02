'use client'

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { ROUTES } from '@/constants/routes'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const signIn = useCallback(async (email: string) => {
    return nextAuthSignIn('email', {
      email,
      callbackUrl: ROUTES.DASHBOARD,
    })
  }, [])

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ 
      callbackUrl: ROUTES.AUTH.SIGNIN 
    })
  }, [])

  const loading = status === 'loading'
  const isAuthenticated = !!session?.user

  return {
    user: session?.user,
    loading,
    signIn,
    signOut,
    isAuthenticated,
  }
}
