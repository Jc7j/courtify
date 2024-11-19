import { gql } from '@apollo/client'

export const COMPANY_FIELDS = gql`
  fragment CompanyFields on companies {
    id
    name
    address
    sports
    businessinfo
    slug
    created_at
    updated_at
  }
`

export const CREATE_COMPANY = gql`
  ${COMPANY_FIELDS}
  mutation CreateCompany($objects: [companies_insert_input!]!) {
    insertIntocompaniesCollection(objects: $objects) {
      records {
        ...CompanyFields
      }
      affectedCount
    }
  }
`
