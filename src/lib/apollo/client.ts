import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase/client'
import { BaseUser } from '@/types/auth'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        company: {
          // Keep cache for 5 minutes
          maxAge: 300000,
        },
      },
    },
  },
})

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

  if (session?.access_token) {
    useUserStore.getState().setSession({
      user: session.user as BaseUser,
      accessToken: session.access_token,
    })
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
})

// Add a custom fetch policy
const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  },
}

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions,
  connectToDevTools: process.env.NODE_ENV === 'development',
})

// Add a method to handle cache persistence
export const clearApolloCache = async () => {
  try {
    await apolloClient.clearStore()
  } catch (error) {
    console.error('Error clearing Apollo cache:', error)
  }
}

// Add a method to refetch active queries
export const refetchActiveQueries = async () => {
  try {
    await apolloClient.refetchQueries({
      include: 'active',
    })
  } catch (error) {
    console.error('Error refetching queries:', error)
  }
}
