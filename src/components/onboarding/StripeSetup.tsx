'use client'

import { Button } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCompany } from '@/hooks/useCompany'
import { toast } from 'sonner'

interface StripeSetupProps {
  onBack?: () => void
  onSkip: () => void
}

export function StripeSetup({ onBack, onSkip }: StripeSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { company } = useCompany()

  // Listen for messages from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return

      if (event.data?.type === 'stripe-connected') {
        setIsConnecting(false)
        // Success - move to next step
        onSkip()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSkip])

  const handleStripeConnect = async () => {
    try {
      setIsConnecting(true)

      // 1. Call our API to start Stripe Connect
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company?.id,
          companyName: company?.name,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initialize Stripe connection')
      }

      // 2. Get the Stripe OAuth URL
      const { url } = await response.json()

      // 3. Open popup window for Stripe Connect
      const popup = window.open(
        url,
        'stripe-connect',
        'width=600,height=800,status=yes,scrollbars=yes'
      )

      // 4. Check if popup was blocked
      if (!popup) {
        throw new Error('Please allow popups to connect your Stripe account')
      }

      // Note: The popup will:
      // - Complete Stripe onboarding
      // - Redirect to our success URL
      // - Our success page will:
      //   - Post message back to this window
      //   - Close itself
      // - We'll receive message in our useEffect
      // - Then move to next step
    } catch (error) {
      setIsConnecting(false)
      toast.error(error instanceof Error ? error.message : 'Failed to connect Stripe')
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Set up payments</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Connect your Stripe account to start accepting payments for court bookings.
        </p>
      </div>

      <div className="space-y-4">
        <Button size="lg" className="w-full" onClick={handleStripeConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Stripe Account'}
        </Button>

        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Set up later
          </button>
        </div>
      </div>

      {onBack && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
    </div>
  )
}
