'use client'

import { loadConnectAndInitialize } from '@stripe/connect-js/pure'
import { ConnectComponentsProvider } from '@stripe/react-connect-js'
import React, { useState, ReactNode } from 'react'

interface StripeConnectProviderProps {
  children: ReactNode
  companyId: string
}

export default function StripeConnectProvider({ children, companyId }: StripeConnectProviderProps) {
  // Only initialize when actually needed
  const [stripeConnectInstance] = useState(() => {
    // Simple synchronous function that returns a promise
    const fetchClientSecret = () =>
      fetch('/api/stripe/accounts/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      })
        .then((res) => res.json())
        .then((data) => data.client_secret)

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
