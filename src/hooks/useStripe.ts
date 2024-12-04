'use client'

import { useState, useCallback } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { useCompany } from './useCompany'
import { StripeAccountDetails } from '@/types/stripe'

interface StripeStatus {
  isConnected: boolean
  isEnabled: boolean
  accountDetails: StripeAccountDetails | null
  error: string | null
}

interface UseStripeReturn {
  connectStripe: () => Promise<{ url: string | null; error: string | null }>
  checkStripeStatus: () => Promise<StripeStatus>
  connecting: boolean
  checking: boolean
}

export function useStripe(): UseStripeReturn {
  const { user } = useUserStore()
  const { company } = useCompany()
  const [connecting, setConnecting] = useState(false)
  const [checking, setChecking] = useState(false)

  const checkStripeStatus = useCallback(async (): Promise<StripeStatus> => {
    try {
      setChecking(true)
      if (!user?.company_id) {
        throw new Error('No company found')
      }

      const response = await fetch('/api/stripe/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: user.company_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check Stripe status')
      }

      return {
        isConnected: !!data.accountId,
        isEnabled: data.isEnabled,
        accountDetails: data.accountDetails,
        error: null,
      }
    } catch (err) {
      console.error('Error checking Stripe status:', err)
      return {
        isConnected: false,
        isEnabled: false,
        accountDetails: null,
        error: err instanceof Error ? err.message : 'Failed to check Stripe status',
      }
    } finally {
      setChecking(false)
    }
  }, [user?.company_id])

  async function connectStripe() {
    try {
      setConnecting(true)
      if (!user?.company_id || !company) {
        throw new Error('No company found')
      }

      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: company.id,
          company_name: company.name,
        }),
      })

      const data = await response.json()

      console.log('Stripe connect response:', {
        status: response.status,
        ok: response.ok,
        data,
      })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect Stripe')
      }

      if (!data.url) {
        console.error('Missing URL in response:', data)
        throw new Error('Failed to get Stripe connect URL')
      }
      setConnecting(false)

      return {
        url: data.url,
        error: null,
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err)
      return {
        url: null,
        error: err instanceof Error ? err.message : 'Failed to connect Stripe',
      }
    } finally {
      setConnecting(false)
    }
  }

  return {
    connectStripe,
    checkStripeStatus,
    connecting,
    checking,
  }
}
