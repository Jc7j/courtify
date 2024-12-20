import dayjs from 'dayjs'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { EnhancedAvailability } from '@/shared/types/graphql'

interface CalendarStore {
  availabilities: EnhancedAvailability[]
  setAvailabilities: (availabilities: EnhancedAvailability[]) => void
  selectedDate: dayjs.Dayjs
  setSelectedDate: (date: dayjs.Dayjs) => void
  settings: {
    slotMinTime: string
    slotMaxTime: string
    isFullHeight: boolean
    slotDuration: string
    editMode: boolean
  }
  setSettings: (settings: Partial<CalendarStore['settings']>) => void
  selectedAvailability: EnhancedAvailability | null
  isPanelOpen: boolean
  setSelectedAvailability: (availability: EnhancedAvailability | null) => void
  setPanelOpen: (isOpen: boolean) => void
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      availabilities: [],
      setAvailabilities: (newAvailabilities) => set({ availabilities: newAvailabilities }),
      selectedDate: dayjs(),
      setSelectedDate: (date) => set({ selectedDate: date }),
      settings: {
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        isFullHeight: false,
        slotDuration: '00:30:00',
        editMode: false,
      },
      setSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),
      selectedAvailability: null,
      isPanelOpen: false,
      setSelectedAvailability: (availability) =>
        set(() => ({
          selectedAvailability: availability,
          isPanelOpen: !!availability,
        })),
      setPanelOpen: (isOpen) =>
        set((state) => ({
          isPanelOpen: isOpen,
          selectedAvailability: isOpen ? state.selectedAvailability : null,
        })),
    }),
    {
      name: 'courtify-calendar-store',
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.selectedDate = dayjs(state.selectedDate)
          state.availabilities = []
        }
      },
    }
  )
)
