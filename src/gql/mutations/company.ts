import { gql } from '@apollo/client'

import { COMPANY_FIELDS } from '../queries/company'

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
