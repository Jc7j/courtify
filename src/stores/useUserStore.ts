import { create } from 'zustand'
import type { Session } from 'next-auth'

interface UserState {
  user: Session['user'] | null
  isAuthenticated: boolean
  isLoading: boolean
  session: Session | null
  setSession: (session: Session | null) => void
  setIsLoading: (isLoading: boolean) => void
  updateUser: (userData: Partial<Session['user']>) => void
  reset: () => void
}

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
}

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false,
    }),

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
      session: state.session
        ? {
            ...state.session,
            user: { ...state.session.user, ...userData },
          }
        : null,
    })),

  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}))
