import { useMutation, ApolloError } from '@apollo/client'
import { CREATE_COMPANY } from '@/gql/mutations/company'
import { Company } from '@/types/graphql'
import { generateSlug } from '@/lib/utils/string'

interface UseCompanyReturn {
  // Create
  createCompany: (name: string) => Promise<Company>
  creating: boolean
  createError: ApolloError | null
}

type CreateCompanyResponse = {
  insert_companies_one: Company
}

export function useCompany(): UseCompanyReturn {
  // Create Mutation
  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation<
    CreateCompanyResponse,
    { object: Partial<Company> }
  >(CREATE_COMPANY, {
    onError: (error) => {
      console.error('Error creating company:', error)
    },
  })

  // Create company handler
  const createCompany = async (name: string): Promise<Company> => {
    try {
      const slug = generateSlug(name)
      const { data } = await createCompanyMutation({
        variables: {
          object: {
            name,
            slug,
            branding_additional: {},
          },
        },
      })

      if (!data?.insert_companies_one) {
        throw new Error('Failed to create company')
      }

      return data.insert_companies_one
    } catch (err) {
      console.error('Error creating company:', err)
      throw err
    }
  }

  return {
    // Create
    createCompany,
    creating,
    createError: createError || null,
  }
}
