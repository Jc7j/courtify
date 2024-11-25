import { ApolloClient, createHttpLink, from, InMemoryCache, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getSession, signOut } from 'next-auth/react'
import { ROUTES } from '@/constants/routes'
import type { Operation } from '@apollo/client/core'
import type { Observer } from 'zen-observable-ts'
import { clearTokenCache } from '@/lib/auth/token-manager'
import { useUserStore } from '@/stores/useUserStore'

const cache = new InMemoryCache()

interface PendingOperation {
  operation: Operation
  observer: Observer<unknown>
}

let pendingOperations: PendingOperation[] = []
let isRefreshing = false

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors?.some((err) => err.message.includes('JWT expired'))) {
    if (isRefreshing) {
      return new Observable((observer) => {
        pendingOperations.push({ operation, observer })
      })
    }

    isRefreshing = true

    return new Observable((observer) => {
      getSession()
        .then(async (session) => {
          if (!session || session.error) {
            clearTokenCache()
            useUserStore.getState().reset()
            await signOut({ redirect: false })
            window.location.href = ROUTES.AUTH.SIGNIN
            observer.complete()
            return
          }

          useUserStore.getState().setSession(session)

          forward(operation).subscribe(observer)
          pendingOperations.forEach(({ operation, observer }) => {
            forward(operation).subscribe(observer)
          })
        })
        .catch(async (error) => {
          console.error('Session refresh error:', error)
          clearTokenCache()
          useUserStore.getState().reset()
          await signOut({ redirect: false })
          window.location.href = ROUTES.AUTH.SIGNIN
          observer.error(error)
        })
        .finally(() => {
          isRefreshing = false
          pendingOperations = []
        })
    })
  }
})

const authLink = setContext(async (_, { headers }) => {
  const session = useUserStore.getState().session
  return session?.supabaseAccessToken
    ? {
        headers: {
          ...headers,
          authorization: `Bearer ${session.supabaseAccessToken}`,
        },
      }
    : { headers }
})

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only' },
    query: { fetchPolicy: 'network-only' },
    mutate: { fetchPolicy: 'no-cache' },
  },
})

export const clearApolloCache = () => apolloClient.clearStore()
