import { DefaultSession } from 'next-auth'
import { Database } from './supabase'

type AdminData = Database['public']['Tables']['admins']['Row'] & {
  companies: Database['public']['Tables']['companies']['Row']
}

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      isAdmin: boolean
      adminData: AdminData | null
    }
  }
}
