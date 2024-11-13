import { gql } from '@apollo/client'
import { COURT_AVAILABILITY_FIELDS } from '../mutations/court-availability'

export const GET_COURT_AVAILABILITIES = gql`
  ${COURT_AVAILABILITY_FIELDS}
  query GetCourtAvailabilities(
    $company_id: UUID!
    $court_number: Int!
    $start_time: Datetime!
    $end_time: Datetime!
  ) {
    court_availabilitiesCollection(
      first: 50
      orderBy: [{ start_time: AscNullsFirst }, { status: AscNullsFirst }]
      filter: {
        company_id: { eq: $company_id }
        court_number: { eq: $court_number }
        start_time: { gte: $start_time }
        end_time: { lte: $end_time }
      }
    ) {
      edges {
        node {
          ...CourtAvailabilityFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const GET_COURT_AVAILABILITY = gql`
  ${COURT_AVAILABILITY_FIELDS}
  query GetCourtAvailability($company_id: UUID!, $court_number: Int!, $start_time: Datetime!) {
    court_availabilitiesCollection(
      first: 1
      filter: {
        company_id: { eq: $company_id }
        court_number: { eq: $court_number }
        start_time: { eq: $start_time }
      }
    ) {
      edges {
        node {
          ...CourtAvailabilityFields
        }
      }
    }
  }
`

export const GET_COURT_AVAILABILITIES_BY_DATE_RANGE = gql`
  ${COURT_AVAILABILITY_FIELDS}
  query GetCourtAvailabilitiesByDateRange(
    $company_id: UUID!
    $start_time: Datetime!
    $end_time: Datetime!
  ) {
    court_availabilitiesCollection(
      filter: {
        company_id: { eq: $company_id }
        start_time: { gte: $start_time }
        end_time: { lte: $end_time }
      }
      orderBy: [{ court_number: AscNullsFirst }, { start_time: AscNullsFirst }]
    ) {
      edges {
        node {
          ...CourtAvailabilityFields
        }
      }
    }
  }
`
