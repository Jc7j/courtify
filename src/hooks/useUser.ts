'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { User } from '@/types/graphql'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UseUserReturn {
  user: User | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
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
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError) throw userError

      setUser(data as User)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'))
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, loading, error, refetch: fetchUser }
}
