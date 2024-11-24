import { supabase } from '../supabase/client'

interface RefreshResult {
  access_token: string | null
  refresh_token: string | null
  error?: string
  expires_at?: number
}

let refreshPromise: Promise<RefreshResult> | null = null
let lastRefreshTime = 0
const REFRESH_COOLDOWN = 1000 // 1 second cooldown
const MAX_RETRIES = 3

export async function refreshToken(
  currentRefreshToken: string,
  retryCount = 0
): Promise<RefreshResult> {
  if (!currentRefreshToken) {
    return {
      access_token: null,
      refresh_token: null,
      error: 'No refresh token provided',
    }
  }

  const now = Date.now()
  if (now - lastRefreshTime < REFRESH_COOLDOWN && refreshPromise) {
    return refreshPromise
  }

  lastRefreshTime = now
  refreshPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: currentRefreshToken,
      })

      if (error) {
        // Retry on network errors
        if (error.message.includes('network') && retryCount < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
          return refreshToken(currentRefreshToken, retryCount + 1)
        }

        throw error
      }

      if (!data.session) {
        throw new Error('No session returned from refresh')
      }

      // Update Supabase session
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      await supabase.auth.signOut()

      return {
        access_token: null,
        refresh_token: null,
        error: error instanceof Error ? error.message : 'Unexpected refresh error',
      }
    } finally {
      setTimeout(() => {
        refreshPromise = null
      }, REFRESH_COOLDOWN)
    }
  })()

  return refreshPromise
}

export function clearTokenCache() {
  refreshPromise = null
  lastRefreshTime = 0
}
