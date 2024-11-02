'use client'

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { useMemo } from 'react';
import { apolloClient, createApolloClient } from '@/lib/apollo/client';

export function ApolloProvider({ 
  children,
  pageProps
}: { 
  children: React.ReactNode;
  pageProps?: any;
}) {
  const client = useMemo(() => {
    if (pageProps?.initialApolloState) {
      const client = createApolloClient();
      client.cache.restore(pageProps.initialApolloState);
      return client;
    }
    return apolloClient;
  }, [pageProps?.initialApolloState]);

  return (
    <BaseApolloProvider client={client}>
      {children}
    </BaseApolloProvider>
  );
}
