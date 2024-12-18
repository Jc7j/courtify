import { gql } from '@apollo/client'

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
    created_at
    updated_at
  }
`

export const GET_USER = gql`
  ${USER_FIELDS}
  query GetUser($id: UUID!) {
    usersCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...UserFields
        }
      }
    }
  }
`

export const GET_COMPANY_MEMBERS = gql`
  ${USER_FIELDS}
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
`
