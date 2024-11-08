'use client'

import { ApolloProvider as BaseApolloProvider } from '@apollo/client'
import { useMemo } from 'react'
import { apolloClient, createApolloClient } from '@/lib/apollo/client'
import type { NormalizedCacheObject } from '@apollo/client'

interface Props {
  children: React.ReactNode
  pageProps?: {
    initialApolloState?: NormalizedCacheObject
  }
}

export function ApolloProvider({ children, pageProps }: Props) {
  const client = useMemo(() => {
    if (pageProps?.initialApolloState) {
      const client = createApolloClient()
      client.cache.restore(pageProps.initialApolloState)
      return client
    }
    return apolloClient
  }, [pageProps?.initialApolloState])

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>
}
