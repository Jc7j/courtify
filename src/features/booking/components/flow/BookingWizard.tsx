import { Elements } from '@stripe/react-stripe-js'
import dayjs from 'dayjs'
import { memo, RefObject } from 'react'

import { GuestDetails } from './GuestDetails'
import { PaymentStep } from './PaymentStep'
import { TimeSelection } from './TimeSelection'

import type { GuestDetailsType, BookingStep } from '../../types'
import type { EnhancedAvailability, FacilityProduct } from '@/shared/types/graphql'

interface BookingWizardProps {
  currentStep: BookingStep
  facilityName: string
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  weekStartDate: Date
  setWeekStartDate: (date: Date) => void
  availabilities: EnhancedAvailability[]
  products: FacilityProduct[]
  guestInfo?: GuestDetailsType
  selectedAvailability?: EnhancedAvailability
  formRef: RefObject<{ submit: () => void }>
  onGuestInfoSubmit: (data: GuestDetailsType) => Promise<void>
  paymentProps?: {
    clientSecret: string
    amount: number
    onSuccess: () => void
    onBack: () => void
    stripePromise: Promise<any>
  }
  remainingTime?: string
}

function BookingWizardComponent({
  currentStep,
  facilityName,
  selectedDate,
  setSelectedDate,
  weekStartDate,
  setWeekStartDate,
  availabilities,
  products,
  guestInfo,
  selectedAvailability,
  formRef,
  onGuestInfoSubmit,
  paymentProps,
  remainingTime,
}: BookingWizardProps) {
  return (
    <div className="flex-1 px-8 py-12 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{facilityName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentStep === 'select-time'
            ? 'Select a date to view available court times'
            : currentStep === 'guest-info'
              ? 'Enter your information'
              : 'Complete your payment'}
        </p>
      </div>

      {currentStep === 'select-time' && (
        <TimeSelection
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          weekStartDate={weekStartDate}
          setWeekStartDate={setWeekStartDate}
          availabilities={availabilities}
        />
      )}

      {currentStep === 'guest-info' && (
        <GuestDetails
          onSubmit={onGuestInfoSubmit}
          products={products}
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

      {currentStep === 'payment' && paymentProps && selectedAvailability && guestInfo && (
        <>
          <Elements
            stripe={paymentProps.stripePromise}
            options={{
              clientSecret: paymentProps.clientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <PaymentStep
              onSuccess={paymentProps.onSuccess}
              onBack={paymentProps.onBack}
              amount={paymentProps.amount}
              bookingDetails={{
                date: dayjs(selectedAvailability.start_time).format('dddd, MMMM D, YYYY'),
                time: `${dayjs(selectedAvailability.start_time).format('h:mm A')} - ${dayjs(
                  selectedAvailability.end_time
                ).format('h:mm A')}`,
                duration: dayjs(selectedAvailability.end_time).diff(
                  dayjs(selectedAvailability.start_time),
                  'hour',
                  true
                ),
                facilityId: selectedAvailability.facility_id,
                guestInfo,
              }}
            />
          </Elements>

          {remainingTime && (
            <div className="text-sm text-muted-foreground mb-4">
              Time remaining to complete payment: {remainingTime}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const BookingWizard = memo(BookingWizardComponent)
