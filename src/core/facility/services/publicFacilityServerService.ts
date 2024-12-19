import { ApolloClient } from '@apollo/client'

import { GET_FACILITY_BY_SLUG } from '../graphql/queries'

import type { Facility } from '@/shared/types/graphql'

export class PublicFacilityServerService {
  constructor(private client: ApolloClient<unknown>) {}

  async getFacilityBySlug(slug: string): Promise<Facility | null> {
    try {
      const { data } = await this.client.query({
        query: GET_FACILITY_BY_SLUG,
        variables: { slug },
        fetchPolicy: 'network-only',
      })

      const facility = data?.facilitiesCollection?.edges[0]?.node
      if (!facility) {
        console.warn(`[PublicFacilityService] No facility found with slug: ${slug}`)
        return null
      }

      return facility
    } catch (error) {
      console.error('[PublicFacilityService] Failed to fetch facility by slug:', {
        error,
        slug,
      })
      throw error instanceof Error ? error : new Error('Failed to fetch facility by slug')
    }
  }
}
