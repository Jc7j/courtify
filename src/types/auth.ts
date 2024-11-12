import { DefaultSession } from 'next-auth'

// Base user type that matches our database schema
export interface BaseUser {
  id: string
  email: string
  name: string
  company_id?: string | null
  active: boolean
  email_verified_at?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

// Type for authorized user that includes auth-specific fields
export interface AuthorizedUser extends BaseUser {
  supabaseAccessToken?: string
}

declare module 'next-auth' {
  interface Session {
    supabaseAccessToken?: string
    user: DefaultSession['user'] &
      BaseUser & {
        supabaseAccessToken?: string
      }
  }

  interface JWT {
    supabaseAccessToken?: string
    user?: BaseUser
  }
}
