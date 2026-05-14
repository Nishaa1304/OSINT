import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      login: (user, token, refreshToken) => set({ user, token, refreshToken }),

      logout: () => set({ user: null, token: null, refreshToken: null }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'osint-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
