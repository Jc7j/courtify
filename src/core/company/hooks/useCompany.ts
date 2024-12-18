'use client'

import { useApolloClient } from '@apollo/client'
import { useCallback, useState, useEffect, useMemo } from 'react'

import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { supabase } from '@/shared/lib/supabase/client'

import { CompanyClientService } from '../services/companyClientService'
import { CompanyServerService } from '../services/companyServerService'

import type { BaseUser } from '@/shared/types/auth'
import type { Company } from '@/shared/types/graphql'

interface UseCompanyReturn {
  company: Company | null
  loading: boolean
  error: Error | null
  creating: boolean
  updating: boolean
  createCompany: (name: string, address: string, sports: string) => Promise<void>
  updateCompany: (data: UpdateCompanyInput) => Promise<void>
}

interface UseCompanyProps {
  slug?: string
}

interface UpdateCompanyInput {
  name: string
  slug: string
  stripe_account_id?: string | null
  stripe_account_enabled?: boolean
  stripe_account_details?: any | null
}

export function useCompany({ slug }: UseCompanyProps = {}): UseCompanyReturn {
  const client = useApolloClient()
  const companyServerService = useMemo(() => new CompanyServerService(client), [client])
  const { user, isLoading: userLoading } = useUserStore()
  const { handleCompanyCreated } = useOnboarding()

  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchCompany = useCallback(async () => {
    if (!user?.company_id && !slug) return

    setLoading(true)
    try {
      const result = slug
        ? await companyServerService.getCompanyBySlug(slug)
        : await companyServerService.getCompanyById(user!.company_id!)

      setCompany(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch company'))
    } finally {
      setLoading(false)
    }
  }, [user?.company_id, slug, companyServerService])

  const createCompany = useCallback(
    async (name: string, address: string, sports: string) => {
      try {
        const validation = CompanyClientService.validateCompanyInput(name, address)
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
        const formattedName = CompanyClientService.formatCompanyName(name)
        const slug = CompanyClientService.generateCompanySlug(name)

        const newCompany = await companyServerService.createCompany({
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
          .update({ company_id: newCompany.id, role: 'owner' })
          .eq('id', user.id)

        if (updateError) throw updateError

        useUserStore.getState().updateUser({ company_id: newCompany.id })
        await handleCompanyCreated()

        setCompany(newCompany)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create company'))
        throw err
      } finally {
        setCreating(false)
      }
    },
    [user?.id, companyServerService, handleCompanyCreated]
  )

  const updateCompany = useCallback(
    async (data: UpdateCompanyInput) => {
      if (!company?.id) throw new Error('No company found')

      try {
        setUpdating(true)
        const updatedCompany = await companyServerService.updateCompany(company.id, {
          ...data,
          updated_at: new Date().toISOString(),
        })

        setCompany(updatedCompany)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update company'))
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [company?.id, companyServerService]
  )

  useEffect(() => {
    if (userLoading) return
    fetchCompany()
  }, [fetchCompany, userLoading])

  return {
    company,
    loading: loading || userLoading,
    error,
    creating,
    updating,
    createCompany,
    updateCompany,
  }
}
