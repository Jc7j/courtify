'use client'

import { useMutation, useQuery } from '@apollo/client'
import { CREATE_COURT, UPDATE_COURT, DELETE_COURT } from '@/gql/mutations/court'
import { GET_COMPANY_COURTS } from '@/gql/queries/court'
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

  const getNextCourtNumber = (): number => {
    if (!courtsData?.courtsCollection?.edges) return 1

    const existingCourts = courtsData.courtsCollection.edges.map(
      (edge: { node: Courts }) => edge.node
    )
    return Math.max(0, ...existingCourts.map((c: Courts) => c.court_number)) + 1
  }

  const createCourt = async (name: string): Promise<Courts> => {
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

  const updateCourt = async (courtNumber: number, name: string): Promise<Courts> => {
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

  const deleteCourt = async (courtNumber: number): Promise<Courts> => {
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

  const courts =
    courtsData?.courtsCollection?.edges?.map((edge: { node: Courts }) => edge.node) || []

  return {
    courts,
    loading: userLoading || courtsLoading,
    error: courtsError ? new Error('Failed to load courts') : null,
    createCourt,
    updateCourt,
    deleteCourt,
    creating,
    updating,
    deleting,
    refetch: refetch as unknown as () => Promise<void>,
  }
}
