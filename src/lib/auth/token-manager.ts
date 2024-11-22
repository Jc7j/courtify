import { supabase } from '../supabase/client'
import { apolloClient } from '../apollo/client'
import type { Session } from '@supabase/supabase-js'

interface RefreshResult {
  access_token: string | null
  refresh_token: string | null
  error?: string
}

let refreshPromise: Promise<RefreshResult> | null = null
let refreshTimeout: NodeJS.Timeout | null = null

export async function refreshToken(currentRefreshToken: string): Promise<RefreshResult> {
  if (!currentRefreshToken) {
    return {
      access_token: null,
      refresh_token: null,
      error: 'No refresh token provided',
    }
  }

  // If there's already a refresh in progress, return that promise
  if (refreshPromise) {
    return refreshPromise
  }

  // Clear any existing timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout)
  }

  // Create new refresh promise with timeout
  refreshPromise = (async () => {
    try {
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<RefreshResult>((_, reject) => {
        refreshTimeout = setTimeout(() => {
          refreshPromise = null
          reject(new Error('Token refresh timeout'))
        }, 10000) // 10 second timeout
      })

      // Race between the refresh operation and timeout
      const result = await Promise.race([
        (async () => {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: currentRefreshToken,
          })

          const session = data.session as Session | null

          if (error || !session) {
            console.error('Token refresh error:', error)
            return {
              access_token: null,
              refresh_token: null,
              error: error?.message ?? 'Session refresh failed',
            }
          }

          return {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }
        })(),
        timeoutPromise,
      ])

      // Clear Apollo cache to ensure fresh data with new token
      await apolloClient.clearStore()
      return result
    } catch (error) {
      console.error('Unexpected refresh error:', error)
      return {
        access_token: null,
        refresh_token: null,
        error: error instanceof Error ? error.message : 'Unexpected refresh error',
      }
    } finally {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout)
        refreshTimeout = null
      }
      refreshPromise = null
    }
  })()

  return refreshPromise
}
