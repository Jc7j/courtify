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
  connectStripe: (
    options?: ConnectStripeOptions
  ) => Promise<{ url: string | null; error: string | null }>
  checkStripeStatus: () => Promise<StripeStatus>
  getAccountSession: (companyId?: string) => Promise<string>
  connecting: boolean
  checking: boolean
}

interface ConnectStripeOptions {
  reconnect?: boolean
  linkType?: 'onboarding' | 'update'
}

export function useStripe(): UseStripeReturn {
  const { user } = useUserStore()
  const { company } = useCompany()
  const [connecting, setConnecting] = useState(false)
  const [checking, setChecking] = useState(false)

  const checkStripeStatus = useCallback(async (): Promise<StripeStatus> => {
    if (!user?.company_id) {
      throw new Error('No company found')
    }
    try {
      setChecking(true)

      const response = await fetch('/api/stripe/accounts/status', {
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

  async function connectStripe({
    reconnect = false,
    linkType = 'onboarding',
  }: ConnectStripeOptions = {}) {
    try {
      setConnecting(true)
      if (!user?.company_id || !company) {
        throw new Error('No company found')
      }

      const response = await fetch('/api/stripe/accounts/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: company.id,
          company_name: company.name,
          reconnect,
          link_type: linkType === 'update' ? 'update' : 'onboarding',
        }),
      })

      const data = await response.json()

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

  async function getAccountSession(companyId?: string): Promise<string> {
    try {
      // Use absolute URL instead of relative
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const url = `${baseUrl}/api/stripe/accounts/session`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Response error:', errorData)
        throw new Error(`Failed to get account session: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()

      if (!data.client_secret) {
        throw new Error('No client secret returned')
      }

      return data.client_secret
    } catch (err) {
      console.error('❌ Error getting account session:', {
        error: err,
        companyId,
        env: {
          hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        },
      })
      throw new Error('Failed to get account session')
    }
  }

  return {
    connectStripe,
    checkStripeStatus,
    getAccountSession,
    connecting,
    checking,
  }
}
