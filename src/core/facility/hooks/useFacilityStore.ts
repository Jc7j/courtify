import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { FacilityState } from '../types'

export const useFacilityStore = create<FacilityState>()(
  persist(
    (set) => ({
      facility: null,

      setFacility: (facility) =>
        set(() => ({
          facility: {
            id: facility.id,
            name: facility.name,
            slug: facility.slug,
            stripe_account_id: facility.stripe_account_id,
            stripe_account_enabled: facility.stripe_account_enabled,
          },
        })),

      reset: () => set({ facility: null }),
    }),
    {
      name: 'courtify-facility-store',
    }
  )
)
