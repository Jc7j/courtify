import { useQuery } from '@apollo/client'

import { GET_COMPANY_MEMBERS } from '@/core/user/components/graphql/queries'

import type { User, UserEdge } from '@/shared/types/graphql'

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