import { gql } from '@apollo/client'

export const COURT_FIELDS = gql`
  fragment CourtFields on courts {
    court_number
    name
    updated_at
    company_id
  }
`

export const GET_COMPANY_COURTS = gql`
  ${COURT_FIELDS}
  query GetCompanyCourts($company_id: UUID!) {
    courtsCollection(
      filter: { company_id: { eq: $company_id } }
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
  query GetCourt($company_id: UUID!, $court_number: Int!) {
    courtsCollection(
      filter: { company_id: { eq: $company_id }, court_number: { eq: $court_number } }
    ) {
      edges {
        node {
          ...CourtFields
        }
      }
    }
  }
`
