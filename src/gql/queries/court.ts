import { gql } from '@apollo/client'
import { COURT_FIELDS } from '../mutations/court'

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
