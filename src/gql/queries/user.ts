import { gql } from '@apollo/client'

// Fragment to share common user fields
const USER_FIELDS = gql`
  fragment UserFields on users {
    id
    email
    name
    company_id
    role
    is_active
    invited_by
    joined_at
    email_verified_at
    last_login_at
    created_at
    updated_at
  }
`

// Get a single user by ID
export const GET_USER = gql`
  query GetUser($id: UUID!) {
    usersCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...UserFields
        }
      }
    }
  }
  ${USER_FIELDS}
`

// Get all members of a company
export const GET_COMPANY_MEMBERS = gql`
  query GetCompanyMembers($companyId: UUID!) {
    usersCollection(
      filter: { company_id: { eq: $companyId } }
      orderBy: [{ role: AscNullsLast }, { joined_at: DescNullsLast }]
    ) {
      edges {
        node {
          ...UserFields
        }
      }
    }
  }
  ${USER_FIELDS}
`
