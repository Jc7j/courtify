import { gql } from '@apollo/client'

export const FACILITY_BY_SLUG_FIELDS = gql`
  fragment FacilityBySlugFields on facilities {
    id
    name
    slug
    stripe_account_id
    stripe_account_enabled
    stripe_currency
    address
    sports
    created_at
    updated_at
  }
`

export const GET_FACILITY_BY_SLUG = gql`
  ${FACILITY_BY_SLUG_FIELDS}
  query GetFacilityBySlug($slug: String!) {
    facilitiesCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          ...FacilityBySlugFields
        }
      }
    }
  }
`

export const FACILITY_FIELDS = gql`
  fragment FacilityFields on facilities {
    id
    name
    address
    sports
    slug
    stripe_account_id
    stripe_account_enabled
    stripe_currency
    created_at
    updated_at
  }
`

export const GET_FACILITY_BY_ID = gql`
  ${FACILITY_FIELDS}
  query GetFacilityById($id: UUID!) {
    facilitiesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          ...FacilityFields
        }
      }
    }
  }
`

// FACILITY_PRODUCTS
export const FACILITY_PRODUCT_FIELDS = gql`
  fragment FacilityProductFields on facility_products {
    id
    name
    description
    type
    price_amount
    currency
    stripe_price_id
    stripe_product_id
    stripe_payment_type
    metadata
    is_active
    created_at
    updated_at
  }
`

export const GET_FACILITY_PRODUCTS = gql`
  ${FACILITY_PRODUCT_FIELDS}
  query GetFacilityProducts($facilityId: UUID!) {
    facility_productsCollection(filter: { facility_id: { eq: $facilityId } }) {
      edges {
        node {
          ...FacilityProductFields
        }
      }
    }
  }
`
