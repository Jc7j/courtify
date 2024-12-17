'use client'

import { useMutation, useQuery } from '@apollo/client'
import { useEffect } from 'react'

import { CREATE_COMPANY, UPDATE_COMPANY } from '@/core/company/graphql/mutations'
import { GET_COMPANY_BY_SLUG, GET_COMPANY_BY_ID } from '@/core/company/graphql/queries'

import { supabase } from '@/shared/lib/supabase/client'
import { generateSlug } from '@/shared/lib/utils/generate-slug'
import { useUserStore } from '@/shared/stores/useUserStore'
import { BaseUser } from '@/shared/types/auth'

import { useOnboarding } from '../../../features/onboarding/hooks/useOnboarding'

import type { Company } from '@/shared/types/graphql'

interface UseCompanyReturn {
  company: Company | null
  loading: boolean
  error: Error | null
  creating: boolean
  updating: boolean
  createCompany: (name: string, address: string, sports: string) => Promise<void>
  updateCompany: (data: UpdateCompanyInput) => Promise<void>
}
interface UseCompanyProps {
  slug?: string
}

interface UpdateCompanyInput {
  name: string
  slug: string
  stripe_account_id?: string | null
  stripe_account_enabled?: boolean
  stripe_account_details?: any | null
}

export function useCompany({ slug }: UseCompanyProps = {}): UseCompanyReturn {
  const { user, isLoading: userLoading } = useUserStore()
  const { handleCompanyCreated } = useOnboarding()

  const queryToUse = slug ? GET_COMPANY_BY_SLUG : GET_COMPANY_BY_ID
  const variables = slug ? { slug } : { id: user?.company_id }

  // Only skip for authenticated routes, not public ones
  const skipQuery = !slug && (!user?.company_id || userLoading)

  const {
    data: companyData,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery(queryToUse, {
    variables,
    skip: skipQuery,
    fetchPolicy: 'cache-and-network',
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

  async function createCompany(name: string, address: string, sports: string) {
    try {
      // First ensure we have a valid session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }

      // Update the user store with the token if needed
      if (!useUserStore.getState().accessToken) {
        useUserStore.getState().setSession({
          user: useUserStore.getState().user as BaseUser,
          accessToken: session.access_token,
        })
      }

      const now = new Date().toISOString()
      const slug = generateSlug(name)
      const result = await createCompanyMutation({
        variables: {
          objects: [
            {
              name,
              address,
              sports,
              slug,
              created_at: now,
              updated_at: now,
            },
          ],
        },
      })

      const company = result.data?.insertIntocompaniesCollection?.records?.[0]
      if (!company || !user?.id) {
        throw new Error('Failed to create company')
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: company.id, role: 'owner' })
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
          set: {
            ...data,
            updated_at: new Date().toISOString(),
          },
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

  // Simplified loading state logic
  const isLoading = slug
    ? queryLoading // For public pages, only care about query loading
    : userLoading || queryLoading || !user?.company_id // For authenticated pages, include user state

  return {
    company: companyData?.companiesCollection?.edges[0]?.node ?? null,
    loading: isLoading,
    error: queryError ?? null,
    creating,
    updating,
    createCompany,
    updateCompany,
  }
}
