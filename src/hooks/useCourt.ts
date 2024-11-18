'use client'

import { useMutation, useQuery } from '@apollo/client'
import { CREATE_COURT, UPDATE_COURT, DELETE_COURT } from '@/gql/mutations/court'
import { GET_COMPANY_COURTS, GET_COURT } from '@/gql/queries/court'
import type { Courts } from '@/types/graphql'
import { useUser } from '@/providers/UserProvider'

interface UseCourtReturn {
  court: Courts | null
  courtLoading: boolean
  courtError: Error | null
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

export function useCourt(courtNumber?: number): UseCourtReturn {
  const { user, loading: userLoading, isAuthenticated } = useUser()

  const {
    data: courtData,
    loading: singleCourtLoading,
    error: singleCourtError,
  } = useQuery(GET_COURT, {
    variables: {
      company_id: user?.company_id,
      court_number: courtNumber,
    },
    skip: !isAuthenticated || !user?.company_id || !courtNumber,
  })

  const {
    data: courtsData,
    loading: courtsLoading,
    error: courtsError,
    refetch,
  } = useQuery(GET_COMPANY_COURTS, {
    variables: { company_id: user?.company_id },
    skip: !isAuthenticated || !user?.company_id,
  })

  const [createCourtMutation, { loading: creating }] = useMutation(CREATE_COURT, {
    update(cache, { data }) {
      const newCourt = data?.insertIntocourtsCollection?.records?.[0]
      if (newCourt && user?.company_id) {
        cache.modify({
          fields: {
            courtsCollection(existing = { edges: [] }) {
              const newEdge = {
                __typename: 'CourtsEdge',
                node: newCourt,
              }
              return {
                ...existing,
                edges: [...existing.edges, newEdge],
              }
            },
          },
        })
      }
    },
  })

  const [updateCourtMutation, { loading: updating }] = useMutation(UPDATE_COURT, {
    update(cache, { data }) {
      const updatedCourt = data?.updatecourtsCollection?.records?.[0]
      if (updatedCourt && user?.company_id) {
        cache.modify({
          fields: {
            courtsCollection(existing = { edges: [] }) {
              return {
                ...existing,
                edges: existing.edges.map((edge: Courts) =>
                  edge.court_number === updatedCourt.court_number &&
                  edge.company_id === updatedCourt.company_id
                    ? { ...edge, node: updatedCourt }
                    : edge
                ),
              }
            },
          },
        })
      }
    },
  })

  const [deleteCourtMutation, { loading: deleting }] = useMutation(DELETE_COURT, {
    update(cache, { data }) {
      const deletedCourt = data?.deleteFromcourtsCollection?.records?.[0]
      if (deletedCourt && user?.company_id) {
        cache.modify({
          fields: {
            courtsCollection(existing = { edges: [] }) {
              return {
                ...existing,
                edges: existing.edges.filter(
                  (edge: Courts) =>
                    !(
                      edge.court_number === deletedCourt.court_number &&
                      edge.company_id === deletedCourt.company_id
                    )
                ),
              }
            },
          },
        })
      }
    },
  })

  function getNextCourtNumber(): number {
    if (!courtsData?.courtsCollection?.edges) return 1

    const existingCourts = courtsData.courtsCollection.edges.map(
      (edge: { node: Courts }) => edge.node
    )
    return Math.max(0, ...existingCourts.map((c: Courts) => c.court_number)) + 1
  }

  async function createCourt(name: string): Promise<Courts> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication and company required')
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

      return newCourt
    } catch (err) {
      console.error('Error in createCourt:', err)
      throw err instanceof Error ? err : new Error('Failed to create court')
    }
  }

  async function updateCourt(courtNumber: number, name: string): Promise<Courts> {
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication and company required')
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
    if (!isAuthenticated || !user?.company_id) {
      throw new Error('Authentication and company required')
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

  return {
    court: courtData?.courtsCollection?.edges?.[0]?.node || null,
    courtLoading: userLoading || singleCourtLoading,
    courtError: singleCourtError ? new Error(singleCourtError.message) : null,
    courts: courtsData?.courtsCollection?.edges?.map((edge: { node: Courts }) => edge.node) || [],
    loading: userLoading || courtsLoading,
    error: courtsError ? new Error(courtsError.message) : null,
    createCourt,
    updateCourt,
    deleteCourt,
    creating,
    updating,
    deleting,
    refetch: refetch as unknown as () => Promise<void>,
  }
}
