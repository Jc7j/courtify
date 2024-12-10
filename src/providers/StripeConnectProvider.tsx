'use client'

import React, { useState, ReactNode, useCallback } from 'react'
import { loadConnectAndInitialize } from '@stripe/connect-js/pure'
import { ConnectComponentsProvider } from '@stripe/react-connect-js'
import { useStripe } from '@/hooks/useStripe'

interface StripeConnectProviderProps {
  children: ReactNode
  companyId: string
}

export default function StripeConnectProvider({ children, companyId }: StripeConnectProviderProps) {
  const { getAccountSession } = useStripe()

  const fetchClientSecret = useCallback(
    () => getAccountSession(companyId),
    [companyId, getAccountSession]
  )

  const [stripeConnectInstance] = useState(() => {
    return loadConnectAndInitialize({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      fetchClientSecret,
      appearance: {
        overlays: 'dialog',
        variables: {
          colorPrimary: '#625afa',
          fontFamily: 'Open Sans',
        },
      },
    })
  })

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {children}
    </ConnectComponentsProvider>
  )
}
