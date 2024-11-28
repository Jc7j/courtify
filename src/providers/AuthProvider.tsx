'use client'

import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'
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
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { setSession, reset, isLoading, setIsLoading } = useUserStore()

  // Centralized function to handle user data fetching and session setting
  const handleSession = useCallback(
    async (session: Session | null) => {
      if (!session) {
        await reset()
        return
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, name, company_id, active')
          .eq('id', session.user.id)
          .single()

        if (error || !userData || !userData.active) {
          throw new Error(error?.message || AUTH_ERRORS.USER_NOT_FOUND)
        }

        setSession({
          user: {
            ...session.user,
            name: userData.name,
            company_id: userData.company_id,
          },
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at,
        })
      } catch (error) {
        console.error('Session handling error:', error)
        await reset()
        router.replace(ROUTES.AUTH.SIGNIN)
      }
    },
    [reset, router, setSession]
  )

  // Initialize and monitor auth state
  useEffect(() => {
    setIsLoading(true)

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session).finally(() => setIsLoading(false))
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          handleSession(session)
          break
        case 'SIGNED_OUT':
          reset()
          router.replace(ROUTES.AUTH.SIGNIN)
          break
      }
    })

    return () => subscription.unsubscribe()
  }, [handleSession, reset, router, setIsLoading])

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      await handleSession(data.session)
      router.replace(ROUTES.DASHBOARD.HOME)
    } catch (error) {
      throw new Error(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })
      if (error) throw error
      if (!data.user?.id) throw new Error('No user ID returned from signup')

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          name,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        await supabase.auth.signOut()
        throw profileError
      }

      // Auto sign in after signup
      return signIn(email, password)
    } catch (error) {
      if (error instanceof Error && error.message.includes('User already registered')) {
        throw new Error(AUTH_ERRORS.EMAIL_EXISTS)
      }
      throw new Error(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function signOut() {
    try {
      setIsLoading(true)
      await clearApolloCache()
      await reset()
      await supabase.auth.signOut()
      router.replace(ROUTES.AUTH.SIGNIN)
    } catch (error) {
      console.error('Sign out error:', error)
      throw new Error(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user: useUserStore((state) => state.user),
    isLoading,
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
