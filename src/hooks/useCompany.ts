import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { generateSlug } from '@/lib/utils/string'
import type { Companies } from '@/gql/graphql'
import { useSession } from 'next-auth/react'

interface UseCompanyReturn {
  createCompany: (name: string) => Promise<Companies>
  creating: boolean
  createError: ApolloError | null
}

export function useCompany(): UseCompanyReturn {
  const { data: session, status } = useSession()

  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COMPANY,
    {
      context: {
        headers: {
          authorization: session?.supabaseAccessToken
            ? `Bearer ${session.supabaseAccessToken}`
            : '',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      },
      onError: (error) => {
        console.error('GraphQL Error:', error)
        console.log('Auth context:', {
          hasSession: !!session,
          authStatus: status,
          hasToken: !!session?.supabaseAccessToken,
          userId: session?.user?.id,
        })
      },
    }
  )

  const createCompany = async (name: string): Promise<Companies> => {
    if (status === 'loading') {
      throw new Error('Authentication loading')
    }

    if (!session?.supabaseAccessToken) {
      throw new Error('Authentication required')
    }

    if (!session.user?.id) {
      throw new Error('User ID required')
    }

    try {
      console.log('Attempting company creation:', {
        name,
        userId: session.user.id,
        hasToken: !!session.supabaseAccessToken,
      })

      const companyInput = {
        name,
        slug: generateSlug(name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data } = await createCompanyMutation({
        variables: { objects: [companyInput] },
      })

      if (!data?.insertIntocompaniesCollection?.records?.[0]) {
        throw new Error('Failed to create company')
      }

      return data.insertIntocompaniesCollection.records[0]
    } catch (err) {
      console.error('Error in createCompany:', err)
      throw err instanceof Error ? err : new Error('Failed to create company')
    }
  }

  return {
    createCompany,
    creating,
    createError: createError || null,
  }
}
