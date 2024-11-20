'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function SessionDebug() {
  const { data: session } = useSession()
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!session?.expires) return

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = new Date(session.expires).getTime()
      setTimeLeft(Math.max(0, expiresAt - now))
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.expires])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
      <div>Session Debug:</div>
      <div>Token expires in: {timeLeft}s</div>
      <div>Has refresh token: {session?.supabaseRefreshToken ? 'Yes' : 'No'}</div>
      <div>Session error: {session?.error || 'None'}</div>
    </div>
  )
}
