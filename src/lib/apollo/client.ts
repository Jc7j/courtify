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
  }
  if (networkError) {
    console.error(`[Network error]:`, networkError)
  }
  return forward(operation)
})

// Centralized auth header handling
const authLink = setContext(async (_, { headers }) => {
  const session = await getSession()

  return {
    headers: {
      ...headers,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      authorization: session?.supabaseAccessToken ? `Bearer ${session.supabaseAccessToken}` : '',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }
})

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    GRAPHQL_ENDPOINTS[
      (process.env.NEXT_PUBLIC_APP_ENV as keyof typeof GRAPHQL_ENDPOINTS) || 'local'
    ],
  credentials: 'same-origin',
})

const link = from([errorLink, authLink, httpLink])

// Shared Apollo client instance
export const apolloClient = new ApolloClient({
  link,
  cache,
  ...defaultApolloConfig,
  defaultOptions: {
    ...defaultApolloConfig.defaultOptions,
    watchQuery: {
      ...defaultApolloConfig.defaultOptions?.watchQuery,
      fetchPolicy: 'cache-and-network',
    },
  },
})

// Add this function to clear cache on logout
export function clearApolloCache() {
  return apolloClient.clearStore()
}

// Helper for SSR
export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache: new InMemoryCache(),
    ...defaultApolloConfig,
  })
}
