import { useSupabase } from '@/providers/SupabaseProvider'
import { useUser } from '@/providers/UserProvider'
import { useSession } from 'next-auth/react'
import type { BaseUser } from '@/types/auth'

interface UpdateUserInput {
  name?: string
  email?: string
  currentEmail: string
}

export function useUserOperations() {
  const supabase = useSupabase()
  const { update } = useSession()
  const { refetch } = useUser()

  const updateProfile = async (input: UpdateUserInput): Promise<BaseUser> => {
    const { name, email, currentEmail } = input

    try {
      // If updating email, update auth first
      if (email && email !== currentEmail) {
        const { error: updateAuthError } = await supabase.auth.updateUser({ email })
        if (updateAuthError) {
          throw new Error(updateAuthError.message)
        }
      }

      // Update user profile in database
      const { data: userData, error: updateError } = await supabase
        .from('users')
        .update({
          ...(name && { name }),
          ...(email && { email }),
          updated_at: new Date().toISOString(),
        })
        .eq('email', currentEmail)
        .select('id, email, name, company_id')
        .single()

      if (updateError || !userData) {
        throw new Error(updateError?.message || 'Failed to update profile')
      }

      // Sync NextAuth session and UserProvider
      await update()
      await refetch()

      return userData
    } catch (error) {
      // Re-throw error to be handled by the component
      throw error instanceof Error ? error : new Error('An unexpected error occurred')
    }
  }

  return {
    updateProfile,
  }
}
