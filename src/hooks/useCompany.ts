'use client'

import { useMutation } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { useUser } from '@/providers/UserProvider'
import type { Company } from '@/types/graphql'
import { supabase } from '@/lib/supabase/client'

interface UseCompanyReturn {
  creating: boolean
  error: Error | null
  createCompany: (name: string) => Promise<Company>
}

export function useCompany(): UseCompanyReturn {
  const { user, refetch: refetchUser } = useUser()

  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COMPANY,
    {
      update(cache, { data }) {
        const newCompany = data?.insertIntocompaniesCollection?.records?.[0]
        if (newCompany && user?.id) {
          // Update user data in cache with new company_id
          cache.modify({
            fields: {
              usersCollection(existingUsers = { edges: [] }) {
                return {
                  ...existingUsers,
                  edges: existingUsers.edges.map((edge: { node: { id: string } }) =>
                    edge.node.id === user.id
                      ? {
                          ...edge,
                          node: { ...edge.node, company_id: newCompany.id },
                        }
                      : edge
                  ),
                }
              },
            },
          })
        }
      },
      // Refetch user data after company creation
      onCompleted: async () => {
        await refetchUser()
      },
      onError: (error) => {
        console.error('Error creating company:', error)
      },
    }
  )

  async function createCompany(name: string): Promise<Company> {
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    try {
      const { data } = await createCompanyMutation({
        variables: {
          objects: [
            {
              name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        },
      })

      const newCompany = data?.insertIntocompaniesCollection?.records?.[0]
      if (!newCompany) {
        throw new Error('Failed to create company')
      }

      // Update user's company_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: newCompany.id })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update user company')
      }

      return newCompany
    } catch (err) {
      console.error('Error in createCompany:', err)
      throw err instanceof Error ? err : new Error('Failed to create company')
    }
  }

  return {
    creating,
    error: createError ? new Error(createError.message) : null,
    createCompany,
  }
}
