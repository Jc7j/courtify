'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/stores/useUserStore'

const SupabaseContext = createContext(supabase)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const { setSession } = useUserStore()

  // Sync Supabase session with NextAuth session
  useEffect(() => {
    if (session?.supabaseAccessToken && session?.supabaseRefreshToken) {
      supabase.auth.setSession({
        access_token: session.supabaseAccessToken,
        refresh_token: session.supabaseRefreshToken,
      })
    }
  }, [session?.supabaseAccessToken, session?.supabaseRefreshToken])

  // Listen for Supabase auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession])

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => useContext(SupabaseContext)
