import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { supabase } from '../supabase/client';
import { defaultApolloConfig, GRAPHQL_ENDPOINTS, cache } from './config';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Auth header link
const authLink = setContext(async (_, { headers }) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      ...(process.env.GRAPHQL_ADMIN_SECRET && {
        'x-hasura-admin-secret': process.env.GRAPHQL_ADMIN_SECRET,
      }),
    },
  };
});

// HTTP link with environment-aware endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || GRAPHQL_ENDPOINTS[
    (process.env.NEXT_PUBLIC_APP_ENV || 'local') as keyof typeof GRAPHQL_ENDPOINTS
  ],
  credentials: 'same-origin',
});

// Combine links
const link = from([errorLink, authLink, httpLink]);

export const apolloClient = new ApolloClient({
  link,
  cache,
  ...defaultApolloConfig,
});

// Helper for SSR
export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache: new InMemoryCache(),
    ...defaultApolloConfig,
  });
} 
