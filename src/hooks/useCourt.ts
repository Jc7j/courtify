import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COURT, UPDATE_COURT, DELETE_COURT } from '@/gql/mutations/court'
import type { Courts } from '@/gql/graphql'
import { useSession } from 'next-auth/react'

interface UseCourtReturn {
  createCourt: (name: string) => Promise<Courts>
  updateCourt: (courtNumber: number, name: string) => Promise<Courts>
  deleteCourt: (courtNumber: number) => Promise<Courts>
  creating: boolean
  updating: boolean
  deleting: boolean
  createError: ApolloError | null
  updateError: ApolloError | null
  deleteError: ApolloError | null
}

export function useCourt(): UseCourtReturn {
  const { data: session, status } = useSession()

  const [createCourtMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COURT,
    {
      context: {
        headers: {
          authorization: session?.supabaseAccessToken
            ? `Bearer ${session.supabaseAccessToken}`
            : '',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
    }
  )

  const [updateCourtMutation, { loading: updating, error: updateError }] = useMutation(
    UPDATE_COURT,
    {
      context: {
        headers: {
          authorization: session?.supabaseAccessToken
            ? `Bearer ${session.supabaseAccessToken}`
            : '',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
    }
  )

  const [deleteCourtMutation, { loading: deleting, error: deleteError }] = useMutation(
    DELETE_COURT,
    {
      context: {
        headers: {
          authorization: session?.supabaseAccessToken
            ? `Bearer ${session.supabaseAccessToken}`
            : '',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
    }
  )

  const createCourt = async (name: string): Promise<Courts> => {
    if (status === 'loading') {
      throw new Error('Authentication loading')
    }

    if (!session?.supabaseAccessToken) {
      throw new Error('Authentication required')
    }

    if (!session.user?.company?.id) {
      throw new Error('Company required')
    }

    try {
      const courtInput = {
        company_id: session.user.company.id,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data } = await createCourtMutation({
        variables: { objects: [courtInput] },
      })

      const newCourt = data?.insertIntocourtsCollection?.records?.[0]
      if (!newCourt) {
        throw new Error('Failed to create court')
      }

      return newCourt
    } catch (err) {
      console.error('Error in createCourt:', err)
      throw err instanceof Error ? err : new Error('Failed to create court')
    }
  }

  const updateCourt = async (courtNumber: number, name: string): Promise<Courts> => {
    if (!session?.user?.company?.id) {
      throw new Error('Company required')
    }

    try {
      const { data } = await updateCourtMutation({
        variables: {
          company_id: session.user.company.id,
          court_number: courtNumber,
          set: {
            name,
            updated_at: new Date().toISOString(),
          },
        },
      })

      if (!data?.updatecourtsCollection?.records?.[0]) {
        throw new Error('Failed to update court')
      }

      return data.updatecourtsCollection.records[0]
    } catch (err) {
      console.error('Error in updateCourt:', err)
      throw err instanceof Error ? err : new Error('Failed to update court')
    }
  }

  const deleteCourt = async (courtNumber: number): Promise<Courts> => {
    if (!session?.user?.company?.id) {
      throw new Error('Company required')
    }

    try {
      const { data } = await deleteCourtMutation({
        variables: {
          company_id: session.user.company.id,
          court_number: courtNumber,
        },
      })

      if (!data?.deleteFromcourtsCollection?.records?.[0]) {
        throw new Error('Failed to delete court')
      }

      return data.deleteFromcourtsCollection.records[0]
    } catch (err) {
      console.error('Error in deleteCourt:', err)
      throw err instanceof Error ? err : new Error('Failed to delete court')
    }
  }

  return {
    createCourt,
    updateCourt,
    deleteCourt,
    creating,
    updating,
    deleting,
    createError: createError || null,
    updateError: updateError || null,
    deleteError: deleteError || null,
  }
}
