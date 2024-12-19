import { ApolloClient } from '@apollo/client'

import { CREATE_FACILITY, UPDATE_FACILITY } from '../graphql/mutations'
import { GET_FACILITY_BY_ID } from '../graphql/queries'

import type { Facility } from '@/shared/types/graphql'

interface CreateFacilityInput {
  name: string
  address: string
  sports: string
  slug: string
  created_at: string
  updated_at: string
}

interface UpdateFacilityInput {
  name?: string
  slug?: string
  stripe_account_id?: string | null
  stripe_account_enabled?: boolean
  updated_at: string
}

export class FacilityServerService {
  constructor(private client: ApolloClient<unknown>) {}

  private handleError(error: unknown, message: string): never {
    console.error(`[FacilityServerService] ${message}:`, error)
    throw error instanceof Error ? error : new Error(message)
  }

  async getFacilityById(id: string): Promise<Facility | null> {
    try {
      const { data } = await this.client.query({
        query: GET_FACILITY_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      return data?.facilitiesCollection?.edges[0]?.node ?? null
    } catch (error) {
      this.handleError(error, 'Failed to fetch facility')
    }
  }

  async createFacility(input: CreateFacilityInput): Promise<Facility> {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_FACILITY,
        variables: { objects: [input] },
      })

      const facility = data?.insertIntofacilitiesCollection?.records?.[0]
      if (!facility) throw new Error('Failed to create facility')

      return facility
    } catch (error) {
      this.handleError(error, 'Failed to create facility')
    }
  }

  async updateFacility(id: string, input: UpdateFacilityInput): Promise<Facility> {
    try {
      const { data } = await this.client.mutate({
        mutation: UPDATE_FACILITY,
        variables: { id, set: input },
      })

      const facility = data?.updatefacilitiesCollection?.records?.[0]
      if (!facility) throw new Error('Failed to update facility')

      return facility
    } catch (error) {
      this.handleError(error, 'Failed to update facility')
    }
  }
}
