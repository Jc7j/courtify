'use client'

import { FormEvent, useState } from 'react'
import { Card, Button, Separator } from '@/components/ui'
import { Clock, Calendar, DollarSign } from 'lucide-react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { GuestInfo } from './GuestInfoForm'
import { useBookings } from '@/hooks/useBookings'

interface ProductDetail {
  name: string
  type: string
  price: number
  isHourly: boolean
}

interface BookingDetails {
  date: string
  time: string
  duration: number
  guestInfo: GuestInfo
  products: ProductDetail[]
}

interface GuestCheckoutFormProps {
  onSuccess: () => void
  onBack?: () => void
  amount: number
  bookingDetails: BookingDetails
}

export function GuestCheckoutForm({
  onSuccess,
  onBack,
  amount,
  bookingDetails,
}: GuestCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { confirmPaymentIntentAndBook } = useBookings()
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

      await confirmPaymentIntentAndBook()
      onSuccess()
    } catch (error) {
      console.error('Payment failed:', error)
      setPaymentError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Order Summary */}
      <Card>
        <div className="bg-primary/5 border-b p-4">
          <h3 className="text-lg font-semibold text-primary">Order Summary</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Time Details */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <p className="text-lg">{bookingDetails.date}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Time ({bookingDetails.duration} hours)</span>
              </div>
              <p className="text-lg">{bookingDetails.time}</p>
            </div>
          </div>

          <Separator />

          {/* Customer Details */}
          <div className="space-y-2">
            <h4 className="font-medium">Customer Information</h4>
            <div className="grid gap-1 text-sm">
              <p>Name: {bookingDetails.guestInfo.name}</p>
              <p>Email: {bookingDetails.guestInfo.email}</p>
              <p>Phone: {bookingDetails.guestInfo.phone}</p>
              <p>Net Height: {bookingDetails.guestInfo.net_height}</p>
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-4">
            <h4 className="font-medium">Price Breakdown</h4>

            {/* Individual Items */}
            <div className="space-y-2 text-sm">
              {bookingDetails.products.map((product) => (
                <div key={product.name} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    {product.isHourly && (
                      <span className="text-muted-foreground">
                        {' '}
                        (${(product.price / 100).toFixed(2)}/hour × {bookingDetails.duration} hours)
                      </span>
                    )}
                  </div>
                  <span>
                    $
                    {(
                      (product.isHourly ? product.price * bookingDetails.duration : product.price) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center font-medium">
              <span>Total ({bookingDetails.duration} hours)</span>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{(amount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Form */}
      <Card>
        <div className="bg-primary/5 border-b p-4">
          <h3 className="text-lg font-semibold text-primary">Payment Details</h3>
        </div>
        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
          <PaymentElement
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  name: bookingDetails.guestInfo.name,
                  email: bookingDetails.guestInfo.email,
                  phone: bookingDetails.guestInfo.phone,
                },
              },
            }}
          />

          {paymentError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {paymentError}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
              Back
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}