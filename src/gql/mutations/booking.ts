import { gql } from '@apollo/client'

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: bookingsInsertInput!) {
    insertIntobookingsCollection(objects: [$input]) {
      records {
        id
        status
        payment_status
      }
    }
  }
`
