'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { BaseUser } from '@/types/auth'
import { supabase } from '@/lib/supabase/client'

interface UseUserReturn {
  user: BaseUser | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<BaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = useCallback(async () => {
    if (!session?.user?.id) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const { data, error: userError } = await supabase
        .from('users')
        .select(
          `
          id,
          email,
          name,
          company_id,
          active,
          email_verified_at,
          last_login_at,
          created_at,
          updated_at
        `
        )
        .eq('id', session.user.id)
        .single()

      if (userError) throw userError

      setUser(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    loading: loading || status === 'loading',
    error,
    refetch: fetchUser,
  }
}
