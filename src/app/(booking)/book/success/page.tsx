'use client'

import { CheckCircle2, Mail, Calendar } from 'lucide-react'

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary animate-in zoom-in" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight mt-8">Booking Confirmed!</h1>

          <p className="text-muted-foreground">
            Thank you for your booking. We&apos;ve sent a confirmation email to your provided email
            address.
          </p>

          <div className="mt-8 p-6 rounded-lg border bg-card space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 text-left">
                <p className="font-medium">Booking Details</p>
                <p className="text-sm text-muted-foreground">
                  Your booking details have been sent to your email
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 text-left">
                <p className="font-medium">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent your booking details and receipt to your email address. Please
                  check your inbox (and spam folder, just in case).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <p className="text-sm text-muted-foreground">
              Questions about your booking? Contact the facility
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
