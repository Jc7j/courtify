import { ApolloClient } from '@apollo/client'

import { Courts } from '@/shared/types/graphql'

import { CREATE_COURT, UPDATE_COURT } from '../graphql/mutations'
import { GET_COMPANY_COURTS, GET_COURT } from '../graphql/queries'

export class CourtServerService {
  constructor(private client: ApolloClient<unknown>) {}

  private handleError(error: unknown, message: string): never {
    console.error(`[CourtService] ${message}:`, error)
    throw error instanceof Error ? error : new Error(message)
  }

  async getCourts(companyId: string): Promise<Courts[]> {
    try {
      const { data } = await this.client.query({
        query: GET_COMPANY_COURTS,
        variables: { company_id: companyId },
        fetchPolicy: 'network-only',
      })

      return data?.courtsCollection?.edges?.map((edge: { node: Courts }) => edge.node) || []
    } catch (error) {
      this.handleError(error, 'Failed to fetch courts')
    }
  }

  async getCourt(companyId: string, courtNumber: number): Promise<Courts | null> {
    const { data } = await this.client.query({
      query: GET_COURT,
      variables: {
        company_id: companyId,
        court_number: courtNumber,
      },
      fetchPolicy: 'network-only',
    })

    return data?.courtsCollection?.edges?.[0]?.node || null
  }

  async createCourt(companyId: string, name: string): Promise<Courts> {
    const now = new Date().toISOString()
    const nextCourtNumber = await this.getNextCourtNumber(companyId)

    const courtInput = {
      company_id: companyId,
      court_number: nextCourtNumber,
      name,
      created_at: now,
      updated_at: now,
      is_active: true,
    }

    const { data } = await this.client.mutate({
      mutation: CREATE_COURT,
      variables: { objects: [courtInput] },
    })

    const newCourt = data?.insertIntocourtsCollection?.records?.[0]
    if (!newCourt) throw new Error('Failed to create court')

    return newCourt
  }

  async updateCourt(
    companyId: string,
    courtNumber: number,
    updates: {
      name?: string
      is_active?: boolean
    }
  ): Promise<Courts> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_COURT,
      variables: {
        company_id: companyId,
        court_number: courtNumber,
        set: {
          ...updates,
          updated_at: new Date().toISOString(),
        },
      },
    })

    const updatedCourt = data?.updatecourtsCollection?.records?.[0]
    if (!updatedCourt) throw new Error('Failed to update court')

    return updatedCourt
  }

  private async getNextCourtNumber(companyId: string): Promise<number> {
    const courts = await this.getCourts(companyId)
    return Math.max(0, ...courts.map((c) => c.court_number)) + 1
  }
}
