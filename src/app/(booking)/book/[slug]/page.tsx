'use client'

import { useState, use, useRef, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { useCompany } from '@/hooks/useCompany'
import { BookingForm } from '@/components/booking/BookingForm'
import { GuestInfoForm } from '@/components/booking/GuestInfoForm'
import { BottomBar, BottomBarContent } from '@/components/ui/bottom-bar'
import { useGuestStore } from '@/stores/useGuestStore'
import { useCompanyAvailabilities, useCourtAvailability } from '@/hooks/useCourtAvailability'
import { useCompanyProducts } from '@/hooks/useCompanyProducts'
import type { GuestInfo } from '@/components/booking/GuestInfoForm'
import dayjs from 'dayjs'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useBookings } from '@/hooks/useBookings'
import { GuestCheckoutForm } from '@/components/booking/GuestCheckoutForm'
import { CompanyProduct, AvailabilityStatus } from '@/types/graphql'

function getStripePromise(accountId: string) {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: accountId,
  })
}

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
  const {
    selectedAvailability,
    guestInfo,
    currentStep,
    setCurrentStep,
    isLoading,
    setLoading,
    paymentIntent,
    setPaymentIntent,
    setRemainingTime,
    clearHold,
    remainingTime,
    startHold,
  } = useGuestStore()
  const { createPaymentIntent } = useBookings()
  const { updateAvailability } = useCourtAvailability()
  const router = useRouter()

  const today = dayjs().startOf('day').toDate()
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekStartDate, setWeekStartDate] = useState(dayjs(today).startOf('week').toDate())
  const formRef = useRef<{ submit: () => void }>(null)
  const [amount, setAmount] = useState<number>(0)
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)

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

  useEffect(() => {
    if (company?.stripe_account_id) {
      const promise = getStripePromise(company.stripe_account_id)

      setStripePromise(promise)
    }
  }, [company?.stripe_account_id])

  function handlePaymentSuccess() {
    useGuestStore.getState().clearBooking()
    router.push(`/book/success`)
  }

  async function handleGuestInfoSubmit(data: GuestInfo) {
    if (!company || !selectedAvailability) return

    try {
      setLoading(true)
      useGuestStore.getState().setGuestInfo(data)

      const { paymentIntentId, clientSecret, amount } = await createPaymentIntent({
        companyId: company.id,
        courtNumber: selectedAvailability.court_number,
        startTime: selectedAvailability.start_time,
        endTime: selectedAvailability.end_time,
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
      setPaymentIntent({ clientSecret, paymentIntentId, amount })
      setAmount(amount)
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

  async function handleBack() {
    if (currentStep === 'payment') {
      if (selectedAvailability) {
        try {
          await updateAvailability({
            courtNumber: selectedAvailability.court_number,
            startTime: selectedAvailability.start_time,
            update: { status: AvailabilityStatus.Available },
          })
          clearHold()
        } catch (error) {
          console.error('Failed to release hold:', error)
        }
      }
      setCurrentStep('guest-info')
    } else if (currentStep === 'guest-info') {
      setCurrentStep('select-time')
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

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>

    if (currentStep === 'payment' && selectedAvailability) {
      startHold()

      intervalId = setInterval(() => {
        const endTime = useGuestStore.getState().holdEndTime
        if (!endTime) return

        const remaining = endTime - Date.now()
        if (remaining <= 0) {
          clearInterval(intervalId)
          setRemainingTime('0:00')

          updateAvailability({
            courtNumber: selectedAvailability.court_number,
            startTime: selectedAvailability.start_time,
            update: { status: AvailabilityStatus.Available },
          }).catch(console.error)

          setCurrentStep('select-time')
          return
        }

        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }, 1000)
    }

    return () => {
      clearInterval(intervalId)
      if (currentStep === 'payment') {
        clearHold()
      }
    }
  }, [currentStep, selectedAvailability, setRemainingTime, setCurrentStep, startHold, clearHold])

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
              Select your preferred court and time slot.
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

            {currentStep === 'payment' &&
              paymentIntent?.clientSecret &&
              company?.stripe_account_id &&
              stripePromise && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: paymentIntent?.clientSecret,
                    appearance: { theme: 'stripe' },
                  }}
                >
                  <GuestCheckoutForm
                    onSuccess={handlePaymentSuccess}
                    onBack={handleBack}
                    amount={amount}
                    bookingDetails={{
                      date: dayjs(selectedAvailability?.start_time).format('dddd, MMMM D, YYYY'),
                      time: `${dayjs(selectedAvailability?.start_time).format('h:mm A')} - ${dayjs(
                        selectedAvailability?.end_time
                      ).format('h:mm A')}`,
                      duration: dayjs(selectedAvailability?.end_time).diff(
                        dayjs(selectedAvailability?.start_time),
                        'hour',
                        true
                      ),
                      companyId: company.id,
                      guestInfo: guestInfo!,
                      products: products
                        .filter((p: CompanyProduct) =>
                          [
                            guestInfo?.selectedCourtProduct,
                            ...(guestInfo?.selectedEquipment || []),
                          ].includes(p.id)
                        )
                        .map((p: CompanyProduct) => ({
                          name: p.name,
                          type: p.type,
                          price: p.price_amount,
                          isHourly: p.type === 'court_rental',
                        })),
                    }}
                  />
                </Elements>
              )}

            {currentStep === 'payment' && remainingTime && (
              <div className="text-sm text-muted-foreground mb-4">
                Time remaining to complete payment: {remainingTime}
              </div>
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
