'use client'

import { useState, use, useRef } from 'react'
import { notFound } from 'next/navigation'
import { useCompany } from '@/hooks/useCompany'
import { BookingForm } from '@/components/booking/BookingForm'
import { GuestInfoForm } from '@/components/booking/GuestInfoForm'
import { BottomBar, BottomBarContent } from '@/components/ui/bottom-bar'
import { useBookingStore } from '@/stores/useBookingStore'
import { useCompanyAvailabilities } from '@/hooks/useCourtAvailability'
import { useCompanyProducts } from '@/hooks/useCompanyProducts'
import type { GuestInfo } from '@/components/booking/GuestInfoForm'
import dayjs from 'dayjs'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useBookings } from '@/hooks/useBookings'
import { PaymentWrapper } from '@/components/booking/PaymentWrapper'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const {
    company,
    loading: companyLoading,
    error: companyError,
  } = useCompany({
    slug: resolvedParams.slug,
  })
  const { products } = useCompanyProducts()
  const { selectedAvailability, guestInfo, currentStep, setCurrentStep, isLoading, setLoading } =
    useBookingStore()
  const { createBookingWithIntent } = useBookings()

  const today = dayjs().startOf('day').toDate()
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekStartDate, setWeekStartDate] = useState(dayjs(today).startOf('week').toDate())
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const formRef = useRef<{ submit: () => void }>(null)

  const {
    availabilities,
    loading: availabilitiesLoading,
    error: availabilitiesError,
  } = useCompanyAvailabilities(
    dayjs(weekStartDate).startOf('day').toISOString(),
    dayjs(weekStartDate).endOf('week').endOf('day').toISOString()
  )

  const loading = companyLoading || availabilitiesLoading || isLoading
  const error = companyError || availabilitiesError

  function handlePaymentSuccess() {
    useBookingStore.getState().clearBooking()
  }

  async function handleGuestInfoSubmit(data: GuestInfo) {
    if (!company || !selectedAvailability) return

    try {
      setLoading(true)
      useBookingStore.getState().setGuestInfo(data)

      const { clientSecret } = await createBookingWithIntent({
        companyId: company.id,
        courtNumber: selectedAvailability.court_number,
        startTime: selectedAvailability.start_time,
        guestInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          net_height: data.net_height,
          selectedCourtProduct: data.selectedCourtProduct,
          selectedEquipment: data.selectedEquipment,
        },
        selectedProducts: {
          courtProductId: data.selectedCourtProduct,
          equipmentProductIds: data.selectedEquipment,
        },
      })

      setClientSecret(clientSecret)
      setCurrentStep('payment')
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (currentStep === 'select-time' && selectedAvailability) {
      setCurrentStep('guest-info')
    } else if (currentStep === 'guest-info') {
      formRef.current?.submit()
    }
  }

  const handleBack = () => {
    if (currentStep === 'guest-info') {
      setCurrentStep('select-time')
    } else if (currentStep === 'payment') {
      setCurrentStep('guest-info')
    }
  }

  function canGoNext(): boolean {
    switch (currentStep) {
      case 'select-time':
        return Boolean(selectedAvailability)
      case 'guest-info':
        return true
      case 'payment':
        return true
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md p-6 text-center space-y-2">
          <p className="text-destructive font-medium">An error occurred</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!company) {
    notFound()
  }
  console.log('guestInfo', guestInfo)
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
          <div className="flex-1 px-8 py-12 overflow-y-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep === 'select-time'
                  ? 'Select a date to view available court times'
                  : currentStep === 'guest-info'
                    ? 'Enter your information'
                    : 'Complete your payment'}
              </p>
            </div>

            {currentStep === 'select-time' && (
              <BookingForm
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                weekStartDate={weekStartDate}
                setWeekStartDate={setWeekStartDate}
                availabilities={availabilities}
              />
            )}

            {currentStep === 'guest-info' && (
              <GuestInfoForm
                onSubmit={handleGuestInfoSubmit}
                products={products}
                loading={loading}
                defaultValues={guestInfo}
                selectedTime={
                  selectedAvailability
                    ? {
                        start_time: selectedAvailability.start_time,
                        end_time: selectedAvailability.end_time,
                      }
                    : undefined
                }
                formRef={formRef}
              />
            )}

            {currentStep === 'payment' && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#6366F1',
                      colorBackground: '#ffffff',
                      colorText: '#1f2937',
                    },
                  },
                }}
              >
                <PaymentWrapper
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep('guest-info')}
                  amount={0}
                />
              </Elements>
            )}
          </div>
        </BottomBarContent>

        <BottomBar
          onNext={handleNext}
          onPrevious={currentStep !== 'select-time' ? handleBack : undefined}
          canGoNext={canGoNext()}
          nextLabel={currentStep === 'guest-info' ? 'Continue to Payment' : 'Next'}
          className={currentStep === 'payment' ? 'hidden' : undefined}
        />
      </div>
    </div>
  )
}
