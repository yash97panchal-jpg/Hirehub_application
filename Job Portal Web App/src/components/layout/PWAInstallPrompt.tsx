import { useState, useEffect } from "react"
import { Download, X, Smartphone } from "lucide-react"
import Button from "../ui/Button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("hirehub-pwa-dismissed") === "true"
  })

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem("hirehub-pwa-dismissed", "true")
  }

  if (!showPrompt || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-[var(--card)] border-2 border-[var(--primary)]/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3 backdrop-blur-xl bg-opacity-95">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shrink-0 shadow-md">
          <Smartphone size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
            Install HireHub App
          </h4>
          <p className="text-[11px] text-[var(--muted-foreground)] leading-tight">
            Install on your phone or PC for instant alerts and fast access.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="primary" size="sm" onClick={handleInstall} className="text-xs px-2.5 py-1.5 h-auto">
            <Download size={13} className="mr-1" /> Install
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
