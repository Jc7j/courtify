'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/useUserStore'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { AUTH_ERRORS, getAuthErrorMessage } from '@/lib/utils/auth-errors'
import { clearApolloCache } from '@/lib/apollo/client'
import type { BaseUser } from '@/types/auth'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: BaseUser | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { setSession, reset } = useUserStore()

  const setUserSession = async (supabaseSession: Session | null) => {
    if (!supabaseSession) {
      await setSession(null)
      return
    }

    try {
      // Fetch complete user data from our database
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, name, company_id, active')
        .eq('id', supabaseSession.user.id)
        .single()

      if (error) throw error

      // Combine Supabase auth data with our database user data
      const completeUser: BaseUser = {
        ...supabaseSession.user,
        name: userData.name,
        company_id: userData.company_id,
      }

      await setSession({
        user: completeUser,
        accessToken: supabaseSession.access_token,
      })
    } catch (error) {
      console.error('Error fetching complete user data:', error)
      reset()
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await setUserSession(session)
      } else if (event === 'SIGNED_OUT') {
        reset()
        router.replace(ROUTES.AUTH.SIGNIN)
      }
    })

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, reset])

  const signUp = async (email: string, password: string, name: string) => {
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
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}${ROUTES.AUTH.CALLBACK}`,
        },
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

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      if (data.session) {
        await setUserSession(data.session)
        router.replace(ROUTES.DASHBOARD.HOME)
      }
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  const signOut = async () => {
    try {
      await clearApolloCache()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.replace(ROUTES.AUTH.SIGNIN)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    }
  }

  const value = {
    user: useUserStore((state) => state.user),
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
