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

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  availabilities: [],
  setAvailabilities: (newAvailabilities) => {
    const currentAvailabilities = get().availabilities
    const newAvailabilitiesStr = JSON.stringify(newAvailabilities || [])
    const currentAvailabilitiesStr = JSON.stringify(currentAvailabilities)

    if (newAvailabilitiesStr !== currentAvailabilitiesStr) {
      set({ availabilities: newAvailabilities || [] })
    }
  },
  settings: {
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
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
