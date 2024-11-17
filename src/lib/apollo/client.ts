import { ApolloClient, createHttpLink, from, InMemoryCache, gql } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getSession } from 'next-auth/react'
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'
import { ROUTES } from '@/constants/routes'

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
        courtsCollection: {
          merge(existing, incoming, { args }) {
            // For single court queries, replace the existing data
            if (args?.first === 1) {
              return incoming
            }

            // For collection queries, merge the data
            return {
              ...incoming,
              edges: incoming.edges,
            }
          },
          read(existing, { args }) {
            if (!existing) return undefined

            // For single court queries
            if (args?.first === 1 && args?.filter) {
              const court = existing.edges?.find(
                (edge: any) =>
                  edge.node.company_id === args.filter.company_id.eq &&
                  edge.node.court_number === args.filter.court_number.eq
              )
              return court ? { edges: [court], __typename: 'CourtsConnection' } : undefined
            }

            // For company courts queries
            if (args?.filter?.company_id) {
              const companyId = args.filter.company_id.eq
              const edges = existing.edges?.filter(
                (edge: any) => edge.node.company_id === companyId
              )
              return edges?.length ? { edges, __typename: 'CourtsConnection' } : undefined
            }

            return existing
          },
        },
      },
    },
    Courts: {
      keyFields: ['company_id', 'court_number'], // Composite key for court records
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
  try {
    const session = await getSession()

    if (session?.error === 'RefreshAccessTokenError') {
      // Handle session refresh error
      window.location.href = ROUTES.AUTH.SIGNIN
      return { headers }
    }

    return {
      headers: {
        ...headers,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        authorization: session?.supabaseAccessToken ? `Bearer ${session.supabaseAccessToken}` : '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  } catch (error) {
    console.error('Auth link error:', error)
    return { headers }
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
    fetchPolicy: 'cache-first' as const,
    nextFetchPolicy: 'cache-and-network' as const,
    errorPolicy: 'ignore' as const,
  },
  query: {
    fetchPolicy: 'cache-first' as const,
    nextFetchPolicy: 'cache-and-network' as const,
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
