'use client'

import { useState, useCallback, useRef } from 'react'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import {
  StripeAccountDetails,
  StripeStatusResponse,
  StripeConnectResponse,
} from '@/shared/types/stripe'

interface StripeStatus {
  isConnected: boolean
  isEnabled: boolean
  accountDetails: StripeAccountDetails | null
  error: string | null
}

interface UseStripeReturn {
  connectStripe: (options?: ConnectStripeOptions) => Promise<StripeConnectResponse>
  checkStripeStatus: () => Promise<StripeStatus>
  connecting: boolean
  checking: boolean
}

interface ConnectStripeOptions {
  reconnect?: boolean
  linkType?: 'onboarding' | 'update'
}

export function useStripe(): UseStripeReturn {
  const company = useCompanyStore((state) => state.company)
  const [connecting, setConnecting] = useState(false)
  const [checking, setChecking] = useState(false)

  // Use refs to prevent unnecessary re-renders and race conditions
  const abortControllerRef = useRef<AbortController>()
  const lastRequestIdRef = useRef<string>('')

  // Helper to handle API requests with abort control
  const makeRequest = useCallback(
    async <T>(url: string, options: Parameters<typeof fetch>[1], requestId: string): Promise<T> => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      lastRequestIdRef.current = requestId

      try {
        const response = await fetch(url, {
          ...options,
          signal: abortControllerRef.current.signal,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Request failed: ${response.statusText}`)
        }

        return data as T
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Request cancelled')
        }
        throw err
      }
    },
    []
  )

  const checkStripeStatus = useCallback(async (): Promise<StripeStatus> => {
    if (!company?.id) {
      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: 'No company found',
      }
    }

    try {
      setChecking(true)
      const requestId = `status-${Date.now()}`

      if (!company.stripe_account_id) {
        return {
          isConnected: false,
          isEnabled: false,
          accountDetails: null,
          error: null,
        }
      }

      const data = await makeRequest<StripeStatusResponse>(
        '/api/stripe/accounts/status',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: company.id,
            stripe_account_id: company.stripe_account_id,
          }),
        },
        requestId
      )

      if (data.accountId) {
        return {
          isConnected: true,
          isEnabled: data.isEnabled,
          accountDetails: data.accountDetails,
          error: null,
        }
      }

      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: null,
      }
    } catch (err) {
      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: err instanceof Error ? err.message : 'Failed to check Stripe status',
      }
    } finally {
      setChecking(false)
    }
  }, [company?.id, makeRequest, company?.stripe_account_id])

  const connectStripe = useCallback(
    async ({
      reconnect = false,
      linkType = 'onboarding',
    }: ConnectStripeOptions = {}): Promise<StripeConnectResponse> => {
      if (!company?.id || !company.name) {
        return { url: null, error: 'Company information not found' }
      }

      try {
        setConnecting(true)
        const data = await makeRequest<StripeConnectResponse>(
          '/api/stripe/accounts/connect',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_id: company.id,
              company_name: company.name,
              reconnect,
              link_type: linkType,
            }),
          },
          `connect-${Date.now()}`
        )

        if (data.url && !data.error) {
          checkStripeStatus()
        }

        return data
      } catch (err) {
        return {
          url: null,
          error: err instanceof Error ? err.message : 'Failed to connect Stripe',
        }
      } finally {
        setConnecting(false)
      }
    },
    [company?.id, company?.name, makeRequest, checkStripeStatus]
  )

  return {
    connectStripe,
    checkStripeStatus,
    connecting,
    checking,
  }
}
