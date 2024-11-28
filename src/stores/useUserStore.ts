import { create } from 'zustand'
import type { BaseUser, AuthSession } from '@/types/auth'

interface UserState {
  user: BaseUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (session: AuthSession | null) => Promise<void>
  setIsLoading: (isLoading: boolean) => void
  updateUser: (userData: Partial<BaseUser>) => void
  reset: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: async (session) => {
    set({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: !!session?.user,
    })
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  setIsLoading: (isLoading) => set({ isLoading }),

  reset: async () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },
}))
