import { gql } from '@apollo/client'
import type { Companies } from '@/gql/graphql'

// Company Fragments for reuse
const COMPANY_FIELDS = gql`
  fragment CompanyFields on companies {
    id
    name
    slug
  }
`

export type CreateCompanyResponse = {
  insert_companies_one: Companies
}

export type CreateCompanyInput = {
  name: string
  slug: string
}

// Mutations
export const CREATE_COMPANY = gql`
  ${COMPANY_FIELDS}
  mutation CreateCompany($object: companies_insert_input!) {
    insert_companies_one(object: $object) {
      ...CompanyFields
    }
  }
`
