import { useSupabase } from '@/providers/SupabaseProvider'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/stores/useUserStore'
import type { Session } from 'next-auth'

interface UpdateUserInput {
  name?: string
  email?: string
  currentEmail: string
}

export function useUserOperations() {
  const supabase = useSupabase()
  const { update } = useSession()
  const { setSession } = useUserStore()

  const updateProfile = async (input: UpdateUserInput): Promise<Session['user']> => {
    const { name, email, currentEmail } = input

    try {
      if (email && email !== currentEmail) {
        const { error: updateAuthError } = await supabase.auth.updateUser({ email })
        if (updateAuthError) throw updateAuthError
      }

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

      const newSession = await update()
      if (!newSession) {
        throw new Error('Failed to update session')
      }

      setSession(newSession)

      if (!newSession.user) {
        throw new Error('Session update did not return user data')
      }

      return newSession.user
    } catch (error) {
      throw error instanceof Error ? error : new Error('An unexpected error occurred')
    }
  }

  return { updateProfile }
}
