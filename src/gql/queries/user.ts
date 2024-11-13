import { gql } from '@apollo/client'

export const GET_USER = gql`
  query GetUser($id: UUID!) {
    usersCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          email
          name
          company_id
          active
          email_verified_at
          last_login_at
          created_at
          updated_at
        }
      }
    }
  }
`
