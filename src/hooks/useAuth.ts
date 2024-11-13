'use client'

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { supabase } from '@/lib/supabase/client'
import { getAuthErrorMessage, AUTH_ERRORS } from '@/lib/utils/auth-errors'
import { clearApolloCache } from '@/lib/apollo/client'

export function useAuth() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()

  async function signIn(email: string, password: string) {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      await updateSession()

      if (session?.user?.company_id) {
        router.replace(ROUTES.DASHBOARD)
      } else {
        router.replace(`${ROUTES.AUTH.SIGNUP}?step=create-intro`)
      }
    } catch (error) {
      console.error('Error signing in:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      // Check if email exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error(AUTH_ERRORS.EMAIL_EXISTS)
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (authError) throw authError

      const newUser = {
        id: authData.user?.id,
        email,
        name,
        active: true,
        email_verified_at: null,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: createError } = await supabase.from('users').insert([newUser])

      if (createError) throw createError

      // Sign in and redirect to create company
      await signIn(email, password)
    } catch (error) {
      console.error('Error signing up:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }

  async function signOut() {
    try {
      await nextAuthSignOut({ redirect: false })
      await clearApolloCache()
      router.replace(ROUTES.AUTH.SIGNIN)
    } catch (error) {
      console.error('Error signing out:', error)
      throw new Error(getAuthErrorMessage(error))
    }
  }

  return {
    user: session?.user,
    loading: status === 'loading',
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session?.user,
  }
}
