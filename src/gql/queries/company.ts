import { gql } from '@apollo/client'

export const COMPANY_BY_SLUG_FIELDS = gql`
  fragment CompanyBySlugFields on companies {
    id
    name
    slug
    stripe_account_id
    stripe_currency
  }
`

export const GET_COMPANY_BY_SLUG = gql`
  ${COMPANY_BY_SLUG_FIELDS}
  query GetCompanyBySlug($slug: String!) {
    companiesCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          ...CompanyBySlugFields
        }
      }
    }
  }
`

export const COMPANY_FIELDS = gql`
  fragment CompanyFields on companies {
    id
    name
    address
    sports
    slug
    stripe_account_id
    stripe_account_enabled
    stripe_account_details
    stripe_webhook_secret
    stripe_payment_methods
    stripe_currency
    created_at
    updated_at
  }
`

export const GET_COMPANY_BY_ID = gql`
  ${COMPANY_FIELDS}
  query GetCompanyById($id: UUID!) {
    companiesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...CompanyFields
        }
      }
    }
  }
`
