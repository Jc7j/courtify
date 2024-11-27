import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface BaseUser extends Omit<SupabaseUser, 'role' | 'app_metadata' | 'user_metadata'> {
  name: string
  company_id: string | null
}

export interface AuthSession {
  user: BaseUser
  accessToken: string
}
