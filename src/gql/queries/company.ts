import { gql } from '@apollo/client'

export const COMPANY_FIELDS = gql`
  fragment CompanyFields on companies {
    id
    name
    slug
    created_at
    updated_at
  }
`

export const GET_COMPANY_BY_SLUG = gql`
  ${COMPANY_FIELDS}
  query GetCompanyBySlug($slug: String!) {
    companiesCollection(filter: { slug: { eq: $slug } }, first: 1) {
      edges {
        node {
          ...CompanyFields
        }
      }
    }
  }
`
