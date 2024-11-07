'use client'

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { ROUTES } from '@/constants/routes'
import { supabase } from '@/lib/supabase/client'
import { getAuthErrorMessage, AUTH_ERRORS } from '@/lib/utils/auth-errors'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const signIn = useCallback(async (email: string) => {
    try {
      const { data: user, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) {
        throw new Error(AUTH_ERRORS.NO_USER_FOUND)
      }

      const result = await nextAuthSignIn('email', {
        email,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push(ROUTES.AUTH.VERIFY)
    } catch (error) {
      console.error('Error signing in:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }, [router])

  const signUp = useCallback(async (email: string, name: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error(AUTH_ERRORS.EMAIL_EXISTS)
      }

      // Create new user
      const { error: createError } = await supabase
        .from('users')
        .insert([{ email, name, active: true }])

      if (createError) throw createError

      // Then sign in
      await signIn(email)
    } catch (error) {
      console.error('Error signing up:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }, [signIn])

  const signOut = useCallback(async () => {
    try {
      await nextAuthSignOut({ redirect: false })
      router.push(ROUTES.AUTH.SIGNIN)
    } catch (error) {
      console.error('Error signing out:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }, [router])

  return {
    user: session?.user,
    loading: status === 'loading',
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session?.user,
  }
}
