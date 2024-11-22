import { ApolloClient, createHttpLink, from, InMemoryCache, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getSession, signOut } from 'next-auth/react'
import { ROUTES } from '@/constants/routes'

// Basic cache without merge functions
const cache = new InMemoryCache()

// Move isRefreshing flag outside of Observable to be shared across requests
let isRefreshing = false

// Handle auth errors
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message.includes('JWT expired')) {
        return new Observable((observer) => {
          // Check global isRefreshing flag
          if (!isRefreshing) {
            isRefreshing = true
            getSession()
              .then((session) => {
                if (!session || session.error) {
                  signOut({ redirect: false }).then(() => {
                    window.location.href = ROUTES.AUTH.SIGNIN
                  })
                  observer.complete()
                  return
                }

                // Retry the operation with new token
                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                })
              })
              .catch((error) => {
                observer.error(error)
              })
              .finally(() => {
                isRefreshing = false
              })
          } else {
            // If already refreshing, wait briefly and retry the operation
            setTimeout(() => {
              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              })
            }, 1000)
          }
        })
      }
    }
  }
})

// Add auth headers with fresh token check
const authLink = setContext(async (_, { headers }) => {
  try {
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
