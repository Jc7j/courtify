'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useState, useEffect, useMemo } from 'react'

import { useFacilityStore } from './useFacilityStore'
import { PublicFacilityServerService } from '../services/publicFacilityServerService'

import type { Facility } from '@/shared/types/graphql'

interface UsePublicFacilityReturn {
  facility: Facility | null
  loading: boolean
  error: Error | null
}

export function usePublicFacility(slug: string): UsePublicFacilityReturn {
  const client = useApolloClient()
  const publicFacilityServerService = useMemo(
    () => new PublicFacilityServerService(client),
    [client]
  )
  const facilityStore = useFacilityStore()

  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFacility = useCallback(async () => {
    if (!slug) return

    try {
      const result = await publicFacilityServerService.getFacilityBySlug(slug)

      if (!result) {
        setError(new Error(`No facility found with slug: ${slug}`))
        return
      }

      setFacility(result)

      facilityStore.setFacility({
        id: result.id,
        name: result.name,
        slug: result.slug,
        stripe_account_id: result.stripe_account_id,
        stripe_account_enabled: result.stripe_account_enabled,
      })
    } catch (err) {
      console.error('[usePublicFacility] Failed to fetch facility:', {
        error: err,
        slug,
      })
      setError(err instanceof Error ? err : new Error('Failed to fetch facility'))
    } finally {
      setLoading(false)
    }
  }, [slug, publicFacilityServerService, facilityStore])

  useEffect(() => {
    fetchFacility()
  }, [fetchFacility])

  return {
    facility,
    loading,
    error,
  }
}
