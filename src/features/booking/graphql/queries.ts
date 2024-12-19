import { gql } from '@apollo/client'

export const BOOKING_FIELDS = gql`
  fragment BookingFields on bookings {
    id
    facility_id
    court_number
    start_time
    customer_email
    customer_name
    customer_phone
    booking_status
    payment_status
    amount_total
    amount_paid
    currency
    created_at
    updated_at
    cancelled_at
  }
`

export const GET_COMPLETED_BOOKINGS = gql`
  ${BOOKING_FIELDS}
  query GetCompletedBookings($facility_id: UUID!) {
    bookingsCollection(
      filter: { facility_id: { eq: $facility_id }, booking_status: { eq: "confirmed" } }
      orderBy: [{ start_time: DescNullsLast }]
    ) {
      edges {
        node {
          ...BookingFields
        }
      }
    }
  }
`

export const GET_BOOKING_AVAILABILITIES = gql`
  query GetBookingAvailabilities(
    $facility_id: UUID!
    $start_time: Datetime!
    $end_time: Datetime!
  ) {
    courtsCollection(
      filter: { facility_id: { eq: $facility_id } }
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
        facility_id: { eq: $facility_id }
        and: [{ start_time: { lte: $end_time } }, { end_time: { gte: $start_time } }]
      }
      orderBy: [{ court_number: AscNullsFirst }, { start_time: AscNullsFirst }]
    ) {
      edges {
        node {
          nodeId
          facility_id
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
                status
                payment_status
              }
            }
          }
        }
      }
    }
  }
`
