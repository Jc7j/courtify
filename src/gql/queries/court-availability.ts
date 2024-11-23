import { gql } from '@apollo/client'
import { COURT_AVAILABILITY_FIELDS } from '../mutations/court-availability'

export const GET_COMPANY_COURTS_AVAILABILITIES = gql`
  ${COURT_AVAILABILITY_FIELDS}
  query GetCompanyAvailabilities($company_id: UUID!, $start_time: Datetime!, $end_time: Datetime!) {
    # Get all courts without limit
    courtsCollection(
      filter: { company_id: { eq: $company_id } }
      orderBy: [{ court_number: AscNullsFirst }]
    ) {
      edges {
        node {
          court_number
          name
        }
      }
    }
    # Get all availabilities without limit
    court_availabilitiesCollection(
      filter: {
        company_id: { eq: $company_id }
        and: [{ start_time: { lte: $end_time } }, { end_time: { gte: $start_time } }]
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

export const GET_COURT_AVAILABILITIES = gql`
  ${COURT_AVAILABILITY_FIELDS}
  query GetCourtAvailabilities(
    $company_id: UUID!
    $court_number: Int!
    $start_time: Datetime!
    $end_time: Datetime!
  ) {
    court_availabilitiesCollection(
      filter: {
        company_id: { eq: $company_id }
        court_number: { eq: $court_number }
        and: [{ start_time: { lte: $end_time } }, { end_time: { gte: $start_time } }]
      }
      orderBy: [{ start_time: AscNullsFirst }]
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

export const GET_PUBLIC_COMPANY_AVAILABILITIES = gql`
  ${COURT_AVAILABILITY_FIELDS}
  query GetPublicCompanyAvailabilities(
    $slug: String!
    $start_time: Datetime!
    $end_time: Datetime!
  ) {
    companiesCollection(filter: { slug: { eq: $slug } }) {
      edges {
        node {
          id
          name
          # Get all courts for the company
          courtsCollection(orderBy: [{ court_number: AscNullsFirst }]) {
            edges {
              node {
                court_number
                name
              }
            }
          }
          # Get all available court times within the week
          court_availabilitiesCollection(
            filter: {
              and: [
                { start_time: { lte: $end_time } }
                { end_time: { gte: $start_time } }
                { status: { eq: "available" } }
              ]
            }
            orderBy: [{ start_time: AscNullsFirst }, { court_number: AscNullsFirst }]
          ) {
            edges {
              node {
                ...CourtAvailabilityFields
              }
            }
          }
        }
      }
    }
  }
`
