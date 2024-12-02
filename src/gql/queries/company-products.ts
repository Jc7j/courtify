import { gql } from '@apollo/client'

export const COMPANY_PRODUCT_FIELDS = gql`
  fragment CompanyProductFields on company_products {
    id
    name
    description
    type
    price_amount
    currency
    stripe_price_id
    stripe_product_id
    metadata
    is_active
    created_at
    updated_at
  }
`

export const GET_COMPANY_PRODUCTS = gql`
  ${COMPANY_PRODUCT_FIELDS}
  query GetCompanyProducts($companyId: UUID!) {
    company_productsCollection(filter: { company_id: { eq: $companyId } }) {
      edges {
        node {
          ...CompanyProductFields
        }
      }
    }
  }
`
