import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "../../store/themeStore"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-14 h-7 rounded-full p-0.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #223761 0%, #081122 100%)"
          : "linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%)",
      }}
    >
      <motion.div
        layout
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: isDark ? "var(--accent)" : "#fff" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={14} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={14} className="text-yellow-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  )
}
