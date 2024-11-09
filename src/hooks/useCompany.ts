import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { generateSlug } from '@/lib/utils/string'
import type { Companies, CompaniesInsertInput } from '@/gql/graphql'
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
        },
      },
      onError: (error) => {
        console.error('GraphQL Error:', error)
        console.log('Auth context:', {
          hasSession: !!session,
          authStatus: status,
          hasToken: !!session?.supabaseAccessToken,
        })
      },
    }
  )

  const createCompany = async (name: string): Promise<Companies> => {
    if (!session?.supabaseAccessToken) {
      throw new Error('Authentication required')
    }

    try {
      const companyInput: CompaniesInsertInput = {
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
      throw err
    }
  }

  return {
    createCompany,
    creating,
    createError: createError || null,
  }
}
