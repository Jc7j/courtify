'use client'

import { FormEvent, useState } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import { GuestCheckoutForm } from './GuestCheckoutForm'

interface PaymentWrapperProps {
  onSuccess: () => void
  onBack: () => void
  amount: number
}

export function PaymentWrapper({ onSuccess, onBack, amount }: PaymentWrapperProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  async function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      onSuccess()
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <GuestCheckoutForm
      onSubmit={handlePaymentSubmit}
      onBack={onBack}
      isProcessing={isProcessing}
      error={paymentError}
      amount={amount}
    />
  )
}
