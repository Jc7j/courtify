'use client'

import { use, useEffect } from 'react'
import { CheckCircle2, Mail, Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/hooks/useCompany'
import { useGuestStore } from '@/stores/useGuestStore'
import dayjs from 'dayjs'

export default function BookingSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { company } = useCompany({ slug: resolvedParams.slug })
  const { guestInfo, selectedAvailability } = useGuestStore()

  useEffect(() => {
    return () => {
      useGuestStore.getState().clearBooking()
    }
  }, [])

  if (!company || !guestInfo || !selectedAvailability) {
    router.push(`/book/${resolvedParams.slug}`)
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary animate-in zoom-in" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight mt-8">Booking Confirmed!</h1>

          <p className="text-muted-foreground">
            Thank you for booking with {company.name}. We&apos;ve sent a confirmation email to{' '}
            <span className="font-medium text-foreground">{guestInfo.email}</span>
          </p>

          <div className="mt-8 p-6 rounded-lg border bg-card space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 text-left">
                <p className="font-medium">Booking Details</p>
                <p className="text-sm text-muted-foreground">
                  {dayjs(selectedAvailability.start_time).format('dddd, MMMM D, YYYY')}
                  <br />
                  {dayjs(selectedAvailability.start_time).format('h:mm A')} -{' '}
                  {dayjs(selectedAvailability.end_time).format('h:mm A')}
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
            <Button
              onClick={() => router.push(`/book/${resolvedParams.slug}`)}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Book Another Court
            </Button>

            <p className="text-sm text-muted-foreground">
              Questions about your booking? Contact {company.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
