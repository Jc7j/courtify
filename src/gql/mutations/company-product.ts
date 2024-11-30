import { gql } from '@apollo/client'

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on company_products {
    id
    company_id
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

export const CREATE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation CreateCompanyProduct($input: company_productsInsertInput!) {
    insertIntocompany_productsCollection(objects: [$input]) {
      records {
        ...ProductFields
      }
    }
  }
`

export const UPDATE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation UpdateCompanyProduct($id: UUID!, $set: company_productsUpdateInput!) {
    updatecompany_productsCollection(filter: { id: { eq: $id } }, set: $set) {
      records {
        ...ProductFields
      }
    }
  }
`

export const DELETE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation DeleteCompanyProduct($id: UUID!) {
    deleteFromcompany_productsCollection(filter: { id: { eq: $id } }) {
      records {
        ...ProductFields
      }
    }
  }
`
