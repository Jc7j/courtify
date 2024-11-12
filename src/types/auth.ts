import { DefaultSession } from 'next-auth'
import { User } from './graphql'

declare module 'next-auth' {
  interface Session {
    supabaseAccessToken?: string
    user: DefaultSession['user'] & User & { supabaseAccessToken?: string }
  }

  interface JWT {
    supabaseAccessToken?: string
    user?: User
  }
}
