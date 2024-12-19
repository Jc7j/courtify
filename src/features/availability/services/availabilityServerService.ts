import { ApolloClient } from '@apollo/client'

import {
  CREATE_COURT_AVAILABILITY,
  UPDATE_COURT_AVAILABILITY,
  DELETE_COURT_AVAILABILITY,
} from '../graphql/mutations'
import { GET_COMPANY_COURTS_AVAILABILITIES } from '../graphql/queries'
import { CreateAvailabilityInput } from '../types'

import type { CourtAvailability, AvailabilityStatus } from '@/shared/types/graphql'

export class AvailabilityServerService {
  constructor(private client: ApolloClient<any>) {}

  async getCompanyAvailabilities(companyId: string, startTime: string, endTime: string) {
    const { data } = await this.client.query({
      query: GET_COMPANY_COURTS_AVAILABILITIES,
      variables: {
        company_id: companyId,
        start_time: startTime,
        end_time: endTime,
      },
      fetchPolicy: 'network-only',
    })

    return {
      courts: data.courtsCollection.edges.map((edge: any) => edge.node),
      availabilities: data.court_availabilitiesCollection.edges.map((edge: any) => edge.node),
    }
  }

  async createAvailability(input: CreateAvailabilityInput): Promise<CourtAvailability> {
    const { data } = await this.client.mutate({
      mutation: CREATE_COURT_AVAILABILITY,
      variables: {
        objects: [input],
      },
    })

    return data.insertIntocourt_availabilitiesCollection.records[0]
  }

  async updateAvailability(input: {
    companyId: string
    courtNumber: number
    startTime: string
    update: {
      status?: AvailabilityStatus
      court_number?: number
      start_time?: string
      end_time?: string
    }
  }): Promise<CourtAvailability> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_COURT_AVAILABILITY,
      variables: {
        company_id: input.companyId,
        court_number: input.courtNumber,
        start_time: input.startTime,
        set: {
          ...input.update,
          updated_at: new Date().toISOString(),
        },
      },
    })

    return data.updatecourt_availabilitiesCollection.records[0]
  }

  async deleteAvailability(input: {
    companyId: string
    courtNumber: number
    startTime: string
  }): Promise<void> {
    await this.client.mutate({
      mutation: DELETE_COURT_AVAILABILITY,
      variables: {
        company_id: input.companyId,
        court_number: input.courtNumber,
        start_time: input.startTime,
      },
    })
  }
}
