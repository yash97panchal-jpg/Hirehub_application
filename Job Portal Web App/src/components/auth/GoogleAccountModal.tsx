import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, ArrowRight, UserCheck } from "lucide-react"

interface GoogleAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAccount: (account: { email: string; name: string }) => void
  mode?: "login" | "create_account"
}

interface SavedAccount {
  name: string
  email: string
  avatarLetter: string
  avatarBg: string
}

const DEFAULT_ACCOUNTS: SavedAccount[] = [
  {
    name: "Alex Johnson",
    email: "alex.johnson.dev@gmail.com",
    avatarLetter: "A",
    avatarBg: "bg-blue-600",
  },
  {
    name: "Sarah Miller",
    email: "sarah.miller.work@gmail.com",
    avatarLetter: "S",
    avatarBg: "bg-emerald-600",
  },
]

export default function GoogleAccountModal({
  isOpen,
  onClose,
  onSelectAccount,
  mode = "login",
}: GoogleAccountModalProps) {
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customEmail, setCustomEmail] = useState("")
  const [customName, setCustomName] = useState("")
  const [error, setError] = useState("")
  const [accounts, setAccounts] = useState<SavedAccount[]>(DEFAULT_ACCOUNTS)

  // Reset state and load stored accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsCustomMode(false)
      setError("")
      setCustomEmail("")
      setCustomName("")

      try {
        const stored = localStorage.getItem("hirehub_custom_google_accounts")
        if (stored) {
          const parsed: SavedAccount[] = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAccounts((prev) => {
              const emails = new Set(prev.map((a) => a.email.toLowerCase()))
              const merged = [...prev]
              for (const acc of parsed) {
                if (!emails.has(acc.email.toLowerCase())) {
                  merged.push(acc)
                  emails.add(acc.email.toLowerCase())
                }
              }
              return merged
            })
          }
        }
      } catch (err) {
        console.warn("Could not read custom accounts from storage:", err)
      }

      // Prevent background scrolling while modal is open
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleSelect = (acc: { email: string; name: string }) => {
    onSelectAccount(acc)
    onClose()
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const cleanEmail = customEmail.trim()
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid Google email address.")
      return
    }

    const name = customName.trim() || cleanEmail.split("@")[0]
    const newAcc: SavedAccount = {
      name,
      email: cleanEmail,
      avatarLetter: name.charAt(0).toUpperCase() || "G",
      avatarBg: "bg-indigo-600",
    }

    try {
      const stored = localStorage.getItem("hirehub_custom_google_accounts")
      const list: SavedAccount[] = stored ? JSON.parse(stored) : []
      if (!list.some((a) => a.email.toLowerCase() === cleanEmail.toLowerCase())) {
        list.push(newAcc)
        localStorage.setItem("hirehub_custom_google_accounts", JSON.stringify(list))
      }
    } catch (err) {
      console.warn("Could not save custom account:", err)
    }

    onSelectAccount({ email: cleanEmail, name })
    onClose()
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#1E112A] text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-5 sm:p-7 my-auto relative"
          >
            {/* Header with Google Logo */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div>
                  <h3 className="font-poppins font-bold text-base sm:text-lg leading-tight">
                    {mode === "create_account" ? "Sign up with Google" : "Sign in with Google"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose an account to continue to HireHub
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close Google sign-in modal"
              >
                <X size={18} />
              </button>
            </div>

            {!isCustomMode ? (
              <div className="space-y-3">
                {/* Account List */}
                <div className="space-y-2">
                  {accounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelect(acc)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm`}
                        >
                          {acc.avatarLetter}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {acc.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {acc.email}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>

                {/* Use Another Account Button */}
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left mt-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300 shrink-0">
                    <Plus size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Use another Google account</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sign in with your personal or work Gmail
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              /* Custom Google Email / ID Form */
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50">
                  <UserCheck size={16} className="text-blue-500 shrink-0" />
                  <span>Enter the Google email address you want to sign in with:</span>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/20 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/10 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                To continue, Google will share your name, email address, language preference, and profile picture with HireHub.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
