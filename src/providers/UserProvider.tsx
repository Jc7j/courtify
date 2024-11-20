'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

interface UserContextType {
  user: Session['user'] | null
  loading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()

  const value = useMemo(
    () => ({
      user: session?.user || null,
      loading: status === 'loading',
      isAuthenticated: status === 'authenticated' && !!session?.user,
      refetch: async () => {
        await update()
      },
    }),
    [session?.user, status, update]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
