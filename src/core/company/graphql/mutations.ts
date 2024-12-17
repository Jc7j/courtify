import { gql } from '@apollo/client'

import { COMPANY_FIELDS, COMPANY_PRODUCT_FIELDS } from './queries'

export const CREATE_COMPANY = gql`
  ${COMPANY_FIELDS}
  mutation CreateCompany($objects: [companiesInsertInput!]!) {
    insertIntocompaniesCollection(objects: $objects) {
      records {
        ...CompanyFields
      }
    }
  }
`

export const UPDATE_COMPANY = gql`
  ${COMPANY_FIELDS}
  mutation UpdateCompany($id: UUID!, $set: companiesUpdateInput!) {
    updatecompaniesCollection(filter: { id: { eq: $id } }, set: $set) {
      records {
        ...CompanyFields
      }
    }
  }
`

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
