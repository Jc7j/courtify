'use client'

import { loadStripe } from '@stripe/stripe-js'
import dayjs from 'dayjs'
import { useRouter, useParams } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'

import { useCourtAvailability } from '@/features/availability/hooks/useCourtAvailability'
import { BookingWizard } from '@/features/booking/components/flow/BookingWizard'
import { BookingSidebar } from '@/features/booking/components/layout/BookingSidebar'
import { BottomBar, BottomBarContent } from '@/features/booking/components/layout/bottom-bar'
import { Footer } from '@/features/booking/components/layout/Footer'
import { useBookings } from '@/features/booking/hooks/useBookings'
import { useBookingStore } from '@/features/booking/hooks/useBookingStore'
import { GuestDetailsType } from '@/features/booking/types'

import { useFacilityProducts } from '@/core/facility/hooks/useFacilityProducts'
import { usePublicFacility } from '@/core/facility/hooks/usePublicFacility'

import { AvailabilityStatus, EnhancedAvailability } from '@/shared/types/graphql'

function getStripePromise(accountId: string) {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: accountId,
  })
}

export default function BookingPage() {
  const params = useParams<{ slug: string }>()
  const { facility } = usePublicFacility(params.slug)
  const { products } = useFacilityProducts({ facilityId: facility?.id })
  const router = useRouter()
  const formRef = useRef<{ submit: () => void }>(null)

  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)
  const [availabilities, setAvailabilities] = useState<EnhancedAvailability[]>([])
  const today = dayjs().startOf('day').toDate()
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekStartDate, setWeekStartDate] = useState(dayjs(today).startOf('week').toDate())

  const { getAvailabilities, createPaymentIntent } = useBookings()
  const { updateAvailability } = useCourtAvailability()
  const {
    selectedAvailability,
    guestInfo,
    currentStep,
    setCurrentStep,
    paymentIntent,
    setPaymentIntent,
    setRemainingTime,
    clearHold,
    remainingTime,
    startHold,
  } = useBookingStore()

  useEffect(() => {
    async function fetchAvailabilities() {
      if (!facility?.id) return
      try {
        const { availabilities: data } = await getAvailabilities(
          facility.id,
          dayjs(weekStartDate).startOf('day').toISOString(),
          dayjs(weekStartDate).endOf('week').endOf('day').toISOString()
        )
        setAvailabilities(data)
      } catch (error) {
        console.error('Failed to fetch availabilities:', error)
      }
    }

    fetchAvailabilities()
  }, [facility?.id, weekStartDate, getAvailabilities])

  useEffect(() => {
    if (facility?.stripe_account_id) {
      setStripePromise(getStripePromise(facility.stripe_account_id))
    }
  }, [facility?.stripe_account_id])

  const handlePaymentSuccess = useCallback(() => {
    useBookingStore.getState().clearBooking()
    router.push(`/book/success`)
  }, [router])

  const handleGuestInfoSubmit = useCallback(
    async (data: GuestDetailsType) => {
      if (!facility?.id || !selectedAvailability) return

      try {
        useBookingStore.getState().setGuestInfo(data)

        const { paymentIntentId, clientSecret, amount } = await createPaymentIntent({
          facilityId: facility.id,
          courtNumber: selectedAvailability.court_number,
          startTime: selectedAvailability.start_time,
          endTime: selectedAvailability.end_time,
          guestInfo: data,
          selectedProducts: {
            courtProduct: data.selectedCourtProduct,
            equipmentProducts: data.selectedEquipment,
          },
        })

        setPaymentIntent({ paymentIntentId, clientSecret, amount })
        setCurrentStep('payment')
      } catch (error) {
        console.error('Failed to create payment intent:', error)
      }
    },
    [facility?.id, selectedAvailability, createPaymentIntent, setPaymentIntent, setCurrentStep]
  )

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
            facilityId: facility?.id || '',
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
        const endTime = useBookingStore.getState().holdEndTime
        if (!endTime) return

        const remaining = endTime - Date.now()
        if (remaining <= 0) {
          clearInterval(intervalId)
          setRemainingTime('0:00')

          updateAvailability({
            facilityId: facility?.id || '',
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

  return (
    <div className="flex min-h-screen">
      <BookingSidebar facilityName={facility?.name || ''} />
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
        <BottomBarContent>
          <div className="flex flex-col min-h-screen">
            <BookingWizard
              currentStep={currentStep}
              facilityName={facility?.name || ''}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              weekStartDate={weekStartDate}
              setWeekStartDate={setWeekStartDate}
              availabilities={availabilities}
              products={products}
              guestInfo={guestInfo}
              selectedAvailability={selectedAvailability}
              formRef={formRef}
              onGuestInfoSubmit={handleGuestInfoSubmit}
              paymentProps={
                paymentIntent && stripePromise
                  ? {
                      clientSecret: paymentIntent.clientSecret,
                      amount: paymentIntent.amount,
                      onSuccess: handlePaymentSuccess,
                      onBack: handleBack,
                      stripePromise,
                    }
                  : undefined
              }
              remainingTime={remainingTime || ''}
            />
            <Footer />
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
