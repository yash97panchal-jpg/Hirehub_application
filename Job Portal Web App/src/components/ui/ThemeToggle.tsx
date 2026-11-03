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
      className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #2D113B 0%, #4B1F64 100%)" // Deep Aubergine for Moon
          : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", // Marigold for Sun
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Moon size={20} className="text-white" fill="currentColor" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 180, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -180, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun size={20} className="text-white" fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
