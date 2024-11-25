import { create } from 'zustand'
import dayjs from 'dayjs'
import type { CourtAvailability } from '@/types/graphql'

interface BookingState {
  selectedDate: Date
  weekStartDate: Date
  selectedAvailability?: CourtAvailability
  setSelectedDate: (date: Date) => void
  setWeekStartDate: (date: Date) => void
  setSelectedAvailability: (availability?: CourtAvailability) => void
  clearSelectedAvailability: () => void
  resetDates: () => void
  reset: () => void
}

const initialState = {
  selectedDate: dayjs().startOf('day').toDate(),
  weekStartDate: dayjs().startOf('week').toDate(),
  selectedAvailability: undefined,
}

export const useBookingStore = create<BookingState>((set) => ({
  // Initial state
  ...initialState,

  // Actions
  setSelectedDate: (date: Date) =>
    set({
      selectedDate: dayjs(date).startOf('day').toDate(),
      selectedAvailability: undefined, // Clear selection when date changes
    }),

  setWeekStartDate: (date: Date) => set({ weekStartDate: dayjs(date).startOf('week').toDate() }),

  setSelectedAvailability: (availability?: CourtAvailability) =>
    set({ selectedAvailability: availability }),

  clearSelectedAvailability: () => set({ selectedAvailability: undefined }),

  resetDates: () =>
    set({
      selectedDate: initialState.selectedDate,
      weekStartDate: initialState.weekStartDate,
      selectedAvailability: undefined,
    }),

  reset: () => set(initialState),
}))
