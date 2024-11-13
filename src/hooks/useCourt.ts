'use client'

import { useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { CREATE_COURT, UPDATE_COURT, DELETE_COURT } from '@/gql/mutations/court'
import { GET_COMPANY_COURTS, GET_COURT } from '@/gql/queries/court'
import type { Courts } from '@/types/graphql'
import { useUser } from '@/hooks/useUser'

interface UseCourtReturn {
  courts: Courts[]
  loading: boolean
  error: Error | null
  createCourt: (name: string) => Promise<Courts>
  updateCourt: (courtNumber: number, name: string) => Promise<Courts>
  deleteCourt: (courtNumber: number) => Promise<Courts>
  creating: boolean
  updating: boolean
  deleting: boolean
  refetch: () => Promise<void>
  getCourt: (courtNumber: number) => Promise<Courts | null>
  courtLoading: boolean
  courtError: Error | null
}

export function useCourt(): UseCourtReturn {
  const { user, loading: userLoading } = useUser()

  // Query existing courts
  const {
    data: courtsData,
    loading: courtsLoading,
    error: courtsError,
    refetch,
  } = useQuery(GET_COMPANY_COURTS, {
    variables: { company_id: user?.company_id },
    skip: !user?.company_id,
  })

  const [createCourtMutation, { loading: creating }] = useMutation(CREATE_COURT)
  const [updateCourtMutation, { loading: updating }] = useMutation(UPDATE_COURT)
  const [deleteCourtMutation, { loading: deleting }] = useMutation(DELETE_COURT)

  const [getCourt, { loading: courtLoading, error: courtError }] = useLazyQuery(GET_COURT)

  function getNextCourtNumber(): number {
    if (!courtsData?.courtsCollection?.edges) return 1

    const existingCourts = courtsData.courtsCollection.edges.map(
      (edge: { node: Courts }) => edge.node
    )
    return Math.max(0, ...existingCourts.map((c: Courts) => c.court_number)) + 1
  }

  async function createCourt(name: string): Promise<Courts> {
    if (userLoading) {
      throw new Error('Authentication loading')
    }

    if (!user?.id) {
      throw new Error('Authentication required')
    }

    if (!user.company_id) {
      throw new Error('Company required')
    }

    try {
      const courtInput = {
        company_id: user.company_id,
        court_number: getNextCourtNumber(),
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data } = await createCourtMutation({
        variables: { objects: [courtInput] },
      })

      const newCourt = data?.insertIntocourtsCollection?.records?.[0]
      if (!newCourt) {
        throw new Error('Failed to create court')
      }

      await refetch()
      return newCourt
    } catch (err) {
      console.error('Error in createCourt:', err)
      throw err instanceof Error ? err : new Error('Failed to create court')
    }
  }

  async function updateCourt(courtNumber: number, name: string): Promise<Courts> {
    if (!user?.company_id) {
      throw new Error('Company required')
    }

    try {
      const { data } = await updateCourtMutation({
        variables: {
          company_id: user.company_id,
          court_number: courtNumber,
          set: {
            name,
            updated_at: new Date().toISOString(),
          },
        },
      })

      if (!data?.updatecourtsCollection?.records?.[0]) {
        throw new Error('Failed to update court')
      }

      return data.updatecourtsCollection.records[0]
    } catch (err) {
      console.error('Error in updateCourt:', err)
      throw err instanceof Error ? err : new Error('Failed to update court')
    }
  }

  async function deleteCourt(courtNumber: number): Promise<Courts> {
    if (!user?.company_id) {
      throw new Error('Company required')
    }

    try {
      const { data } = await deleteCourtMutation({
        variables: {
          company_id: user.company_id,
          court_number: courtNumber,
        },
      })

      if (!data?.deleteFromcourtsCollection?.records?.[0]) {
        throw new Error('Failed to delete court')
      }

      return data.deleteFromcourtsCollection.records[0]
    } catch (err) {
      console.error('Error in deleteCourt:', err)
      throw err instanceof Error ? err : new Error('Failed to delete court')
    }
  }

  async function fetchCourt(courtNumber: number): Promise<Courts | null> {
    if (!user?.company_id) {
      throw new Error('Company required')
    }

    try {
      const { data } = await getCourt({
        variables: {
          company_id: user?.company_id,
          court_number: courtNumber,
        },
      })

      return data?.courtsCollection?.edges?.[0]?.node || null
    } catch (err) {
      console.error('Error fetching court:', err)
      throw err instanceof Error ? err : new Error('Failed to fetch court')
    }
  }

  const courts =
    courtsData?.courtsCollection?.edges?.map((edge: { node: Courts }) => edge.node) || []

  return {
    courts,
    loading: userLoading || courtsLoading,
    error: courtsError ? new Error(`Failed to load courts, ${courtsError.message}`) : null,
    createCourt,
    updateCourt,
    deleteCourt,
    creating,
    updating,
    deleting,
    refetch: refetch as unknown as () => Promise<void>,
    getCourt: fetchCourt,
    courtLoading,
    courtError: courtError ? new Error('Failed to fetch court') : null,
  }
}
