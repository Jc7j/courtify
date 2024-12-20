import { gql } from '@apollo/client'

import { FACILITY_FIELDS, FACILITY_PRODUCT_FIELDS } from './queries'

export const CREATE_FACILITY = gql`
  ${FACILITY_FIELDS}
  mutation CreateFacility($objects: [facilitiesInsertInput!]!) {
    insertIntofacilitiesCollection(objects: $objects) {
      records {
        ...FacilityFields
      }
    }
  }
`

export const UPDATE_FACILITY = gql`
  mutation UpdateFacility($id: UUID!, $set: facilitiesUpdateInput!) {
    updatefacilitiesCollection(set: $set, filter: { id: { eq: $id } }) {
      records {
        id
        name
        slug
        stripe_account_id
        stripe_account_enabled
        updated_at
      }
    }
  }
`

export const CREATE_PRODUCT = gql`
  ${FACILITY_PRODUCT_FIELDS}
  mutation CreateFacilityProduct($input: facility_productsInsertInput!) {
    insertIntofacility_productsCollection(objects: [$input]) {
      records {
        ...FacilityProductFields
      }
    }
  }
`

export const UPDATE_PRODUCT = gql`
  ${FACILITY_PRODUCT_FIELDS}
  mutation UpdateFacilityProduct($id: UUID!, $set: facility_productsUpdateInput!) {
    updatefacility_productsCollection(filter: { id: { eq: $id } }, set: $set) {
      records {
        ...FacilityProductFields
      }
    }
  }
`
