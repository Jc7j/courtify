import { gql } from '@apollo/client'

import { COURT_FIELDS } from '@/features/courts/graphql/queries'

export const CREATE_COURT = gql`
  ${COURT_FIELDS}
  mutation CreateCourt($objects: [courtsInsertInput!]!) {
    insertIntocourtsCollection(objects: $objects) {
      records {
        ...CourtFields
      }
    }
  }
`

export const UPDATE_COURT = gql`
  ${COURT_FIELDS}
  mutation UpdateCourt($company_id: UUID!, $court_number: Int!, $set: courtsUpdateInput!) {
    updatecourtsCollection(
      filter: { company_id: { eq: $company_id }, court_number: { eq: $court_number } }
      set: $set
    ) {
      records {
        ...CourtFields
      }
    }
  }
`
