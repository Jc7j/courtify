import dayjs from 'dayjs'
import { create } from 'zustand'

import type { GuestInfo } from '@/features/booking/components/GuestInfoForm'
import type { CourtAvailability } from '@/shared/types/graphql'

export type BookingStep = 'select-time' | 'guest-info' | 'payment'

interface GuestState {
  selectedDate: Date
  weekStartDate: Date
  selectedAvailability?: CourtAvailability
  guestInfo?: GuestInfo
  paymentIntent?: {
    clientSecret: string
    paymentIntentId: string
    amount: number
  }
  currentStep: BookingStep
  isLoading: boolean
  holdEndTime?: number
  remainingTime: string | null
  setSelectedDate: (date: Date) => void
  setWeekStartDate: (date: Date) => void
  setSelectedAvailability: (availability?: CourtAvailability) => void
  setGuestInfo: (info: GuestInfo) => void
  setPaymentIntent: (paymentIntent: {
    clientSecret: string
    paymentIntentId: string
    amount: number
  }) => void
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
  paymentIntent: undefined,
}

export const HOLD_DURATION_MS = 10 * 60 * 1000 // 10 minutes

export const useBookingStore = create<GuestState>((set) => ({
  ...initialState,

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

  setPaymentIntent: (paymentIntent: {
    clientSecret: string
    paymentIntentId: string
    amount: number
  }) => set({ paymentIntent }),

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
      paymentIntent: undefined,
      guestInfo: undefined,
      selectedAvailability: undefined,
      holdEndTime: undefined,
      remainingTime: null,
    })
  },

  reset: () => set(initialState),
}))
