'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@apollo/client'
import { GET_USER } from '@/gql/queries/user'
import type { BaseUser } from '@/types/auth'

interface UseUserReturn {
  user: BaseUser | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const { data: session, status } = useSession()

  const {
    data: userData,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery(GET_USER, {
    variables: { id: session?.user?.id },
    skip: !session?.user?.id,
    fetchPolicy: 'cache-first', // Use cache first, then network if needed
  })

  const user = userData?.usersCollection?.edges?.[0]?.node || null
  console.log('user', user)
  return {
    user,
    loading: status === 'loading' || queryLoading,
    error: queryError ? new Error(queryError.message) : null,
    refetch: async () => {
      await refetch()
    },
  }
}
