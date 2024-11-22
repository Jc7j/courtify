import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getSession, signOut } from 'next-auth/react'
import { ROUTES } from '@/constants/routes'

// Basic cache without merge functions
const cache = new InMemoryCache()

// Handle auth errors
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message.includes('JWT expired')) {
        // Try to refresh the session first
        getSession().then((session) => {
          if (!session || session.error) {
            // If refresh failed, sign out
            signOut({ redirect: false }).then(() => {
              window.location.href = ROUTES.AUTH.SIGNIN
            })
          }
        })
      }
    }
  }
})

// Add auth headers with fresh token check
const authLink = setContext(async (_, { headers }) => {
  try {
    // Always get a fresh session
    const session = await getSession()

    if (!session?.supabaseAccessToken) {
      return { headers }
    }

    return {
      headers: {
        ...headers,
        authorization: `Bearer ${session.supabaseAccessToken}`,
      },
    }
  } catch (error) {
    console.error('Auth link error:', error)
    return { headers }
  }
})

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
})

// Simple cache clear function
export function clearApolloCache() {
  return apolloClient.clearStore()
}
