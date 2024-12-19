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
  }
  setSettings: (settings: Partial<CalendarStore['settings']>) => void
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
      },
      setSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),
    }),
    {
      name: 'courtify-calendar-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.selectedDate = dayjs(state.selectedDate)
        }
      },
    }
  )
)
