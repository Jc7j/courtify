import { DefaultSession } from 'next-auth'
import type { Company } from './graphql'

declare module 'next-auth' {
  interface Session {
    supabaseAccessToken?: string
    user: DefaultSession['user'] & User
  }

  interface User {
    id: string
    email: string
    name: string
    company: Company | null
    supabaseAccessToken?: string
    active?: boolean
    created_at?: string
    updated_at?: string
  }

  interface JWT {
    supabaseAccessToken?: string
    user?: User
  }
}
