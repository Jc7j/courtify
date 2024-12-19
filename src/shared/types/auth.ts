import type { User as SupabaseUser } from '@supabase/supabase-js'

export type MemberRole = 'owner' | 'admin' | 'member'

export type UserProfile = {
  id: string
  email: string
  name: string
  facility_id: string | null
  role: MemberRole
  is_active: boolean
  invited_by?: string
  joined_at?: string
}

export interface BaseUser extends Omit<SupabaseUser, 'role' | 'app_metadata' | 'user_metadata'> {
  name: string
  facility_id: string | null
  role: MemberRole
  is_active?: boolean
  invited_by?: string
  joined_at?: string
}

export interface AuthSession {
  user: BaseUser
  accessToken: string
  refreshToken?: string | null
  expiresAt?: number | null
}
