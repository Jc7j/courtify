'use client'

import { loadConnectAndInitialize } from '@stripe/connect-js/pure'
import { ConnectComponentsProvider } from '@stripe/react-connect-js'
import React, { ReactNode, useMemo, useCallback } from 'react'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

interface StripeConnectProviderProps {
  children: ReactNode
}

export default function StripeConnectProvider({ children }: StripeConnectProviderProps) {
  const company = useCompanyStore((state) => state.company)

  const fetchClientSecret = useCallback(async () => {
    if (!company?.id || !company.stripe_account_id) return ''

    try {
      const response = await fetch('/api/stripe/accounts/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id }),
      })
      const data = await response.json()
      return data.client_secret || ''
    } catch (err) {
      console.error('Failed to fetch client secret:', err)
      return ''
    }
  }, [company?.id, company?.stripe_account_id])

  const stripeConnectInstance = useMemo(() => {
    if (!company?.id || !company.stripe_account_id) return null

    return loadConnectAndInitialize({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      fetchClientSecret,
      appearance: {
        variables: {
          colorPrimary: 'hsl(var(--primary))',
          colorBackground: 'hsl(var(--background))',
          colorText: 'hsl(var(--foreground))',
          colorBorder: 'hsl(var(--border))',
          fontFamily: 'var(--font-open-sans)',
          fontSizeBase: '16px',

          formBorderRadius: 'calc(var(--radius) - 2px)',
          formHighlightColorBorder: 'hsl(var(--ring))',

          buttonBorderRadius: 'calc(var(--radius) - 2px)',
          buttonPrimaryColorBackground: 'hsl(var(--primary))',
          buttonPrimaryColorText: 'hsl(var(--primary-foreground))',
        },
      },
    })
  }, [company?.id, company?.stripe_account_id, fetchClientSecret])

  if (!company?.id || !company.stripe_account_id || !stripeConnectInstance) {
    return <>{children}</>
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {children}
    </ConnectComponentsProvider>
  )
}
