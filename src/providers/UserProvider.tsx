'use client'

import { useEffect, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/stores/useUserStore'

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()
  const { setSession, setIsLoading, reset } = useUserStore()

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else if (status === 'authenticated' && session) {
      setSession(session)
    } else {
      reset()
    }
  }, [session, status, setSession, setIsLoading, reset])

  return <>{children}</>
}
