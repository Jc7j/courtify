import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COMPANY, CreateCompanyResponse, CreateCompanyInput } from '@/gql/mutations/company'
import { generateSlug } from '@/lib/utils/string'
import type { Companies } from '@/gql/graphql'

interface UseCompanyReturn {
  createCompany: (name: string) => Promise<Companies>
  creating: boolean
  createError: ApolloError | null
}

export function useCompany(): UseCompanyReturn {
  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation<
    CreateCompanyResponse,
    { object: CreateCompanyInput }
  >(CREATE_COMPANY, {
    onError: (error) => {
      console.error('Error creating company:', error)
    },
  })

  const createCompany = async (name: string): Promise<Companies> => {
    try {
      const slug = generateSlug(name)

      const { data } = await createCompanyMutation({
        variables: {
          object: {
            name,
            slug,
          },
        },
      })

      if (!data?.insert_companies_one) {
        throw new Error('Failed to create company')
      }

      return data.insert_companies_one
    } catch (err) {
      console.error('Error creating company:', err)
      // Re-throw with a more user-friendly message
      throw new Error(
        err instanceof Error ? err.message : 'An error occurred while creating the company'
      )
    }
  }

  return {
    createCompany,
    creating,
    createError: createError || null,
  }
}
