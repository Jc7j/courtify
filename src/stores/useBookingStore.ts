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
  bookingId?: string
  currentStep: BookingStep
  isLoading: boolean
  setSelectedDate: (date: Date) => void
  setWeekStartDate: (date: Date) => void
  setSelectedAvailability: (availability?: CourtAvailability) => void
  setGuestInfo: (info: GuestInfo) => void
  setBookingId: (id: string) => void
  setCurrentStep: (step: BookingStep) => void
  setLoading: (loading: boolean) => void
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
}

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  bookingId: undefined,

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

  setBookingId: (id: string) => set({ bookingId: id }),

  setCurrentStep: (step: BookingStep) => set({ currentStep: step }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clearBooking: () =>
    set({ bookingId: undefined, guestInfo: undefined, selectedAvailability: undefined }),

  reset: () => set(initialState),
}))
