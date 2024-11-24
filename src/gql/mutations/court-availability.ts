import { gql } from '@apollo/client'

import { COURT_AVAILABILITY_FIELDS } from '../queries/court-availability'

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

export const DELETE_COURT_AVAILABILITY = gql`
  ${COURT_AVAILABILITY_FIELDS}
  mutation DeleteCourtAvailability(
    $company_id: UUID!
    $court_number: Int!
    $start_time: Datetime!
  ) {
    deleteFromcourt_availabilitiesCollection(
      filter: {
        company_id: { eq: $company_id }
        court_number: { eq: $court_number }
        start_time: { eq: $start_time }
      }
    ) {
      records {
        ...CourtAvailabilityFields
      }
    }
  }
`
