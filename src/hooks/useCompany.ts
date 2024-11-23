'use client'

import { useMutation, useQuery, gql } from '@apollo/client'
import { CREATE_COMPANY, UPDATE_COMPANY } from '@/gql/mutations/company'
import { GET_COMPANY_BY_SLUG, GET_COMPANY_BY_ID } from '@/gql/queries/company'
import { useUser } from '@/providers/UserProvider'
import { supabase } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils/generate-slug'
import { useOnboarding } from './useOnboarding'
import type { Company } from '@/types/graphql'

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
  const { user } = useUser()
  const { handleCompanyCreated } = useOnboarding()

  const queryToUse = slug ? GET_COMPANY_BY_SLUG : GET_COMPANY_BY_ID
  const variables = slug ? { slug } : { id: user?.company_id }
  const skipQuery = slug ? !slug : !user?.company_id

  const {
    data: companyData,
    loading: queryLoading,
    error: queryError,
  } = useQuery(queryToUse, {
    variables,
    skip: skipQuery,
  })

  const [createCompanyMutation, { loading: creating }] = useMutation(CREATE_COMPANY, {
    update(cache, { data }) {
      const newCompany = data?.insertIntocompaniesCollection?.records?.[0]
      if (newCompany && user?.id) {
        cache.modify({
          fields: {
            companiesCollection(existingCompanies = { edges: [] }) {
              const newCompanyRef = cache.writeFragment({
                data: newCompany,
                fragment: gql`
                  fragment NewCompany on companies {
                    id
                    name
                    slug
                  }
                `,
              })
              return {
                ...existingCompanies,
                edges: [...existingCompanies.edges, { node: newCompanyRef }],
              }
            },
          },
        })
      }
    },
  })

  const [updateCompanyMutation, { loading: updating }] = useMutation(UPDATE_COMPANY)

  const createCompany = async (name: string) => {
    try {
      const slug = generateSlug(name)
      const result = await createCompanyMutation({
        variables: {
          objects: [
            {
              name,
              slug,
            },
          ],
        },
      })

      const company = result.data?.insertIntocompaniesCollection?.records?.[0]
      if (company && user?.id) {
        await supabase.from('users').update({ company_id: company.id }).eq('id', user.id)
        handleCompanyCreated()
      }
    } catch (err) {
      console.error('Error in createCompany:', err)
      throw err instanceof Error ? err : new Error('Failed to create company')
    }
  }

  const updateCompany = async (data: UpdateCompanyInput) => {
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
    loading: queryLoading,
    error: queryError ?? null,
    creating,
    updating,
    createCompany,
    updateCompany,
  }
}
