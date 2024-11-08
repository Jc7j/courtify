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

export const UPDATE_COMPANY = gql`
  ${COMPANY_FIELDS}
  mutation UpdateCompany($id: uuid!, $set: companies_set_input!) {
    update_companies_by_pk(pk_columns: { id: $id }, _set: $set) {
      ...CompanyFields
    }
  }
`

export const DELETE_COMPANY = gql`
  mutation DeleteCompany($id: uuid!) {
    delete_companies_by_pk(id: $id) {
      id
    }
  }
`

// Queries
export const GET_COMPANY = gql`
  ${COMPANY_FIELDS}
  query GetCompany($id: uuid!) {
    companies_by_pk(id: $id) {
      ...CompanyFields
    }
  }
`

export const GET_COMPANIES = gql`
  ${COMPANY_FIELDS}
  query GetCompanies {
    companies(order_by: { created_at: desc }) {
      ...CompanyFields
    }
  }
`
