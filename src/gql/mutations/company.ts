import { gql } from '@apollo/client'

// Company Fragments for reuse
const COMPANY_FIELDS = gql`
  fragment CompanyFields on companies {
    id
    name
    slug
    branding_logo_url
    branding_primary_color
    branding_secondary_color
    branding_additional
    cancellation_policy
    created_at
    updated_at
  }
`

// Mutations
export const CREATE_COMPANY = gql`
  ${COMPANY_FIELDS}
  mutation CreateCompany($object: companies_insert_input!) {
    insert_companies_one(object: $object) {
      ...CompanyFields
    }
  }
`
