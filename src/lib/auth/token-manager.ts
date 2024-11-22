import { supabase } from '../supabase/client'

interface RefreshResult {
  access_token: string | null
  refresh_token: string | null
  error?: string
}

let refreshPromise: Promise<RefreshResult> | null = null

export async function refreshToken(currentRefreshToken: string): Promise<RefreshResult> {
  if (!currentRefreshToken) {
    return { access_token: null, refresh_token: null, error: 'No refresh token provided' }
  }

  // If there's already a refresh in progress, wait for it
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      // Try to refresh the session using Supabase
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: currentRefreshToken,
      })

      if (error || !data.session) {
        console.error('Token refresh error:', error)
        await supabase.auth.signOut()
        return {
          access_token: null,
          refresh_token: null,
          error: error?.message ?? 'Session refresh failed',
        }
      }

      // Set the new session in Supabase
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }
    } catch (error) {
      console.error('Unexpected refresh error:', error)
      await supabase.auth.signOut()
      return {
        access_token: null,
        refresh_token: null,
        error: error instanceof Error ? error.message : 'Unexpected refresh error',
      }
    } finally {
      setTimeout(() => {
        refreshPromise = null
      }, 1000)
    }
  })()

  return refreshPromise
}

// Add a helper function to clear the token cache
export function clearTokenCache() {
  refreshPromise = null
}
