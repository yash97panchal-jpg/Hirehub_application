import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 400)
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true })
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[var(--primary)] text-white shadow-xl hover:bg-[var(--primary-hover)] transition-all transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
    >
      <ArrowUp size={18} />
    </button>
  )
}
