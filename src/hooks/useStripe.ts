'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { useCompany } from './useCompany'

interface UseStripeReturn {
  connectStripe: () => Promise<{ url: string | null; error: string | null }>
  checkStripeStatus: () => Promise<{ isEnabled: boolean; error: string | null }>
  connecting: boolean
  checking: boolean
}

export function useStripe(): UseStripeReturn {
  const { user } = useUserStore()
  const { company } = useCompany()
  const [connecting, setConnecting] = useState(false)
  const [checking, setChecking] = useState(false)

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

  async function checkStripeStatus() {
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
        isEnabled: data.isEnabled,
        error: null,
      }
    } catch (err) {
      console.error('Error checking Stripe status:', err)
      return {
        isEnabled: false,
        error: err instanceof Error ? err.message : 'Failed to check Stripe status',
      }
    } finally {
      setChecking(false)
    }
  }

  return {
    connectStripe,
    checkStripeStatus,
    connecting,
    checking,
  }
}
