'use client'

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { getAuthErrorMessage, AUTH_ERRORS } from '@/lib/utils/auth-errors'
import { clearApolloCache } from '@/lib/apollo/client'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { useUserStore } from '@/stores/useUserStore'

export function useAuth() {
  const router = useRouter()
  const { reset } = useUserStore()

  async function signIn(email: string, password: string) {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) throw new Error(result.error)
      if (result?.ok) router.replace(ROUTES.DASHBOARD.HOME)
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

      if (existingUser) throw new Error(AUTH_ERRORS.EMAIL_EXISTS)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })

      if (authError) throw authError

      const { error: createError } = await supabase.from('users').insert([
        {
          id: authData.user?.id,
          email,
          name,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (createError) throw createError

      return signIn(email, password)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  async function signOut() {
    try {
      await clearApolloCache()
      reset()
      return nextAuthSignOut({ redirect: false })
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  return { signIn, signUp, signOut }
}
