'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useState, useEffect, useMemo } from 'react'

import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { ErrorToast, SuccessToast } from '@/shared/components/ui'
import { supabase } from '@/shared/lib/supabase/client'

import { useFacilityStore } from './useFacilityStore'
import { FacilityClientService } from '../services/facilityClientService'
import { FacilityServerService } from '../services/facilityServerService'

import type { Facility } from '@/shared/types/graphql'

interface UseFacilityReturn {
  facility: Facility | null
  loading: boolean
  error: Error | null
  creating: boolean
  updating: boolean
  createFacility: (name: string, address: string, sports: string) => Promise<void>
  updateFacility: (data: UpdateFacilityInput) => Promise<void>
}

interface UpdateFacilityInput {
  name?: string
  slug?: string
  stripe_account_id?: string | null
  stripe_account_enabled?: boolean
}

interface FacilityState {
  facility: Facility | null
  loading: boolean
  error: Error | null
  creating: boolean
  updating: boolean
}

export function useFacility(): UseFacilityReturn {
  const client = useApolloClient()
  const services = useMemo(
    () => ({
      facility: new FacilityServerService(client),
    }),
    [client]
  )

  const { user, isLoading: userLoading } = useUserStore()
  const { handleFacilityCreated } = useOnboarding()
  const facilityStore = useFacilityStore()

  const [state, setState] = useState<FacilityState>({
    facility: null,
    loading: false,
    error: null,
    creating: false,
    updating: false,
  })

  const fetchFacility = useCallback(async () => {
    if (!user?.facility_id) return

    if (facilityStore.facility?.id === user.facility_id) {
      setState((prev) => ({ ...prev, facility: facilityStore.facility as Facility }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await services.facility.getFacilityById(user.facility_id)
      setState((prev) => ({ ...prev, facility: result, loading: false }))

      if (result) {
        facilityStore.setFacility({
          id: result.id,
          name: result.name,
          slug: result.slug,
          stripe_account_id: result.stripe_account_id,
          stripe_account_enabled: result.stripe_account_enabled,
        })
      }
    } catch (err) {
      console.error('[Facility] Fetch error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        facilityId: user.facility_id,
      })
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error('Failed to fetch facility'),
        loading: false,
      }))
    }
  }, [user?.facility_id, services, facilityStore])

  const createFacility = useCallback(
    async (name: string, address: string, sports: string) => {
      try {
        const validation = FacilityClientService.validateFacilityInput(name, address)
        if (!validation.isValid) {
          throw new Error(validation.error)
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.access_token) {
          throw new Error('No valid session found')
        }

        setState((prev) => ({ ...prev, creating: true, error: null }))
        const now = new Date().toISOString()
        const formattedName = FacilityClientService.formatFacilityName(name)
        const slug = FacilityClientService.generateFacilitySlug(formattedName)

        const newFacility = await services.facility.createFacility({
          name: formattedName,
          address,
          sports,
          slug,
          created_at: now,
          updated_at: now,
        })

        if (!user?.id) {
          throw new Error('User not found')
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({ facility_id: newFacility.id, role: 'owner' })
          .eq('id', user.id)

        if (updateError) throw updateError

        useUserStore.getState().updateUser({ facility_id: newFacility.id })
        await handleFacilityCreated()

        setState((prev) => ({ ...prev, facility: newFacility, error: null }))
        SuccessToast('Facility created successfully')
      } catch (err) {
        console.error('[Facility] Create error:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          name,
          address,
          sports,
        })
        ErrorToast(err instanceof Error ? err.message : 'Failed to create facility')
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Failed to create facility'),
        }))
        throw err
      } finally {
        setState((prev) => ({ ...prev, creating: false }))
      }
    },
    [user?.id, services, handleFacilityCreated]
  )

  const updateFacility = useCallback(
    async (data: UpdateFacilityInput) => {
      if (!state.facility?.id) throw new Error('No facility found')

      try {
        setState((prev) => ({ ...prev, updating: true, error: null }))
        const updatedFacility = await services.facility.updateFacility(state.facility.id, {
          ...data,
        })

        setState((prev) => ({ ...prev, facility: updatedFacility, error: null }))
        SuccessToast('Facility updated successfully')
      } catch (err) {
        console.error('[Facility] Update error:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          facilityId: state.facility.id,
        })
        ErrorToast(err instanceof Error ? err.message : 'Failed to update facility')
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Failed to update facility'),
          updating: false,
        }))
      } finally {
        setState((prev) => ({ ...prev, updating: false }))
      }
    },
    [state.facility?.id, services]
  )

  useEffect(() => {
    if (!userLoading) {
      fetchFacility()
    }
  }, [fetchFacility, userLoading])

  return {
    ...state,
    loading: state.loading || userLoading,
    createFacility,
    updateFacility,
  }
}
