'use client'

import { useMutation, useQuery } from '@apollo/client'
import { CREATE_COMPANY, UPDATE_COMPANY } from '@/gql/mutations/company'
import { GET_COMPANY_BY_SLUG, GET_COMPANY_BY_ID } from '@/gql/queries/company'
import { supabase } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils/generate-slug'
import { useOnboarding } from './useOnboarding'
import { useUserStore } from '@/stores/useUserStore'
import type { Company } from '@/types/graphql'
import { useEffect } from 'react'

interface UseCompanyReturn {
  company: Company | null
  loading: boolean
  error: Error | null
  creating: boolean
  updating: boolean
  createCompany: (name: string) => Promise<void>
  updateCompany: (data: UpdateCompanyInput) => Promise<void>
}

interface UseCompanyProps {
  slug?: string
}

interface UpdateCompanyInput {
  name: string
  slug: string
}

export function useCompany({ slug }: UseCompanyProps = {}): UseCompanyReturn {
  const { user, isLoading: userLoading } = useUserStore()
  const { handleCompanyCreated } = useOnboarding()

  const queryToUse = slug ? GET_COMPANY_BY_SLUG : GET_COMPANY_BY_ID
  const variables = slug ? { slug } : { id: user?.company_id }

  // Handle public pages
  const skipQuery = !slug && (!user?.company_id || userLoading)

  const {
    data: companyData,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery(queryToUse, {
    variables,
    skip: skipQuery,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    if (!skipQuery && user?.company_id) {
      refetch()
    }
  }, [user?.company_id, skipQuery, refetch])

  const [createCompanyMutation, { loading: creating }] = useMutation(CREATE_COMPANY, {
    update(cache, { data }) {
      const newCompany = data?.insertIntocompaniesCollection?.records?.[0]
      if (newCompany && user?.id) {
        cache.evict({ fieldName: 'companiesCollection' })
        cache.gc()
      }
    },
  })

  const [updateCompanyMutation, { loading: updating }] = useMutation(UPDATE_COMPANY)

  async function createCompany(name: string) {
    try {
      const slug = generateSlug(name)
      const result = await createCompanyMutation({
        variables: {
          objects: [{ name, slug }],
        },
      })

      const company = result.data?.insertIntocompaniesCollection?.records?.[0]
      if (!company || !user?.id) {
        throw new Error('Failed to create company')
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: company.id })
        .eq('id', user.id)

      if (updateError) throw updateError

      useUserStore.getState().updateUser({ company_id: company.id })

      await handleCompanyCreated()

      await refetch()

      return company
    } catch (err) {
      console.error('Error in createCompany:', err)
      throw err instanceof Error ? err : new Error('Failed to create company')
    }
  }

  async function updateCompany(data: UpdateCompanyInput) {
    if (!user?.company_id) throw new Error('No company found')

    try {
      const result = await updateCompanyMutation({
        variables: {
          id: user.company_id,
          set: data,
        },
      })

      if (!result.data?.updatecompaniesCollection?.records?.[0]) {
        throw new Error('Failed to update company')
      }
    } catch (err) {
      console.error('Error in updateCompany:', err)
      throw err instanceof Error ? err : new Error('Failed to update company')
    }
  }

  return {
    company: companyData?.companiesCollection?.edges[0]?.node ?? null,
    // Loading state to not include user-related conditions for public pages
    loading: slug ? queryLoading : userLoading || queryLoading || !user?.company_id,
    error: queryError ?? null,
    creating,
    updating,
    createCompany,
    updateCompany,
  }
}
