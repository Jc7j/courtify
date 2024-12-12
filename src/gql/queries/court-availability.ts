import { gql } from '@apollo/client'

export const COURT_AVAILABILITY_FIELDS = gql`
  fragment CourtAvailabilityFields on court_availabilities {
    start_time
    end_time
    court_number
    status
  }
`

export const GET_COMPANY_COURTS_AVAILABILITIES = gql`
  query GetCompanyAvailabilities($company_id: UUID!, $start_time: Datetime!, $end_time: Datetime!) {
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

    court_availabilitiesCollection(
      filter: {
        company_id: { eq: $company_id }
        and: [{ start_time: { lte: $end_time } }, { end_time: { gte: $start_time } }]
      }
      orderBy: [{ court_number: AscNullsFirst }, { start_time: AscNullsFirst }]
    ) {
      edges {
        node {
          nodeId
          company_id
          court_number
          start_time
          end_time
          status
          created_at
          updated_at
          booking: bookingsCollection(first: 1) {
            edges {
              node {
                id
                customer_name
                customer_email
                customer_phone
                status
                payment_status
                amount_total
                amount_paid
                currency
                metadata
              }
            }
          }
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
