'use client'

import { notFound } from 'next/navigation'
import { useCompany } from '@/hooks/useCompany'
import { Skeleton, Card } from '@/components/ui'
import { use, useState } from 'react'
import { BookingForm } from '@/components/booking/BookingForm'
import { GuestInfoForm, type GuestInfo } from '@/components/booking/GuestInfoForm'
import { BottomBar, BottomBarContent } from '@/components/ui/bottom-bar'

type BookingStep = 'select-time' | 'guest-info' | 'payment'

interface BookingState {
  selectedTimeKey?: string
  guestInfo?: GuestInfo
}

const STEPS: Record<BookingStep, { title: string; description: string }> = {
  'select-time': {
    title: 'Select a Time',
    description: 'Choose your preferred court time',
  },
  'guest-info': {
    title: 'Guest Information',
    description: 'Please provide your details for the booking',
  },
  payment: {
    title: 'Payment',
    description: 'Complete your booking with payment',
  },
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const { company, loading, error } = useCompany({
    slug: resolvedParams.slug,
  })

  const [currentStep, setCurrentStep] = useState<BookingStep>('select-time')
  const [bookingState, setBookingState] = useState<BookingState>({})

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex flex-1 bg-secondary" />
        <div className="w-full lg:w-1/2 p-8 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    notFound()
  }

  const handleNext = () => {
    if (currentStep === 'select-time' && bookingState.selectedTimeKey) {
      setCurrentStep('guest-info')
    } else if (currentStep === 'guest-info' && bookingState.guestInfo) {
      setCurrentStep('payment')
    }
  }

  const handleBack = () => {
    if (currentStep === 'guest-info') {
      setCurrentStep('select-time')
    } else if (currentStep === 'payment') {
      setCurrentStep('guest-info')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'select-time':
        return (
          <BookingForm
            company={company}
            onTimeSelect={(timeKey) =>
              setBookingState((prev) => ({ ...prev, selectedTimeKey: timeKey }))
            }
            selectedTimeKey={bookingState.selectedTimeKey}
          />
        )
      case 'guest-info':
        return (
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{STEPS[currentStep].title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {STEPS[currentStep].description}
                </p>
              </div>
              <GuestInfoForm
                onSubmit={(data) => {
                  setBookingState((prev) => ({ ...prev, guestInfo: data }))
                  handleNext()
                }}
                defaultValues={bookingState.guestInfo}
              />
            </div>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Info */}
      <div className="hidden lg:flex lg:flex-1 bg-secondary items-center justify-center p-12 sticky top-0 h-screen">
        <div className="max-w-lg space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary-foreground text-center">
              Book Your Court at {company.name}
            </h2>
            <p className="text-secondary-foreground/80 text-center text-base leading-relaxed">
              Select your preferred court and time slot. Our easy booking system ensures a seamless
              experience for securing your next game or practice session.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Powered by Courtify. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Booking Flow */}
      <div className="w-full lg:w-1/2 min-h-screen bg-background flex flex-col">
        <BottomBarContent>
          <div className="flex-1 px-8 py-12 overflow-y-auto">{renderStep()}</div>
        </BottomBarContent>

        <BottomBar
          onNext={handleNext}
          onPrevious={currentStep !== 'select-time' ? handleBack : undefined}
          canGoNext={
            currentStep === 'select-time'
              ? Boolean(bookingState.selectedTimeKey)
              : currentStep === 'guest-info'
                ? Boolean(bookingState.guestInfo)
                : false
          }
          nextLabel={currentStep === 'guest-info' ? 'Continue to Payment' : 'Next'}
        />
      </div>
    </div>
  )
}
