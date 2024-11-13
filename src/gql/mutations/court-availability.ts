import { gql } from '@apollo/client'

export const COURT_AVAILABILITY_FIELDS = gql`
  fragment CourtAvailabilityFields on court_availabilities {
    company_id
    court_number
    start_time
    end_time
    status
    created_at
    updated_at
  }
`

export const CREATE_COURT_AVAILABILITY = gql`
  ${COURT_AVAILABILITY_FIELDS}
  mutation CreateCourtAvailability($objects: [court_availabilitiesInsertInput!]!) {
    insertIntocourt_availabilitiesCollection(objects: $objects) {
      records {
        ...CourtAvailabilityFields
      }
    }
  }
`

export const UPDATE_COURT_AVAILABILITY = gql`
  ${COURT_AVAILABILITY_FIELDS}
  mutation UpdateCourtAvailability(
    $company_id: UUID!
    $court_number: Int!
    $start_time: Datetime!
    $set: court_availabilitiesUpdateInput!
  ) {
    updatecourt_availabilitiesCollection(
      filter: {
        company_id: { eq: $company_id }
        court_number: { eq: $court_number }
        start_time: { eq: $start_time }
      }
      set: $set
    ) {
      records {
        ...CourtAvailabilityFields
      }
    }
  }
`
