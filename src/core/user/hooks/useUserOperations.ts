import { useState } from 'react'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { ErrorToast, SuccessToast } from '@/shared/components/ui'
import { supabase } from '@/shared/lib/supabase/client'

import type { MemberRole, UserProfile } from '@/shared/types/auth'

interface UpdateUserInput {
  name?: string
  email?: string
  role?: MemberRole
  is_active?: boolean
  currentEmail: string
}

interface UseUserOperationsState {
  loading: boolean
  error: Error | null
}

export function useUserOperations() {
  const { updateUser } = useUserStore()
  const [state, setState] = useState<UseUserOperationsState>({
    loading: false,
    error: null,
  })

  const updateProfile = async (input: UpdateUserInput): Promise<UserProfile> => {
    const { name, email, role, is_active, currentEmail } = input

    setState((prev) => ({ ...prev, loading: true, error: null }))
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
          ...(role && { role }),
          ...(is_active && { is_active }),
          updated_at: new Date().toISOString(),
        })
        .eq('email', currentEmail)
        .select('id, email, name, facility_id, role, is_active')
        .single()

      if (updateError || !userData) {
        throw new Error(updateError?.message || 'Failed to update profile')
      }

      updateUser(userData)
      SuccessToast('Profile updated successfully')
      return userData
    } catch (err) {
      console.error('[User Operations] Update error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        input,
      })
      ErrorToast(err instanceof Error ? err.message : 'Failed to update profile')
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error('An unexpected error occurred'),
      }))
      throw err
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  return {
    ...state,
    updateProfile,
  }
}
