import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CompanyState } from '../types'

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: null,

      setCompany: (company) =>
        set(() => ({
          company: {
            id: company.id,
            name: company.name,
            slug: company.slug,
            stripe_account_id: company.stripe_account_id,
            stripe_account_enabled: company.stripe_account_enabled,
          },
        })),

      reset: () => set({ company: null }),
    }),
    {
      name: 'courtify-company-store',
    }
  )
)
