import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Company } from '@/shared/types/graphql'

interface CompanyState {
  company: Pick<Company, 'id' | 'name'> | null
  setCompany: (company: Pick<Company, 'id' | 'name'>) => void
  reset: () => void
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: null,

      setCompany: (company) =>
        set(() => ({
          company: {
            id: company.id,
            name: company.name,
          },
        })),

      reset: () => set({ company: null }),
    }),
    {
      name: 'courtify-company-store',
    }
  )
)
