import dayjs from 'dayjs'
import { create } from 'zustand'

import type { BookingStore, BookingState } from '../types'

const initialState: BookingState = {
  selectedDate: dayjs().startOf('day').toDate(),
  weekStartDate: dayjs().startOf('week').toDate(),
  selectedAvailability: undefined,
  guestInfo: undefined,
  currentStep: 'select-time',
  isLoading: false,
  holdEndTime: undefined,
  remainingTime: null,
  paymentIntent: undefined,
}

export const HOLD_DURATION_MS = 10 * 60 * 1000 // 10 minutes

export const useBookingStore = create<BookingStore>((set) => ({
  ...initialState,

  setSelectedDate: (date: Date) =>
    set({
      selectedDate: dayjs(date).startOf('day').toDate(),
    }),

  setWeekStartDate: (date: Date) =>
    set({
      weekStartDate: dayjs(date).startOf('week').toDate(),
    }),

  setSelectedAvailability: (availability) => set({ selectedAvailability: availability }),

  setGuestInfo: (info) => set({ guestInfo: info }),

  setPaymentIntent: (paymentIntent) => set({ paymentIntent }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setLoading: (loading) => set({ isLoading: loading }),

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

  setRemainingTime: (time) => set({ remainingTime: time }),

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
