import { create } from 'zustand'
import dayjs from 'dayjs'
import type { CourtAvailability } from '@/types/graphql'
import type { GuestInfo } from '@/components/booking/GuestInfoForm'

export type BookingStep = 'select-time' | 'guest-info' | 'payment'

interface BookingState {
  selectedDate: Date
  weekStartDate: Date
  selectedAvailability?: CourtAvailability
  guestInfo?: GuestInfo
  paymentIntentSecret?: string | null
  currentStep: BookingStep
  isLoading: boolean
  holdEndTime?: number
  remainingTime: string | null
  setSelectedDate: (date: Date) => void
  setWeekStartDate: (date: Date) => void
  setSelectedAvailability: (availability?: CourtAvailability) => void
  setGuestInfo: (info: GuestInfo) => void
  setPaymentIntentSecret: (secret: string) => void
  setCurrentStep: (step: BookingStep) => void
  setLoading: (loading: boolean) => void
  startHold: () => void
  clearHold: () => void
  setRemainingTime: (time: string | null) => void
  clearBooking: () => void
  reset: () => void
}

const initialState = {
  selectedDate: dayjs().startOf('day').toDate(),
  weekStartDate: dayjs().startOf('week').toDate(),
  selectedAvailability: undefined,
  guestInfo: undefined,
  currentStep: 'select-time' as BookingStep,
  isLoading: false,
  holdEndTime: undefined,
  remainingTime: null,
}

export const HOLD_DURATION_MS = 10 * 60 * 1000 // 10 minutes

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  paymentIntentSecret: undefined,

  setSelectedDate: (date: Date) =>
    set({
      selectedDate: dayjs(date).startOf('day').toDate(),
    }),

  setWeekStartDate: (date: Date) =>
    set({
      weekStartDate: dayjs(date).startOf('week').toDate(),
    }),

  setSelectedAvailability: (availability?: CourtAvailability) =>
    set({ selectedAvailability: availability }),

  setGuestInfo: (info: GuestInfo) => set({ guestInfo: info }),

  setPaymentIntentSecret: (secret: string) => set({ paymentIntentSecret: secret }),

  setCurrentStep: (step: BookingStep) => set({ currentStep: step }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  startHold: () => {
    const endTime = Date.now() + HOLD_DURATION_MS
    set({ holdEndTime: endTime })
  },

  clearHold: () => {
    set({
      holdEndTime: undefined,
      remainingTime: null,
    })
  },

  setRemainingTime: (time: string | null) => set({ remainingTime: time }),

  clearBooking: () => {
    set({
      paymentIntentSecret: undefined,
      guestInfo: undefined,
      selectedAvailability: undefined,
      holdEndTime: undefined,
      remainingTime: null,
    })
  },

  reset: () => set(initialState),
}))
