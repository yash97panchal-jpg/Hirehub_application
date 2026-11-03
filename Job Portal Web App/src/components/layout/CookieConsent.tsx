import { useState, useEffect } from "react"
import { ShieldCheck, Cookie, X } from "lucide-react"
import { Link } from "react-router-dom"
import Button from "../ui/Button"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("hirehub-cookie-consent")
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("hirehub-cookie-consent", "accepted")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("hirehub-cookie-consent", "declined")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl bg-opacity-95">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
            <Cookie size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
              Cookie & Privacy Notice
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
              We use essential cookies to provide secure authentication, remember preferences, and analyze platform traffic in accordance with the DPDP Act & GDPR. Read our{" "}
              <Link to="/privacy" className="text-[var(--primary)] underline hover:text-[var(--primary-hover)]">
                Privacy Policy
              </Link>.
            </p>
            <div className="flex items-center gap-2 mt-3.5">
              <Button variant="primary" size="sm" onClick={handleAccept} className="text-xs px-3 py-1.5 h-auto">
                Accept All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDecline} className="text-xs px-3 py-1.5 h-auto">
                Essential Only
              </Button>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
