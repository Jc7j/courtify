import { useQuery } from '@apollo/client'
import { GET_USER, GET_COMPANY_MEMBERS } from '@/gql/queries/user'
import type { User, UserEdge } from '@/types/graphql'

export function useUserDetails(id?: string, enabled = true) {
  const { data, loading, error, refetch } = useQuery(GET_USER, {
    variables: { id },
    skip: !id || !enabled,
  })

  return {
    user: data?.usersCollection?.edges[0]?.node as User | null,
    loading,
    error: error as Error | null,
    refetch,
  }
}

export function useCompanyMembers(companyId?: string, enabled = true) {
  const { data, loading, error, refetch } = useQuery(GET_COMPANY_MEMBERS, {
    variables: { companyId },
    skip: !companyId || !enabled,
  })

  const members: User[] = data?.usersCollection?.edges.map((edge: UserEdge) => edge.node) || []

  return {
    members,
    loading,
    error: error as Error | null,
    refetch,
  }
}
