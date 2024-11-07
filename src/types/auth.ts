import { DefaultSession } from 'next-auth'
import { Database } from './supabase'
import { Company, User } from './graphql'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & 
      Partial<User> & {
        company: Company | null;
      }
  }
}
