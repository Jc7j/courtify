'use client'

import { useEffect, useState } from 'react'
import { apolloClient } from '@/lib/apollo/client'
import { useAuth } from '@/providers/AuthProvider'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase/client'

export function SessionDebug() {
  const { user } = useAuth()
  const { accessToken, refreshToken, expiresAt, isAuthenticated, isLoading } = useUserStore()
  const [storageState, setStorageState] = useState<{
    authStorage: boolean
    userStorage: boolean
  }>({
    authStorage: false,
    userStorage: false,
  })
  const [sessionDetails, setSessionDetails] = useState<{
    expiresAt: string | null
    hasRefreshToken: boolean
    provider: string | null
    lastRefresh: string | null
    sessionError: string | null
  }>({
    expiresAt: null,
    hasRefreshToken: false,
    provider: null,
    lastRefresh: null,
    sessionError: null,
  })

  // Check localStorage availability and content
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStorageState({
        authStorage: !!window.localStorage.getItem('courtify-auth'),
        userStorage: !!window.localStorage.getItem('courtify-user-store'),
      })
    }
  }, [])

  // Monitor session details and expiry
  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        setSessionDetails((prev) => ({ ...prev, sessionError: error.message }))
        return
      }

      if (session) {
        setSessionDetails({
          expiresAt: session.expires_at
            ? new Date(session.expires_at * 1000).toLocaleString()
            : null,
          hasRefreshToken: !!session.refresh_token,
          provider: session.user?.app_metadata?.provider || 'email',
          lastRefresh: session.user?.last_sign_in_at
            ? new Date(session.user.last_sign_in_at).toLocaleString()
            : null,
          sessionError: null,
        })
      } else {
        setSessionDetails({
          expiresAt: null,
          hasRefreshToken: false,
          provider: null,
          lastRefresh: null,
          sessionError: 'No active session',
        })
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 1000)
    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  const timeLeft = expiresAt ? Math.max(0, Math.floor((expiresAt * 1000 - Date.now()) / 1000)) : 0
  const cacheSize = JSON.stringify(apolloClient.cache.extract()).length

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm space-y-2 max-w-md overflow-auto max-h-[80vh]">
      <div className="font-bold border-b pb-1">Auth Status</div>
      <div className="space-y-1">
        <div>Status: {isAuthenticated ? '🟢 Authenticated' : '🔴 Not authenticated'}</div>
        <div>Loading: {isLoading ? '⏳ Loading...' : '✅ Ready'}</div>
        <div>Token expires in: {timeLeft > 0 ? `${timeLeft}s` : '🔴 Expired'}</div>
        <div>Access token: {accessToken ? '✅ Yes' : '❌ No'}</div>
        <div>Refresh token: {refreshToken ? '✅ Yes' : '❌ No'}</div>
        <div className="break-all">
          Token preview: {accessToken ? `${accessToken.slice(0, 20)}...` : 'None'}
        </div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Session Details</div>
      <div className="space-y-1">
        <div>Expires at: {sessionDetails.expiresAt || 'Not set'}</div>
        <div>Has refresh token: {sessionDetails.hasRefreshToken ? '✅ Yes' : '❌ No'}</div>
        <div>Auth provider: {sessionDetails.provider || 'None'}</div>
        <div>Last refresh: {sessionDetails.lastRefresh || 'Never'}</div>
        <div className="text-red-400">Session error: {sessionDetails.sessionError || 'None'}</div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Store State</div>
      <div className="space-y-1">
        <div>Store authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div>Store loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
        <div>
          Store expires at: {expiresAt ? new Date(expiresAt * 1000).toLocaleString() : 'Not set'}
        </div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">User Info</div>
      <div className="space-y-1">
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>Name: {user?.name || 'None'}</div>
        <div>Company ID: {user?.company_id || 'None'}</div>
        <div>
          Last updated: {user?.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'}
        </div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Storage Info</div>
      <div className="space-y-1">
        <div>LocalStorage auth: {storageState.authStorage ? '✅ Present' : '❌ Missing'}</div>
        <div>LocalStorage user: {storageState.userStorage ? '✅ Present' : '❌ Missing'}</div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Apollo Status</div>
      <div className="space-y-1">
        <div>Cache size: {Math.round(cacheSize / 1024)}KB</div>
        <div>Active queries: {Object.keys(apolloClient.getObservableQueries()).length}</div>
      </div>
    </div>
  )
}
