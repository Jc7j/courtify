'use client'

import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/useUserStore'
import { usePathname, useRouter } from 'next/navigation'
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
  const pathname = usePathname()
  const { setSession, reset, isLoading, setIsLoading } = useUserStore()
  const isSignupPage = pathname === ROUTES.AUTH.SIGNUP

  // Centralized function to handle user data fetching and session setting
  const handleSession = useCallback(
    async (session: Session | null, options: { skipRedirect?: boolean } = {}) => {
      console.log('[Auth] Handling session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        pathname,
        skipRedirect: options.skipRedirect,
      })

      if (!session) {
        console.log('[Auth] No session, resetting state')
        await reset()
        return
      }

      if (session && pathname === ROUTES.AUTH.SIGNIN) {
        console.log('[Auth] User already signed in, redirecting to dashboard')
        router.replace(ROUTES.DASHBOARD.HOME)
        return
      }

      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, company_id, role, is_active')
          .eq('id', session.user.id)
          .single()

        console.log('[Auth] Fetched user data:', {
          success: !!userData,
          error: userError?.message,
          isActive: userData?.is_active,
        })

        if (userError) throw userError
        if (!userData) throw new Error(AUTH_ERRORS.USER_NOT_FOUND)
        if (!userData.is_active) throw new Error(AUTH_ERRORS.ACCOUNT_INACTIVE)

        // Set session with user data
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

        console.log('[Auth] Session set successfully', {
          hasCompany: !!userData.company_id,
          role: userData.role,
        })
      } catch (error) {
        console.error('[Auth] Session handling error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: session.user.id,
        })
        await reset()

        // Only redirect if not on signup page and redirect not explicitly skipped
        if (!options.skipRedirect && !isSignupPage) {
          console.log('[Auth] Redirecting to signin due to error')
          router.replace(ROUTES.AUTH.SIGNIN)
        }
      }
    },
    [reset, router, setSession, pathname, isSignupPage]
  )

  // Initialize and monitor auth state
  useEffect(() => {
    console.log('[Auth] Initializing auth state', {
      isSignupPage,
      pathname,
    })

    // Skip session check on signup page
    if (isSignupPage) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[Auth] Initial session check:', {
        hasSession: !!session,
        error: error?.message,
      })
      handleSession(session).finally(() => setIsLoading(false))
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Auth state changed:', {
        event,
        hasSession: !!session,
      })

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
          console.log('[Auth] Unhandled auth event:', event)
      }
    })

    return () => {
      console.log('[Auth] Cleaning up auth subscriptions')
      subscription.unsubscribe()
    }
  }, [handleSession, reset, router, setIsLoading, isSignupPage])

  // Sign in function with enhanced error handling
  async function signIn(email: string, password: string) {
    try {
      console.log('[Auth] Attempting sign in:', { email })
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      await handleSession(data.session)
      router.replace(ROUTES.DASHBOARD.HOME)
    } catch (error) {
      console.error('[Auth] Sign in error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw new Error(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up function with enhanced error handling
  async function signUp(email: string, password: string, name: string) {
    try {
      console.log('[Auth] Attempting sign up:', { email, name })
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

      console.log('[Auth] Creating user profile')
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email,
            name,
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

      console.log('[Auth] Setting initial session')
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

  // Sign out function with enhanced error handling
  async function signOut() {
    try {
      console.log('[Auth] Signing out')
      setIsLoading(true)
      await clearApolloCache()
      await reset()
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
