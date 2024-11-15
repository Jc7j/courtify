'use client'
import { createContext, useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { useSession } from 'next-auth/react'
import { GET_USER } from '@/gql/queries/user'
import type { BaseUser } from '@/types/auth'

interface UserContextType {
  user: BaseUser | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: authStatus } = useSession()
  const isAuthLoading = authStatus === 'loading'

  const {
    data,
    loading: queryLoading,
    error,
    refetch,
  } = useQuery(GET_USER, {
    variables: { id: session?.user?.id },
    skip: !session?.user?.id,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  })

  const value = useMemo(
    () => ({
      user: data?.usersCollection?.edges?.[0]?.node || null,
      loading: isAuthLoading || queryLoading,
      error: error ? new Error(error.message) : null,
      refetch: async () => {
        await refetch()
      },
      isAuthenticated: !!session?.user,
    }),
    [data?.usersCollection?.edges, isAuthLoading, queryLoading, error, refetch, session?.user]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  console.log('context', context)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
