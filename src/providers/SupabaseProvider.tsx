'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSession } from 'next-auth/react'

const SupabaseContext = createContext(supabase)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { data: session, update } = useSession()

  // Sync Supabase session with NextAuth session
  useEffect(() => {
    async function syncSession() {
      if (session?.supabaseAccessToken && session?.supabaseRefreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: session.supabaseAccessToken,
            refresh_token: session.supabaseRefreshToken,
          })

          if (error) {
            console.error('Error syncing Supabase session:', error)
            // Trigger NextAuth session update on error
            await update()
          }
        } catch (error) {
          console.error('Unexpected error syncing session:', error)
          await update()
        }
      }
    }

    syncSession()
  }, [session?.supabaseAccessToken, session?.supabaseRefreshToken, update])

  // Listen for Supabase auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await update()
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await update({
          supabaseAccessToken: session.access_token,
          supabaseRefreshToken: session.refresh_token,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [update])

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider')
  }
  return context
}
