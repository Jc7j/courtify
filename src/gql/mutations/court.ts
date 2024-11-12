import { gql } from '@apollo/client'

// Court Fragments for reuse
export const COURT_FIELDS = gql`
  fragment CourtFields on courts {
    nodeId
    company_id
    court_number
    name
    created_at
    updated_at
  }
`

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

export const DELETE_COURT = gql`
  ${COURT_FIELDS}
  mutation DeleteCourt($company_id: UUID!, $court_number: Int!) {
    deleteFromcourtsCollection(
      filter: { company_id: { eq: $company_id }, court_number: { eq: $court_number } }
    ) {
      records {
        ...CourtFields
      }
    }
  }
`
