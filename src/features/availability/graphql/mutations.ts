import { gql } from '@apollo/client'

import { COURT_AVAILABILITY_FIELDS } from '@/features/availability/graphql/queries'

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
    $facility_id: UUID!
    $court_number: Int!
    $start_time: Datetime!
    $set: court_availabilitiesUpdateInput!
  ) {
    updatecourt_availabilitiesCollection(
      filter: {
        facility_id: { eq: $facility_id }
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
    $facility_id: UUID!
    $court_number: Int!
    $start_time: Datetime!
  ) {
    deleteFromcourt_availabilitiesCollection(
      filter: {
        facility_id: { eq: $facility_id }
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
