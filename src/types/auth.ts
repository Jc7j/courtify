import type { User as SupabaseUser } from '@supabase/supabase-js'

export type UserProfile = {
  id: string
  email: string
  name: string
  company_id: string | null
}

export interface BaseUser extends Omit<SupabaseUser, 'role' | 'app_metadata' | 'user_metadata'> {
  name: string
  company_id: string | null
}

export interface AuthSession {
  user: BaseUser
  accessToken: string
  refreshToken?: string | null
  expiresAt?: number | null
}
