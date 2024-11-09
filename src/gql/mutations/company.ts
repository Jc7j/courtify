import { gql } from '@apollo/client'

// Company Fragments for reuse
const COMPANY_FIELDS = gql`
  fragment CompanyFields on companies {
    id
    name
    slug
    created_at
    updated_at
  }
`

// Mutations
export const CREATE_COMPANY = gql`
  ${COMPANY_FIELDS}
  mutation CreateCompany($objects: [companies_insert_input!]!) {
    insertIntocompaniesCollection(objects: $objects) {
      records {
        ...CompanyFields
      }
    }
  }
`
