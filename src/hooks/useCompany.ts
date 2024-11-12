'use client'

import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { generateSlug } from '@/lib/utils/string'
import type { Companies } from '@/gql/graphql'
import { useUser } from '@/hooks/useUser'

interface UseCompanyReturn {
  createCompany: (name: string) => Promise<Companies>
  creating: boolean
  createError: ApolloError | null
}

export function useCompany(): UseCompanyReturn {
  const { user, loading } = useUser()

  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COMPANY,
    {
      onError: (error) => {
        console.error('Error creating company:', error)
      },
    }
  )

  const createCompany = async (name: string): Promise<Companies> => {
    if (loading) {
      throw new Error('Authentication loading')
    }

    if (!user?.id) {
      throw new Error('Authentication required')
    }

    try {
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
      throw err instanceof Error ? err : new Error('Failed to create company')
    }
  }

  return {
    createCompany,
    creating,
    createError: createError || null,
  }
}
