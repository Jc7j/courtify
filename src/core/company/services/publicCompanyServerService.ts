import { ApolloClient } from '@apollo/client'

import { GET_COMPANY_BY_SLUG } from '../graphql/queries'

import type { Company } from '@/shared/types/graphql'

export class PublicCompanyServerService {
  constructor(private client: ApolloClient<unknown>) {}

  async getCompanyBySlug(slug: string): Promise<Company | null> {
    try {
      const { data } = await this.client.query({
        query: GET_COMPANY_BY_SLUG,
        variables: { slug },
        fetchPolicy: 'network-only',
      })

      const company = data?.companiesCollection?.edges[0]?.node
      if (!company) {
        console.warn(`[PublicCompanyService] No company found with slug: ${slug}`)
        return null
      }

      return company
    } catch (error) {
      console.error('[PublicCompanyService] Failed to fetch company by slug:', {
        error,
        slug,
      })
      throw error instanceof Error ? error : new Error('Failed to fetch company by slug')
    }
  }
}
