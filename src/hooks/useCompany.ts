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

  // Query by slug if provided, otherwise query by user's company_id
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
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
  })

  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COMPANY,
    {
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
    }
  )

  const [updateCompanyMutation, { loading: updating, error: updateError }] = useMutation(
    UPDATE_COMPANY,
    {
      update(cache, { data }) {
        const updatedCompany = data?.updatecompaniesCollection?.records?.[0]
        if (updatedCompany) {
          cache.modify({
            fields: {
              companiesCollection(existingCompanies = { edges: [] }) {
                return {
                  ...existingCompanies,
                  edges: existingCompanies.edges.map((edge: any) => {
                    if (edge.node.id === updatedCompany.id) {
                      return { ...edge, node: updatedCompany }
                    }
                    return edge
                  }),
                }
              },
            },
          })
        }
      },
    }
  )

  const company = companyData?.companiesCollection?.edges?.[0]?.node || null

  const updateCompany = async (data: UpdateCompanyInput) => {
    if (!user?.company_id) throw new Error('No company found')

    try {
      const { data: result } = await updateCompanyMutation({
        variables: {
          id: user.company_id,
          set: {
            name: data.name,
            slug: data.slug,
            updated_at: new Date().toISOString(),
          },
        },
      })

      if (!result?.updatecompaniesCollection?.records?.[0]) {
        throw new Error('Failed to update company')
      }
    } catch (err) {
      console.error('Error in updateCompany:', err)
      throw err instanceof Error ? err : new Error('Failed to update company')
    }
  }

  return {
    company,
    loading: queryLoading,
    error: queryError
      ? new Error(queryError.message)
      : createError
        ? new Error(createError.message)
        : updateError
          ? new Error(updateError.message)
          : null,
    creating,
    updating,
    createCompany: async (name: string) => {
      if (!user?.id) throw new Error('Authentication required')

      try {
        const { data } = await createCompanyMutation({
          variables: {
            objects: [
              {
                name,
                slug: generateSlug(name),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
        })

        const newCompany = data?.insertIntocompaniesCollection?.records?.[0]
        if (!newCompany?.id) throw new Error('Failed to create company')

        await supabase
          .from('users')
          .update({
            company_id: newCompany.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        await handleCompanyCreated()
      } catch (err) {
        console.error('Error in createCompany:', err)
        throw err instanceof Error ? err : new Error('Failed to create company')
      }
    },
    updateCompany,
  }
}
