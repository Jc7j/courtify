import { create } from 'zustand'

import type { EnhancedAvailability } from '@/shared/types/graphql'

interface CalendarStore {
  availabilities: EnhancedAvailability[]
  setAvailabilities: (availabilities: EnhancedAvailability[]) => void
  settings: {
    slotMinTime: string
    slotMaxTime: string
    isFullHeight: boolean
  }
  setSettings: (settings: Partial<CalendarStore['settings']>) => void
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  availabilities: [],
  setAvailabilities: (availabilities) => set({ availabilities: availabilities || [] }),
  settings: {
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    isFullHeight: false,
  },
  setSettings: (newSettings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    })),
}))