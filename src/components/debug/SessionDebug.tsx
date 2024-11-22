'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { apolloClient } from '@/lib/apollo/client'
import { useSupabase } from '@/providers/SupabaseProvider'
import type { Session as SupabaseSession } from '@supabase/supabase-js'

export function SessionDebug() {
  const { data: session, status } = useSession()
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [lastNetworkRequest, setLastNetworkRequest] = useState<string>('')
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null)
  const supabase = useSupabase()

  useEffect(() => {
    if (!session?.expires) return

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = new Date(session.expires).getTime() / 1000
      setTimeLeft(Math.max(0, expiresAt - now))
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.expires])

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

  // Get Supabase session
  useEffect(() => {
    async function getSupabaseSession() {
      const { data } = await supabase.auth.getSession()
      setSupabaseSession(data.session)
    }
    getSupabaseSession()
  }, [supabase])

  if (process.env.NODE_ENV !== 'development') return null

  const cacheSize = JSON.stringify(apolloClient.cache.extract()).length

  const formatExpiryDate = (expiresAt: number | undefined | null) => {
    if (!expiresAt) return 'Not set'
    return new Date(expiresAt * 1000).toLocaleString()
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm space-y-2 max-w-md overflow-auto max-h-[80vh]">
      <div className="font-bold border-b pb-1">NextAuth Session</div>
      <div className="space-y-1">
        <div>Status: {status}</div>
        <div>Token expires in: {timeLeft}s</div>
        <div>Has access token: {session?.supabaseAccessToken ? 'Yes' : 'No'}</div>
        <div>Access token: {session?.supabaseAccessToken?.slice(0, 20)}...</div>
        <div>Has refresh token: {session?.supabaseRefreshToken ? 'Yes' : 'No'}</div>
        <div>Session error: {session?.error || 'None'}</div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Supabase Session</div>
      <div className="space-y-1">
        <div>Has session: {supabaseSession ? 'Yes' : 'No'}</div>
        <div>Access token: {supabaseSession?.access_token?.slice(0, 20)}...</div>
        <div>Expires at: {formatExpiryDate(supabaseSession?.expires_at)}</div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">Apollo Debug</div>
      <div className="space-y-1">
        <div>Cache size: {Math.round(cacheSize / 1024)}KB</div>
        <div>Active queries: {Object.keys(apolloClient.getObservableQueries()).length}</div>
        <div className="break-all">Last error: {lastNetworkRequest || 'None'}</div>
      </div>

      <div className="font-bold border-b pb-1 pt-2">User Debug</div>
      <div className="space-y-1">
        <div>User ID: {session?.user?.id || 'None'}</div>
        <div>Company ID: {session?.user?.company_id || 'None'}</div>
      </div>
    </div>
  )
}
