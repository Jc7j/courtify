'use client'

import { ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/stores/useUserStore'

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()
  const { setSession, setIsLoading, reset, user } = useUserStore()

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else if (status === 'authenticated' && session) {
      if (!user?.company_id && session.user?.company_id) {
        setSession(session)
      } else if (JSON.stringify(user) !== JSON.stringify(session.user)) {
        setSession(session)
      }
    } else {
      reset()
    }
  }, [session, status, setSession, setIsLoading, reset, user])

  useEffect(() => {
    if (user?.company_id && !session?.user?.company_id) {
      update()
    }
  }, [user?.company_id, session?.user?.company_id, update])

  return <>{children}</>
}
