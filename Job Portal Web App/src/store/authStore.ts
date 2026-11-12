import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, AuthState } from "../types"
import { securityService } from "../services/securityService"

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  touchSession: () => void
  checkSessionValidity: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      sessionCreatedAt: undefined,
      lastActiveAt: undefined,

      login: (user, token) => {
        const now = Date.now()
        set({
          user,
          token,
          isAuthenticated: true,
          sessionCreatedAt: now,
          lastActiveAt: now,
        })
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionCreatedAt: undefined,
          lastActiveAt: undefined,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
          lastActiveAt: Date.now(),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      touchSession: () => set({ lastActiveAt: Date.now() }),

      checkSessionValidity: () => {
        const { sessionCreatedAt, lastActiveAt, isAuthenticated } = get()
        if (!isAuthenticated) return false

        return !securityService.isSessionExpired(sessionCreatedAt, lastActiveAt)
      },
    }),
    { name: "HireHub-auth" },
  ),
)
