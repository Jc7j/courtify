'use client'

import { useMutation } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { useUser } from '@/providers/UserProvider'
import { supabase } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils/string'
import { useOnboarding } from './useOnboarding'
import type { Company } from '@/types/graphql'

interface UseCompanyReturn {
  creating: boolean
  error: Error | null
  createCompany: (name: string) => Promise<void>
}

export function useCompany(): UseCompanyReturn {
  const { user } = useUser()
  const { handleCompanyCreated } = useOnboarding()

  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COMPANY,
    {
      update(cache, { data }) {
        const newCompany = data?.insertIntocompaniesCollection?.records?.[0]
        if (newCompany && user?.id) {
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
    }
  )

  async function createCompany(name: string): Promise<void> {
    if (!user?.id) {
      throw new Error('Authentication required')
    }

    try {
      // 1. Create company
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

      const newCompany = data?.insertIntocompaniesCollection?.records?.[0] as Company
      if (!newCompany?.id) {
        throw new Error('Failed to create company')
      }

      // 2. Update user's company_id
      const { error: updateError } = await supabase
        .from('users')
        .update({
          company_id: newCompany.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update user company')
      }

      // 3. Handle session update and navigation
      await handleCompanyCreated()
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
