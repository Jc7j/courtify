'use client'

import { useState, useCallback } from 'react'

import { useFacility } from '@/core/facility/hooks/useFacility'
import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import { ErrorToast, InfoToast, SuccessToast, WarningToast } from '@/shared/components/ui'

import { StripeAccountDetails, StripeConnectResponse } from '../types'

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
}

interface ConnectStripeOptions {
  reconnect?: boolean
  linkType?: 'onboarding' | 'update'
}

export function useStripe(): UseStripeReturn {
  const facility = useFacilityStore((state) => state.facility)
  const { updateFacility } = useFacility()
  const [connecting, setConnecting] = useState(false)

  const checkStripeStatus = useCallback(async (): Promise<StripeStatus> => {
    try {
      if (!facility?.id) {
        ErrorToast('No facility found')
        return {
          isConnected: false,
          isEnabled: false,
          accountDetails: null,
          error: 'No facility found',
        }
      }

      if (!facility.stripe_account_id) {
        return {
          isConnected: false,
          isEnabled: false,
          accountDetails: null,
          error: null,
        }
      }

      const response = await fetch('/api/stripe/accounts/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Stripe-Account': facility.stripe_account_id,
        },
        body: JSON.stringify({
          facility_id: facility.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Request failed: ${response.statusText}`)
      }

      if (data.accountId) {
        if (data.isEnabled !== facility.stripe_account_enabled) {
          try {
            await updateFacility({
              stripe_account_enabled: data.isEnabled,
            })
            SuccessToast(
              data.isEnabled
                ? 'Stripe account verified and enabled for payments'
                : 'Stripe account requires additional setup'
            )
          } catch (updateError) {
            console.error('[Stripe] Failed to update facility stripe status:', updateError)
            ErrorToast('Failed to update facility payment status')
          }
        }

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
        facilityId: facility?.id,
      })
      ErrorToast('Failed to check Stripe status')
      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: err instanceof Error ? err.message : 'Failed to check Stripe status',
      }
    }
  }, [facility?.id, facility?.stripe_account_id, updateFacility])

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

        const data = await fetch('/api/stripe/accounts/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facility_id: facility.id,
            facility_name: facility.name,
            reconnect,
            link_type: linkType,
          }),
        })

        const dataJson = await data.json()

        if (dataJson.url && !dataJson.error) {
          SuccessToast('Stripe connection ready')
          checkStripeStatus()
        }

        return dataJson
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
    [facility?.id, facility?.name, checkStripeStatus]
  )

  return {
    connectStripe,
    checkStripeStatus,
    connecting,
  }
}
