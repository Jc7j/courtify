'use client'

import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { generateSlug } from '@/lib/utils/string'
import type { Companies } from '@/gql/graphql'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase/client'

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
    if (loading || !user?.id) {
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

      const company = data?.insertIntocompaniesCollection?.records?.[0]
      if (!company) {
        throw new Error('Failed to create company')
      }

      // Update user's company_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: company.id })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update user company')
      }

      return company
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
