import { ApolloClientOptions, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (process.env.NODE_ENV !== 'production') {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

export const GRAPHQL_ENDPOINTS = {
  local: 'http://localhost:54321/graphql/v1',
  staging: 'https://staging.api.courtify.com/graphql/v1',
  production: 'https://api.courtify.com/graphql/v1',
} as const;

// Create a shared cache instance
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        courts: {
          merge: false, // Don't merge court arrays
        },
        bookings: {
          // Pagination merge function
          keyArgs: ['where'], // Fields that uniquely identify the list
          merge(existing = [], incoming: any[]) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});

export const defaultApolloConfig: Omit<ApolloClientOptions<NormalizedCacheObject>, 'cache' | 'link'> = {
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
}; 
