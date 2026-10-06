import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ThemeStore {
  theme: "light" | "dark"
  toggleTheme: () => void
  setTheme: (theme: "light" | "dark") => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light"
        document.documentElement.classList.toggle("dark", next === "dark")
        set({ theme: next })
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle("dark", theme === "dark")
        set({ theme })
      },
    }),
    {
      name: "HireHub-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle(
            "dark",
            state.theme === "dark",
          )
        }
      },
    },
  ),
)
