'use client'

import { useState, useCallback, useRef } from 'react'

import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import { ErrorToast, InfoToast, SuccessToast, WarningToast } from '@/shared/components/ui'

import { StripeAccountDetails, StripeConnectResponse, StripeStatusResponse } from '../types'

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
  const facility = useFacilityStore((state) => state.facility)
  const [connecting, setConnecting] = useState(false)
  const [checking, setChecking] = useState(false)

  const abortControllerRef = useRef<AbortController>()
  const lastRequestIdRef = useRef<string>('')

  const makeRequest = useCallback(
    async <T>(url: string, options: Parameters<typeof fetch>[1], requestId: string): Promise<T> => {
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
    if (!facility?.id) {
      ErrorToast('No facility found')
      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: 'No facility found',
      }
    }

    try {
      setChecking(true)
      const requestId = `status-${Date.now()}`

      if (!facility.stripe_account_id) {
        InfoToast('Stripe account not connected')
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
          headers: {
            'Content-Type': 'application/json',
            'X-Stripe-Account': facility.stripe_account_id,
          },
          body: JSON.stringify({
            facility_id: facility.id,
          }),
        },
        requestId
      )

      if (data.accountId) {
        SuccessToast('Stripe account verified')
        return {
          isConnected: true,
          isEnabled: data.isEnabled,
          accountDetails: data.accountDetails,
          error: null,
        }
      }

      WarningToast('Stripe account needs setup')
      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: null,
      }
    } catch (err) {
      console.error('[Stripe] Status check error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        facilityId: facility.id,
      })
      ErrorToast('Failed to check Stripe status')
      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: err instanceof Error ? err.message : 'Failed to check Stripe status',
      }
    } finally {
      setChecking(false)
    }
  }, [facility?.id, makeRequest, facility?.stripe_account_id])

  const connectStripe = useCallback(
    async ({
      reconnect = false,
      linkType = 'onboarding',
    }: ConnectStripeOptions = {}): Promise<StripeConnectResponse> => {
      if (!facility?.id || !facility.name) {
        ErrorToast('Facility information not found')
        return { url: null, error: 'Facility information not found' }
      }

      try {
        setConnecting(true)
        InfoToast('Setting up Stripe connection...')

        const data = await makeRequest<StripeConnectResponse>(
          '/api/stripe/accounts/connect',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              facility_id: facility.id,
              facility_name: facility.name,
              reconnect,
              link_type: linkType,
            }),
          },
          `connect-${Date.now()}`
        )

        if (data.url && !data.error) {
          SuccessToast('Stripe connection ready')
          checkStripeStatus()
        }

        return data
      } catch (err) {
        console.error('[Stripe] Connect error:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          facilityId: facility.id,
        })
        ErrorToast('Failed to connect Stripe')
        return {
          url: null,
          error: err instanceof Error ? err.message : 'Failed to connect Stripe',
        }
      } finally {
        setConnecting(false)
      }
    },
    [facility?.id, facility?.name, makeRequest, checkStripeStatus]
  )

  return {
    connectStripe,
    checkStripeStatus,
    connecting,
    checking,
  }
}
