'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'

import { AUTH_ERRORS, getAuthErrorMessage } from '@/features/auth/utils/auth-errors'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'
import { useUserStore } from '@/core/user/hooks/useUserStore'

import { ROUTES } from '@/shared/constants/routes'
import { clearApolloCache } from '@/shared/lib/apollo/client'
import { supabase } from '@/shared/lib/supabase/client'

import type { BaseUser } from '@/shared/types/auth'
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
  const pathname = usePathname()
  const { setSession, reset, isLoading, setIsLoading } = useUserStore()
  const isSignupPage = pathname === ROUTES.AUTH.SIGNUP
  const setCompany = useCompanyStore((state) => state.setCompany)
  const resetCompany = useCompanyStore((state) => state.reset)

  // Centralized function to handle user data fetching and session setting
  const handleSession = useCallback(
    async (session: Session | null, options: { skipRedirect?: boolean } = {}) => {
      if (!session) {
        await reset()
        resetCompany()
        return
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(
            `
            id, 
            email, 
            name, 
            company_id, 
            role, 
            is_active,
            companies (
              id,
              name,
              slug,
              stripe_account_id,
              stripe_account_enabled
            )
          `
          )
          .eq('id', session.user.id)
          .single()

        if (userError) throw userError
        if (!userData) throw new Error(AUTH_ERRORS.USER_NOT_FOUND)
        if (!userData.is_active) throw new Error(AUTH_ERRORS.ACCOUNT_INACTIVE)

        setSession({
          user: {
            ...session.user,
            name: userData.name,
            company_id: userData.company_id,
            role: userData.role,
            is_active: userData.is_active,
          },
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at,
        })

        if (userData.company_id && userData.companies) {
          setCompany({
            id: userData.companies.id,
            name: userData.companies.name,
            slug: userData.companies.slug,
            stripe_account_id: userData.companies.stripe_account_id,
            stripe_account_enabled: userData.companies.stripe_account_enabled || false,
          })
        } else {
          resetCompany()
        }

        if (pathname === ROUTES.AUTH.SIGNIN) {
          router.replace(ROUTES.DASHBOARD.HOME)
        }
      } catch (error) {
        console.error('[Auth] Session handling error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: session.user.id,
        })
        await reset()
        resetCompany()

        if (!options.skipRedirect && !isSignupPage) {
          router.replace(ROUTES.AUTH.SIGNIN)
        }
      }
    },
    [reset, resetCompany, setCompany, router, setSession, pathname, isSignupPage]
  )

  useEffect(() => {
    // Skip session check on signup page
    if (isSignupPage) {
      setIsLoading(false)
      return
    }

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
          handleSession(session, { skipRedirect: isSignupPage })
          break
        case 'TOKEN_REFRESHED':
          handleSession(session)
          break
        case 'SIGNED_OUT':
          reset()
          if (!isSignupPage) {
            router.replace(ROUTES.AUTH.SIGNIN)
          }
          break
        default:
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [handleSession, reset, router, setIsLoading, isSignupPage])

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      await handleSession(data.session)
    } catch (error) {
      console.error('[Auth] Sign in error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
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

      const { data: userData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email,
            name,
            role: 'member',
            is_active: true,
          },
        ])
        .select()
        .single()

      if (profileError) {
        console.error('[Auth] Profile creation error:', profileError)
        await supabase.auth.signOut()
        throw profileError
      }

      setSession({
        user: {
          ...data.user,
          name: userData.name,
          company_id: null,
          role: userData.role,
          is_active: userData.is_active,
        },
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || null,
        expiresAt: data.session?.expires_at || null,
      })

      return signIn(email, password)
    } catch (error) {
      console.error('[Auth] Sign up error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
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
      await resetCompany()
      await supabase.auth.signOut()
      router.replace(ROUTES.AUTH.SIGNIN)
    } catch (error) {
      console.error('[Auth] Sign out error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
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
