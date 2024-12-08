import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase/client'
import type { MemberRole, UserProfile } from '@/types/auth'

interface UpdateUserInput {
  name?: string
  email?: string
  role?: MemberRole
  is_active?: boolean
  currentEmail: string
}

export function useUserOperations() {
  const { updateUser } = useUserStore()

  const updateProfile = async (input: UpdateUserInput): Promise<UserProfile> => {
    const { name, email, role, is_active, currentEmail } = input

    try {
      // Update auth email if changed
      if (email && email !== currentEmail) {
        const { error: updateAuthError } = await supabase.auth.updateUser({ email })
        if (updateAuthError) throw updateAuthError
      }

      // Update user profile in database
      const { data: userData, error: updateError } = await supabase
        .from('users')
        .update({
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
          ...(is_active && { is_active }),
          updated_at: new Date().toISOString(),
        })
        .eq('email', currentEmail)
        .select('id, email, name, company_id, role, is_active')
        .single()

      if (updateError || !userData) {
        throw new Error(updateError?.message || 'Failed to update profile')
      }

      // Update local state with partial data
      updateUser(userData)

      return userData
    } catch (error) {
      throw error instanceof Error ? error : new Error('An unexpected error occurred')
    }
  }

  return { updateProfile }
}
