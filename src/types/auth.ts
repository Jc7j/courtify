import type { DefaultSession } from 'next-auth'

export interface BaseUser {
  id: string
  email: string
  name: string
  company_id: string | null
}

// What we get from Supabase/DB
export interface AuthorizedUser extends BaseUser {
  supabaseAccessToken: string
  supabaseRefreshToken: string
}

// Extend the built-in session type
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: BaseUser
    supabaseAccessToken: string
    error?: string
    supabaseRefreshToken?: string
  }

  interface User {
    id: string
    email: string
    name: string
    company_id: string | null
    supabaseAccessToken: string
    supabaseRefreshToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: BaseUser
    supabaseAccessToken: string
    supabaseRefreshToken: string
    error?: string
  }
}
