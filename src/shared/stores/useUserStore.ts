import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BaseUser, AuthSession } from '@/shared/types/auth'

interface UserState {
  user: BaseUser | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (session: AuthSession | null) => void
  setIsLoading: (isLoading: boolean) => void
  updateSessionExpiry: (expiresAt: number) => void
  updateUser: (updates: Partial<BaseUser>) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: true,

      setSession: (session) =>
        set({
          user: session?.user ?? null,
          accessToken: session?.accessToken ?? null,
          refreshToken: session?.refreshToken ?? null,
          expiresAt: session?.expiresAt ?? null,
          isAuthenticated: !!session?.user,
        }),

      setIsLoading: (isLoading) => set({ isLoading }),

      updateSessionExpiry: (expiresAt) => set({ expiresAt }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      reset: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'courtify-user-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
