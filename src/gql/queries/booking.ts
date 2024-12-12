import { gql } from '@apollo/client'

export const BOOKING_FIELDS = gql`
  fragment BookingFields on bookings {
    id
    company_id
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
  query GetCompletedBookings($company_id: UUID!) {
    bookingsCollection(
      filter: { company_id: { eq: $company_id }, booking_status: { eq: "confirmed" } }
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
