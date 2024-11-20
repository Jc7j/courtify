'use client'

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { getAuthErrorMessage, AUTH_ERRORS } from '@/lib/utils/auth-errors'
import { clearApolloCache } from '@/lib/apollo/client'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export function useAuth() {
  const { data: session, status } = useSession()
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
      if (result?.status === 200) {
        router.replace(ROUTES.DASHBOARD)
      }
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error(AUTH_ERRORS.EMAIL_EXISTS)
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (authError) throw authError

      const newUser = {
        id: authData.user?.id,
        email,
        name,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: createError } = await supabase.from('users').insert([newUser])

      if (createError) throw createError

      return signIn(email, password)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  async function signOut() {
    try {
      await clearApolloCache()
      return nextAuthSignOut({ redirect: false })
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  return {
    user: session?.user,
    loading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signIn,
    signUp,
    signOut,
  }
}
