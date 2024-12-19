import { gql } from '@apollo/client'

export const COURT_FIELDS = gql`
  fragment CourtFields on courts {
    court_number
    name
    updated_at
    facility_id
    is_active
  }
`

export const GET_FACILITY_COURTS = gql`
  ${COURT_FIELDS}
  query GetFacilityCourts($facility_id: UUID!) {
    courtsCollection(
      filter: { facility_id: { eq: $facility_id } }
      orderBy: { court_number: AscNullsFirst }
    ) {
      edges {
        node {
          ...CourtFields
        }
      }
    }
  }
`

export const GET_COURT = gql`
  ${COURT_FIELDS}
  query GetCourt($facility_id: UUID!, $court_number: Int!) {
    courtsCollection(
      filter: { facility_id: { eq: $facility_id }, court_number: { eq: $court_number } }
    ) {
      edges {
        node {
          ...CourtFields
        }
      }
    }
  }
`
