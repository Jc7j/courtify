import { gql } from '@apollo/client'

const USER_FIELDS = gql`
  fragment UserFields on users {
    id
    email
    name
    facility_id
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

export const GET_FACILITY_MEMBERS = gql`
  ${USER_FIELDS}
  query GetFacilityMembers($facilityId: UUID!) {
    usersCollection(
      filter: { facility_id: { eq: $facilityId } }
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
