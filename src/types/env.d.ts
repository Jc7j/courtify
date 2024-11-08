declare namespace NodeJS {
  interface ProcessEnv {
    // Environment
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_APP_ENV: 'local' | 'staging' | 'production'

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    SUPABASE_DB_URL: string
    SUPABASE_PROJECT_REF: string

    // GraphQL
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: string
    GRAPHQL_ADMIN_SECRET?: string

    // Optional local overrides
    SUPABASE_LOCAL_URL?: string
    SUPABASE_LOCAL_ANON_KEY?: string

    // NextAuth Configuration
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string

    // Email Provider
    EMAIL_SERVER: string
    EMAIL_FROM: string
  }
}
