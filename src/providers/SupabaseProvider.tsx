'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSession } from 'next-auth/react'

const SupabaseContext = createContext(supabase)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { update } = useSession()

  useEffect(() => {
    let isMounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      // Sync NextAuth session with Supabase auth state changes
      switch (event) {
        case 'SIGNED_OUT':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          try {
            await update()
          } catch (error) {
            console.error('Failed to update NextAuth session:', error)
          }
          break
        default:
          break
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [update])

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => useContext(SupabaseContext)
