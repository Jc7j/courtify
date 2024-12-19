import { useQuery } from '@apollo/client'

import { GET_FACILITY_MEMBERS } from '@/core/user/graphql/queries'

import type { User, UserEdge } from '@/shared/types/graphql'

export function useFacilityMembers(facilityId?: string, enabled = true) {
  const { data, loading, error, refetch } = useQuery(GET_FACILITY_MEMBERS, {
    variables: { facilityId },
    skip: !facilityId || !enabled,
  })

  const members: User[] = data?.usersCollection?.edges.map((edge: UserEdge) => edge.node) || []

  return {
    members,
    loading,
    error: error as Error | null,
    refetch,
  }
}
