import { create } from 'zustand'
import dayjs from 'dayjs'
import type { CourtAvailability } from '@/types/graphql'
import type { GuestInfo } from '@/components/booking/GuestInfoForm'

interface BookingState {
  selectedDate: Date
  weekStartDate: Date
  selectedAvailability?: CourtAvailability
  guestInfo?: GuestInfo
  setSelectedDate: (date: Date) => void
  setWeekStartDate: (date: Date) => void
  setSelectedAvailability: (availability?: CourtAvailability) => void
  setGuestInfo: (info: GuestInfo) => void
  clearSelectedAvailability: () => void
  clearGuestInfo: () => void
  resetDates: () => void
  reset: () => void
}

const initialState = {
  selectedDate: dayjs().startOf('day').toDate(),
  weekStartDate: dayjs().startOf('week').toDate(),
  selectedAvailability: undefined,
  guestInfo: undefined,
}

export const useBookingStore = create<BookingState>((set) => ({
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

  clearSelectedAvailability: () => set({ selectedAvailability: undefined }),

  clearGuestInfo: () => set({ guestInfo: undefined }),

  resetDates: () =>
    set({
      selectedDate: initialState.selectedDate,
      weekStartDate: initialState.weekStartDate,
      selectedAvailability: undefined,
    }),

  reset: () => set(initialState),
}))
