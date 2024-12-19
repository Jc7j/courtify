'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useState, useEffect, useMemo } from 'react'

import { useCompanyStore } from './useCompanyStore'
import { PublicCompanyServerService } from '../services/publicCompanyServerService'

import type { Company } from '@/shared/types/graphql'

interface UsePublicCompanyReturn {
  company: Company | null
  loading: boolean
  error: Error | null
}

export function usePublicCompany(slug: string): UsePublicCompanyReturn {
  const client = useApolloClient()
  const publicCompanyServerService = useMemo(() => new PublicCompanyServerService(client), [client])
  const companyStore = useCompanyStore()

  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCompany = useCallback(async () => {
    if (!slug) return

    try {
      const result = await publicCompanyServerService.getCompanyBySlug(slug)

      if (!result) {
        setError(new Error(`No company found with slug: ${slug}`))
        return
      }

      setCompany(result)

      // Update store with public company data
      companyStore.setCompany({
        id: result.id,
        name: result.name,
        slug: result.slug,
        stripe_account_id: result.stripe_account_id,
        stripe_account_enabled: result.stripe_account_enabled,
      })
    } catch (err) {
      console.error('[usePublicCompany] Failed to fetch company:', {
        error: err,
        slug,
      })
      setError(err instanceof Error ? err : new Error('Failed to fetch company'))
    } finally {
      setLoading(false)
    }
  }, [slug, publicCompanyServerService, companyStore])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  return {
    company,
    loading,
    error,
  }
}
