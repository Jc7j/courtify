'use client'

import { ApolloProvider as BaseApolloProvider } from '@apollo/client'
import { apolloClient } from '@/lib/apollo/client'
import { useMemo, ReactNode } from 'react'

export function ApolloProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    apolloClient.setLink(apolloClient.link)
    return apolloClient
  }, [])

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>
}
