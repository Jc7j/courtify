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
  fetchOptions: {
    mode: 'cors',
  },
})

const link = from([errorLink, authLink, httpLink])

export const apolloClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    ...defaultApolloConfig.defaultOptions,
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
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
