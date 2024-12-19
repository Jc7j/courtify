'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useState, useEffect, useMemo } from 'react'

import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { supabase } from '@/shared/lib/supabase/client'

import { useFacilityStore } from './useFacilityStore'
import { FacilityClientService } from '../services/facilityClientService'
import { FacilityServerService } from '../services/facilityServerService'

import type { BaseUser } from '@/shared/types/auth'
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
  name: string
  slug: string
  stripe_account_id?: string | null
  stripe_account_enabled?: boolean
}

export function useFacility(): UseFacilityReturn {
  const client = useApolloClient()
  const facilityServerService = useMemo(() => new FacilityServerService(client), [client])
  const { user, isLoading: userLoading } = useUserStore()
  const { handleFacilityCreated: handleFacilityCreated } = useOnboarding()
  const facilityStore = useFacilityStore()

  const [fullFacilityData, setFullFacilityData] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchFacility = useCallback(async () => {
    if (!user?.facility_id) return

    if (facilityStore.facility?.id === user.facility_id) {
      setFullFacilityData(facilityStore.facility as Facility)
      return
    }

    setLoading(true)
    try {
      const result = await facilityServerService.getFacilityById(user.facility_id)
      setFullFacilityData(result)

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
      setError(err instanceof Error ? err : new Error('Failed to fetch facility'))
    } finally {
      setLoading(false)
    }
  }, [user?.facility_id, facilityServerService, facilityStore])

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

        if (!useUserStore.getState().accessToken) {
          useUserStore.getState().setSession({
            user: useUserStore.getState().user as BaseUser,
            accessToken: session.access_token,
          })
        }

        setCreating(true)
        const now = new Date().toISOString()
        const formattedName = FacilityClientService.formatFacilityName(name)
        const slug = FacilityClientService.generateFacilitySlug(formattedName)

        const newFacility = await facilityServerService.createFacility({
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

        setFullFacilityData(newFacility)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create facility'))
        throw err
      } finally {
        setCreating(false)
      }
    },
    [user?.id, facilityServerService, handleFacilityCreated]
  )

  const updateFacility = useCallback(
    async (data: UpdateFacilityInput) => {
      if (!fullFacilityData?.id) throw new Error('No facility found')

      try {
        setUpdating(true)
        const updatedFacility = await facilityServerService.updateFacility(fullFacilityData.id, {
          ...data,
          updated_at: new Date().toISOString(),
        })

        setFullFacilityData(updatedFacility)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update facility'))
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [fullFacilityData?.id, facilityServerService]
  )

  useEffect(() => {
    if (!userLoading) {
      fetchFacility()
    }
  }, [fetchFacility, userLoading])

  return {
    facility: fullFacilityData,
    loading: loading || userLoading,
    error,
    creating,
    updating,
    createFacility,
    updateFacility,
  }
}
