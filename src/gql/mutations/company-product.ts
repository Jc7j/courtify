import { gql } from '@apollo/client'
import { COMPANY_PRODUCT_FIELDS } from '../queries/company-products'

export const CREATE_PRODUCT = gql`
  ${COMPANY_PRODUCT_FIELDS}
  mutation CreateCompanyProduct($input: company_productsInsertInput!) {
    insertIntocompany_productsCollection(objects: [$input]) {
      records {
        ...CompanyProductFields
      }
    }
  }
`

export const UPDATE_PRODUCT = gql`
  ${COMPANY_PRODUCT_FIELDS}
  mutation UpdateCompanyProduct($id: UUID!, $set: company_productsUpdateInput!) {
    updatecompany_productsCollection(filter: { id: { eq: $id } }, set: $set) {
      records {
        ...CompanyProductFields
      }
    }
  }
`
