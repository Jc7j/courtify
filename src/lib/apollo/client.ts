import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { defaultApolloConfig, GRAPHQL_ENDPOINTS, cache } from './config'
import { getSession } from 'next-auth/react'

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
      )
    })
    // Optionally report to error tracking service
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
  return forward(operation)
})

const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from NextAuth session
  const session = await getSession()

  console.log('Session in authLink:', {
    hasSession: !!session,
    hasToken: !!session?.supabaseAccessToken,
  })

  return {
    headers: {
      ...headers,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      // Use Bearer format for authorization
      authorization: session?.supabaseAccessToken
        ? `Bearer ${session.supabaseAccessToken}`
        : `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
  }
})

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    GRAPHQL_ENDPOINTS[
      (process.env.NEXT_PUBLIC_APP_ENV || 'local') as keyof typeof GRAPHQL_ENDPOINTS
    ],
  credentials: 'include', // Important for auth
})

// Combine links
const link = from([errorLink, authLink, httpLink])

export const apolloClient = new ApolloClient({
  link,
  cache,
  ...defaultApolloConfig,
})

// Helper for SSR
export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache: new InMemoryCache(),
    ...defaultApolloConfig,
  })
}
