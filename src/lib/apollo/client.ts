import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase/client'
import type { BaseUser, MemberRole } from '@/types/auth'

const cache = new InMemoryCache()

const authLink = setContext(async (_, { headers }) => {
  // First try to get token from store
  const token = useUserStore.getState().accessToken

  if (token) {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }
  }

  // If no token in store, get fresh session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token && session.user) {
    const { data: userData } = await supabase
      .from('users')
      .select('name, company_id, role')
      .eq('id', session.user.id)
      .single()

    if (userData) {
      const baseUser: BaseUser = {
        ...session.user,
        name: userData.name,
        company_id: userData.company_id,
        role: userData.role as MemberRole,
      }

      useUserStore.getState().setSession({
        user: baseUser,
        accessToken: session.access_token,
      })
    }
  }

  return {
    headers: {
      ...headers,
      authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
    },
  }
})

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message.includes('JWT expired') || err.message.includes('invalid token')) {
        // Let Supabase handle the refresh and retry the operation
        return forward(operation)
      }
    }
  }

  if (networkError) {
    console.error('[Network error]:', networkError)
  }
})

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  headers: {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
})

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network' as const,
    nextFetchPolicy: 'cache-first' as const,
  },
}

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions,
  connectToDevTools: process.env.NODE_ENV === 'development',
})

export const clearApolloCache = async () => {
  try {
    await apolloClient.clearStore()
  } catch (error) {
    console.error('Error clearing Apollo cache:', error)
  }
}

export const refetchActiveQueries = async () => {
  try {
    await apolloClient.refetchQueries({
      include: 'active',
    })
  } catch (error) {
    console.error('Error refetching queries:', error)
  }
}
