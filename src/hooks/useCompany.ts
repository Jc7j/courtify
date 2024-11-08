import { useMutation, useQuery, ApolloError } from '@apollo/client'
import {
  CREATE_COMPANY,
  UPDATE_COMPANY,
  DELETE_COMPANY,
  GET_COMPANY,
  GET_COMPANIES,
} from '@/graphql/mutations/company'
import { Company } from '@/types/graphql'
import { generateSlug } from '@/lib/utils/string'

interface UseCompanyReturn {
  // Create
  createCompany: (name: string) => Promise<Company>
  creating: boolean
  createError: ApolloError | null

  // Read
  company: Company | null
  companies: Company[]
  loading: boolean
  error: ApolloError | null

  // Update
  updateCompany: (id: string, data: Partial<Company>) => Promise<Company>
  updating: boolean
  updateError: ApolloError | null

  // Delete
  deleteCompany: (id: string) => Promise<boolean>
  deleting: boolean
  deleteError: ApolloError | null

  // Refetch
  refetch: () => Promise<void>
}

export function useCompany(id?: string): UseCompanyReturn {
  // Create Mutation
  const [createCompanyMutation, { loading: creating, error: createError }] = useMutation(
    CREATE_COMPANY,
    {
      refetchQueries: [{ query: GET_COMPANIES }],
    }
  )

  // Update Mutation
  const [updateCompanyMutation, { loading: updating, error: updateError }] = useMutation(
    UPDATE_COMPANY,
    {
      refetchQueries: () =>
        [
          { query: GET_COMPANIES },
          id ? { query: GET_COMPANY, variables: { id } } : undefined,
        ].filter(
          (
            query
          ): query is {
            query: typeof GET_COMPANIES | typeof GET_COMPANY
            variables?: { id: string }
          } => !!query
        ),
    }
  )

  // Delete Mutation
  const [deleteCompanyMutation, { loading: deleting, error: deleteError }] = useMutation(
    DELETE_COMPANY,
    {
      refetchQueries: [{ query: GET_COMPANIES }],
    }
  )

  // Query single company if ID is provided
  const {
    data: companyData,
    loading: companyLoading,
    error: companyError,
    refetch: refetchCompany,
  } = useQuery(GET_COMPANY, {
    variables: { id },
    skip: !id,
  })

  // Query all companies
  const {
    data: companiesData,
    loading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies,
  } = useQuery(GET_COMPANIES)

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
      return data.insert_companies_one
    } catch (err) {
      console.error('Error creating company:', err)
      throw err
    }
  }

  // Update company handler
  const updateCompany = async (id: string, data: Partial<Company>): Promise<Company> => {
    try {
      const { data: updateData } = await updateCompanyMutation({
        variables: {
          id,
          data,
        },
      })
      return updateData.update_companies_by_pk
    } catch (err) {
      console.error('Error updating company:', err)
      throw err
    }
  }

  // Delete company handler
  const deleteCompany = async (id: string): Promise<boolean> => {
    try {
      const { data } = await deleteCompanyMutation({
        variables: { id },
      })
      return !!data.delete_companies_by_pk
    } catch (err) {
      console.error('Error deleting company:', err)
      throw err
    }
  }

  // Refetch all data
  const refetch = async () => {
    await Promise.all([refetchCompanies(), id ? refetchCompany() : Promise.resolve()])
  }

  return {
    // Create
    createCompany,
    creating,
    createError: createError || null,

    // Read
    company: companyData?.companies_by_pk || null,
    companies: companiesData?.companies || [],
    loading: companyLoading || companiesLoading,
    error: companyError || companiesError || null,

    // Update
    updateCompany,
    updating,
    updateError: updateError || null,

    // Delete
    deleteCompany,
    deleting,
    deleteError: deleteError || null,

    // Refetch
    refetch,
  }
}
