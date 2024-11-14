import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getSession } from 'next-auth/react'
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'

if (process.env.NODE_ENV !== 'production') {
  loadDevMessages()
  loadErrorMessages()
}

const GRAPHQL_ENDPOINTS = {
  local: 'http://localhost:54321/graphql/v1',
  staging: 'https://staging.api.courtify.com/graphql/v1',
  production: 'https://api.courtify.com/graphql/v1',
} as const

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        courts: {
          merge: false,
        },
        bookings: {
          keyArgs: ['where'],
          merge(existing, incoming) {
            return {
              edges: [...(existing?.edges || []), ...(incoming?.edges || [])],
            }
          },
        },
        usersCollection: {
          merge: false,
        },
      },
    },
  },
})

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
})

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network' as const,
    errorPolicy: 'ignore' as const,
  },
  query: {
    fetchPolicy: 'network-only' as const,
    errorPolicy: 'all' as const,
  },
  mutate: {
    errorPolicy: 'all' as const,
  },
}

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions,
})

export function clearApolloCache() {
  return apolloClient.clearStore()
}

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions,
  })
}
