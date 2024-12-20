'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useState, useEffect, useMemo } from 'react'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { ErrorToast, SuccessToast, WarningToast } from '@/shared/components/ui'

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

  const services = useMemo(
    () => ({
      court: new CourtServerService(client),
    }),
    [client]
  )

  const [state, setState] = useState<UseCourtState>({
    courts: [],
    court: null,
    loading: false,
    error: null,
  })
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const facilityId = useMemo(() => {
    if (!isAuthenticated || !user?.facility_id) return null
    return user.facility_id
  }, [isAuthenticated, user?.facility_id])

  const fetchCourts = useCallback(async () => {
    if (!facilityId) return

    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const courts = await services.court.getCourts(facilityId)
      setState((prev) => ({ ...prev, courts, loading: false }))
    } catch (error) {
      console.error('[Courts] Fetch error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        facilityId,
      })
      ErrorToast('Failed to load courts')
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to fetch courts'),
        loading: false,
      }))
    }
  }, [facilityId, services])

  const createCourt = useCallback(
    async (name: string): Promise<Courts> => {
      if (!isAuthenticated || !user?.facility_id) {
        ErrorToast('Authentication required')
        throw new Error('Authentication required')
      }

      const { isValid, error } = CourtClientService.validateCourtName(name)
      if (!isValid) {
        WarningToast(error || 'Invalid court name')
        throw new Error(error)
      }

      const formattedName = CourtClientService.formatCourtName(name)

      setCreating(true)
      try {
        const newCourt = await services.court.createCourt(user.facility_id, formattedName)
        await fetchCourts()
        SuccessToast('Court created successfully')
        return newCourt
      } catch (error) {
        console.error('[Courts] Create error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          name,
          facilityId: user.facility_id,
        })
        ErrorToast('Failed to create court')
        throw error
      } finally {
        setCreating(false)
      }
    },
    [isAuthenticated, user?.facility_id, services, fetchCourts]
  )

  const updateCourt = useCallback(
    async (courtNumber: number, name: string): Promise<Courts> => {
      if (!isAuthenticated || !user?.facility_id) {
        ErrorToast('Authentication required')
        throw new Error('Authentication required')
      }

      const { isValid, error } = CourtClientService.validateCourtName(name)
      if (!isValid) {
        WarningToast(error || 'Invalid court name')
        throw new Error(error)
      }

      const formattedName = CourtClientService.formatCourtName(name)

      setUpdating(true)
      try {
        const updatedCourt = await services.court.updateCourt(user.facility_id, courtNumber, {
          name: formattedName,
        })
        await fetchCourts()
        SuccessToast('Court updated successfully')
        return updatedCourt
      } catch (error) {
        console.error('[Courts] Update error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          courtNumber,
          name,
          facilityId: user.facility_id,
        })
        ErrorToast('Failed to update court')
        throw error
      } finally {
        setUpdating(false)
      }
    },
    [isAuthenticated, user?.facility_id, services, fetchCourts]
  )

  const updateCourtStatus = useCallback(
    async (courtNumber: number, isActive: boolean): Promise<Courts> => {
      if (!isAuthenticated || !user?.facility_id) {
        ErrorToast('Authentication required')
        throw new Error('Authentication required')
      }

      setUpdating(true)
      try {
        const updatedCourt = await services.court.updateCourt(user.facility_id, courtNumber, {
          is_active: isActive,
        })
        await fetchCourts()
        SuccessToast(`Court ${isActive ? 'activated' : 'deactivated'} successfully`)
        return updatedCourt
      } catch (error) {
        console.error('[Courts] Status update error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          courtNumber,
          isActive,
          facilityId: user.facility_id,
        })
        ErrorToast(`Failed to ${isActive ? 'activate' : 'deactivate'} court`)
        throw error
      } finally {
        setUpdating(false)
      }
    },
    [isAuthenticated, user?.facility_id, services, fetchCourts]
  )

  useEffect(() => {
    if (!facilityId) return
    fetchCourts()
  }, [facilityId, fetchCourts])

  useEffect(() => {
    let mounted = true

    async function fetchSingleCourt() {
      if (!facilityId || !courtNumber) return
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const court = await services.court.getCourt(facilityId, courtNumber)
        if (mounted) {
          setState((prev) => ({ ...prev, court, loading: false }))
        }
      } catch (error) {
        console.error('[Courts] Fetch single error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          courtNumber,
          facilityId,
        })
        if (mounted) {
          ErrorToast('Failed to load court details')
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
  }, [facilityId, courtNumber, services])

  return {
    ...state,
    creating,
    updating,
    createCourt,
    updateCourt,
    updateCourtStatus,
    refetch: fetchCourts,
  }
}
