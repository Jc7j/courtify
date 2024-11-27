'use client'

import { useEffect, useState } from 'react'
import { apolloClient } from '@/lib/apollo/client'
import { useAuth } from '@/providers/AuthProvider'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase/client'

export function SessionDebug() {
  const { user } = useAuth()
  const { accessToken, isAuthenticated, isLoading } = useUserStore()
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [lastNetworkRequest, setLastNetworkRequest] = useState<string>('')
  const [sessionError, setSessionError] = useState<string>('')
  const [sessionDetails, setSessionDetails] = useState<{
    expiresAt: string | null
    refreshToken: boolean
    provider: string | null
    lastRefresh: string | null
  }>({
    expiresAt: null,
    refreshToken: false,
    provider: null,
    lastRefresh: null,
  })

  // Monitor session details and expiry
  useEffect(() => {
    if (!accessToken) return

    async function checkSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        setSessionError(`Session error: ${error.message}`)
        return
      }

      if (session) {
        // Update session details
        setSessionDetails({
          expiresAt: session.expires_at
            ? new Date(session.expires_at * 1000).toLocaleString()
            : null,
          refreshToken: !!session.refresh_token,
          provider: session.user?.app_metadata?.provider || 'email',
          lastRefresh: session.user?.last_sign_in_at
            ? new Date(session.user.last_sign_in_at).toLocaleString()
            : null,
        })

        // Calculate time left
        if (session.expires_at) {
          const expiresAt = session.expires_at * 1000
          const now = Date.now()
          setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)))
        }
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 1000)
    return () => clearInterval(interval)
  }, [accessToken])

  // Monitor Apollo network requests
  useEffect(() => {
    const cleanup = apolloClient.link.setOnError((error) => {
      setLastNetworkRequest(
        `Error: ${error.operation.operationName} - ${error.message} (${error.statusCode})`
      )
    })

    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  const cacheSize = JSON.stringify(apolloClient.cache.extract()).length

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm space-y-2 max-w-md overflow-auto max-h-[80vh]">
      <div className="font-bold border-b pb-1">Auth Status</div>
      <div className="space-y-1">
        <div>Status: {isAuthenticated ? '🟢 Authenticated' : '🔴 Not authenticated'}</div>
        <div>Loading: {isLoading ? '⏳ Loading...' : '✅ Ready'}</div>
        <div>Token expires in: {timeLeft > 0 ? `${timeLeft}s` : '🔴 Expired'}</div>
        <div>Has access token: {accessToken ? '✅ Yes' : '❌ No'}</div>
        <div className="break-all">
          Token preview: {accessToken ? `${accessToken.slice(0, 20)}...` : 'None'}
        </div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Session Details</div>
      <div className="space-y-1">
        <div>Expires at: {sessionDetails.expiresAt || 'Not set'}</div>
        <div>Has refresh token: {sessionDetails.refreshToken ? '✅ Yes' : '❌ No'}</div>
        <div>Auth provider: {sessionDetails.provider || 'None'}</div>
        <div>Last refresh: {sessionDetails.lastRefresh || 'Never'}</div>
        <div className="text-red-400">Session error: {sessionError || 'None'}</div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">User Info</div>
      <div className="space-y-1">
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>Name: {user?.name || 'None'}</div>
        <div>Company ID: {user?.company_id || 'None'}</div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Apollo Status</div>
      <div className="space-y-1">
        <div>Cache size: {Math.round(cacheSize / 1024)}KB</div>
        <div>Active queries: {Object.keys(apolloClient.getObservableQueries()).length}</div>
        <div className="break-all">Last error: {lastNetworkRequest || 'None'}</div>
      </div>
    </div>
  )
}
