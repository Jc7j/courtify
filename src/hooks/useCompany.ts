import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { generateSlug } from '@/lib/utils/string'
import type { Companies, CompaniesInsertInput } from '@/gql/graphql'

interface UseCompanyReturn {
  createCompany: (name: string) => Promise<Companies>
  creating: boolean
  createError: ApolloError | null
}

export function useCompany(): UseCompanyReturn {
  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COMPANY,
    {
      onError: (error) => {
        console.error('GraphQL Error:', error)
      },
    }
  )

  const createCompany = async (name: string): Promise<Companies> => {
    try {
      console.log('Starting company creation...')
      const now = new Date().toISOString()
      const slug = generateSlug(name)

      const companyInput: CompaniesInsertInput = {
        name,
        slug,
        created_at: now,
        updated_at: now,
      }

      console.log('Company input:', companyInput)

      const { data } = await createCompanyMutation({
        variables: {
          objects: [companyInput],
        },
      })

      console.log('Mutation response:', data)

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
