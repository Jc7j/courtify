'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useState, useEffect, useMemo } from 'react'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { CourtClientService } from '../services/courtClientService'
import { CourtServerService } from '../services/courtServerService'

import type { Courts } from '@/shared/types/graphql'

interface UseCourtState {
  courts: Courts[]
  court: Courts | null
  loading: boolean
  error: Error | null
}

export function useCourt(courtNumber?: number) {
  const client = useApolloClient()
  const { user, isAuthenticated } = useUserStore()

  // Create service instance only once
  const courtServerService = useMemo(() => new CourtServerService(client), [client])

  const [state, setState] = useState<UseCourtState>({
    courts: [],
    court: null,
    loading: false,
    error: null,
  })
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Memoize the company ID check
  const companyId = useMemo(() => {
    if (!isAuthenticated || !user?.company_id) return null
    return user.company_id
  }, [isAuthenticated, user?.company_id])

  const fetchCourts = useCallback(async () => {
    if (!companyId) return

    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const courts = await courtServerService.getCourts(companyId)
      setState((prev) => ({ ...prev, courts, loading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to fetch courts'),
        loading: false,
      }))
    }
  }, [companyId, courtServerService])

  const createCourt = useCallback(
    async (name: string): Promise<Courts> => {
      if (!isAuthenticated || !user?.company_id) {
        throw new Error('Authentication required')
      }

      const { isValid, error } = CourtClientService.validateCourtName(name)
      if (!isValid) {
        throw new Error(error)
      }

      const formattedName = CourtClientService.formatCourtName(name)

      setCreating(true)
      try {
        const newCourt = await courtServerService.createCourt(user.company_id, formattedName)
        await fetchCourts()
        return newCourt
      } finally {
        setCreating(false)
      }
    },
    [isAuthenticated, user?.company_id, courtServerService, fetchCourts]
  )

  const updateCourt = useCallback(
    async (courtNumber: number, name: string): Promise<Courts> => {
      if (!isAuthenticated || !user?.company_id) {
        throw new Error('Authentication required')
      }

      const { isValid, error } = CourtClientService.validateCourtName(name)
      if (!isValid) {
        throw new Error(error)
      }

      const formattedName = CourtClientService.formatCourtName(name)

      setUpdating(true)
      try {
        const updatedCourt = await courtServerService.updateCourt(
          user.company_id,
          courtNumber,
          formattedName
        )
        await fetchCourts()
        return updatedCourt
      } finally {
        setUpdating(false)
      }
    },
    [isAuthenticated, user?.company_id, courtServerService, fetchCourts]
  )

  const deleteCourt = useCallback(
    async (courtNumber: number): Promise<Courts> => {
      if (!isAuthenticated || !user?.company_id) {
        throw new Error('Authentication required')
      }

      setDeleting(true)
      try {
        const deletedCourt = await courtServerService.deleteCourt(user.company_id, courtNumber)
        await fetchCourts()
        return deletedCourt
      } finally {
        setDeleting(false)
      }
    },
    [isAuthenticated, user?.company_id, courtServerService, fetchCourts]
  )

  // Only fetch courts once when mounted or when companyId changes
  useEffect(() => {
    if (!companyId) return
    fetchCourts()
  }, [companyId]) // Remove fetchCourts from dependencies

  // Only fetch single court when courtNumber changes
  useEffect(() => {
    let mounted = true

    async function fetchSingleCourt() {
      if (!companyId || !courtNumber) return
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const court = await courtServerService.getCourt(companyId, courtNumber)
        if (mounted) {
          setState((prev) => ({ ...prev, court, loading: false }))
        }
      } catch (error) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error : new Error('Failed to fetch court'),
            loading: false,
          }))
        }
      }
    }

    fetchSingleCourt()
    return () => {
      mounted = false
    }
  }, [companyId, courtNumber, courtServerService])

  return {
    ...state,
    creating,
    updating,
    deleting,
    createCourt,
    updateCourt,
    deleteCourt,
    refetch: fetchCourts,
  }
}
