import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "../../store/themeStore"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7941D] cursor-pointer"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #101F3E 0%, #182C58 100%)" // Deep Symbol Navy for Moon
          : "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)", // Warm Light Cream for Sun
        border: isDark
          ? "1.5px solid rgba(249, 115, 22, 0.45)"
          : "1.5px solid rgba(249, 115, 22, 0.4)",
        boxShadow: isDark
          ? "0 2px 10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(249, 115, 22, 0.15)"
          : "0 2px 10px rgba(249, 115, 22, 0.15), 0 1px 3px rgba(16, 31, 62, 0.08)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Moon size={19} className="text-[#F7941D]" fill="currentColor" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Sun size={19} className="text-[#E8820A]" fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
