'use client'

import { Card, Button, Separator } from '@/components/ui'
import { useBookingStore } from '@/stores/useBookingStore'
import dayjs from 'dayjs'
import { Clock, Calendar, DollarSign } from 'lucide-react'
import type { FormEvent } from 'react'
import { PaymentElement } from '@stripe/react-stripe-js'

interface GuestCheckoutFormProps {
  onSubmit: (e: FormEvent) => Promise<void>
  onBack?: () => void
  isProcessing: boolean
  error: string | null
  amount: number
}

export function GuestCheckoutForm({
  onSubmit,
  onBack,
  isProcessing,
  error,
  amount,
}: GuestCheckoutFormProps) {
  const { selectedAvailability, guestInfo } = useBookingStore()

  if (!selectedAvailability || !guestInfo) {
    return null
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
              <p className="text-lg">
                {dayjs(selectedAvailability.start_time).format('dddd, MMMM D, YYYY')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Time</span>
              </div>
              <p className="text-lg">
                {dayjs(selectedAvailability.start_time).format('h:mm A')} -{' '}
                {dayjs(selectedAvailability.end_time).format('h:mm A')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Details */}
          <div className="space-y-2">
            <h4 className="font-medium">Customer Information</h4>
            <div className="grid gap-1 text-sm">
              <p>{guestInfo.name}</p>
              <p>{guestInfo.email}</p>
              <p>{guestInfo.phone}</p>
              <p>Net Height: {guestInfo.net_height}</p>
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-medium">
              <span>Total</span>
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
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <PaymentElement
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  name: guestInfo.name,
                  email: guestInfo.email,
                  phone: guestInfo.phone,
                },
              },
            }}
          />

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
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
