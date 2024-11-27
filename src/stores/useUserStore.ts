import { create } from 'zustand'
import type { BaseUser, AuthSession } from '@/types/auth'

interface UserState {
  user: BaseUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (session: AuthSession | null) => void
  setIsLoading: (isLoading: boolean) => void
  updateUser: (userData: Partial<BaseUser>) => void
  reset: () => void
}

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
}

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setSession: async (session) => {
    set({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false,
    })
    return Promise.resolve()
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  setIsLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}))
