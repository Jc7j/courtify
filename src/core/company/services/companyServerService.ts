import { ApolloClient } from '@apollo/client'

import { CREATE_COMPANY, UPDATE_COMPANY } from '../graphql/mutations'
import { GET_COMPANY_BY_ID, GET_COMPANY_BY_SLUG } from '../graphql/queries'

import type { Company } from '@/shared/types/graphql'

interface CreateCompanyInput {
  name: string
  address: string
  sports: string
  slug: string
  created_at: string
  updated_at: string
}

interface UpdateCompanyInput {
  name?: string
  slug?: string
  stripe_account_id?: string | null
  stripe_account_enabled?: boolean
  stripe_account_details?: any | null
  updated_at: string
}

export class CompanyServerService {
  constructor(private client: ApolloClient<unknown>) {}

  private handleError(error: unknown, message: string): never {
    console.error(`[CompanyServerService] ${message}:`, error)
    throw error instanceof Error ? error : new Error(message)
  }

  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const { data } = await this.client.query({
        query: GET_COMPANY_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      return data?.companiesCollection?.edges[0]?.node ?? null
    } catch (error) {
      this.handleError(error, 'Failed to fetch company')
    }
  }

  async getCompanyBySlug(slug: string): Promise<Company | null> {
    try {
      const { data } = await this.client.query({
        query: GET_COMPANY_BY_SLUG,
        variables: { slug },
        fetchPolicy: 'network-only',
      })
      return data?.companiesCollection?.edges[0]?.node ?? null
    } catch (error) {
      this.handleError(error, 'Failed to fetch company by slug')
    }
  }

  async createCompany(input: CreateCompanyInput): Promise<Company> {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_COMPANY,
        variables: { objects: [input] },
      })

      const company = data?.insertIntocompaniesCollection?.records?.[0]
      if (!company) throw new Error('Failed to create company')

      return company
    } catch (error) {
      this.handleError(error, 'Failed to create company')
    }
  }

  async updateCompany(id: string, input: UpdateCompanyInput): Promise<Company> {
    try {
      const { data } = await this.client.mutate({
        mutation: UPDATE_COMPANY,
        variables: { id, set: input },
      })

      const company = data?.updatecompaniesCollection?.records?.[0]
      if (!company) throw new Error('Failed to update company')

      return company
    } catch (error) {
      this.handleError(error, 'Failed to update company')
    }
  }
}
