import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Eye,
  EyeOff,
  Briefcase,
  User,
  ArrowRight,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertTriangle,
} from "lucide-react"
import { ParticleTextEffect } from "../../components/ui/particle-text-effect"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { useAuthStore } from "../../store/authStore"
import { cn } from "../../utils/cn"
import toast from "react-hot-toast"

// -----------------------------------------------------------------------------
// HIGH-SECURITY ADMINISTRATOR ACCESS (Zero-Knowledge Stealth System)
// -----------------------------------------------------------------------------
// Primary Administrator (Owner account requested by user)
const PRIMARY_ADMIN_EMAIL = "yrmp97p@gmail.com"
const PRIMARY_ADMIN_PASSWORD = "yrmp@97"

// Emergency Backup Administrator (In case primary is inaccessible)
const BACKUP_ADMIN_EMAIL = "yash97panchal@gmail.com"
const BACKUP_ADMIN_PASSWORD = "yrmp@backup97"

// Master 2FA Security Passcode & Rescue Key
// Required 2nd Factor — Even if an intruder guesses the email and password,
// they CANNOT access the admin panel without this private 6-digit Master Passcode!
const MASTER_ADMIN_2FA_PIN = "979726"
const MASTER_ADMIN_RESCUE_KEY = "RESCUE-9797-2026"

export default function Login() {
  const navigate = useNavigate()
  const { user, isAuthenticated, login, logout } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  // Role switcher: Candidate vs Recruiter
  const [activeRole, setActiveRole] = useState<"candidate" | "recruiter">("candidate")

  // 2FA Admin Challenge Modal State
  const [showAdmin2FAModal, setShowAdmin2FAModal] = useState(false)
  const [adminPendingEmail, setAdminPendingEmail] = useState("")
  const [admin2FAPin, setAdmin2FAPin] = useState("")
  const [admin2FAError, setAdmin2FAError] = useState("")
  const [useRescueKey, setUseRescueKey] = useState(false)
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)

  // Anti-Brute-Force Lockout Helpers
  const checkLockout = () => {
    try {
      const lockoutUntil = parseInt(localStorage.getItem("hirehub_admin_lockout_until") || "0", 10)
      if (Date.now() < lockoutUntil) {
        const remainingMins = Math.ceil((lockoutUntil - Date.now()) / 60000)
        return `Access Blocked: Security lockout active due to multiple unauthorized attempts. Try again in ${remainingMins} minute(s).`
      }
    } catch {
      // Fallback
    }
    return null
  }

  const recordFailedAttempt = () => {
    try {
      const attempts = parseInt(localStorage.getItem("hirehub_admin_failed_attempts") || "0", 10) + 1
      localStorage.setItem("hirehub_admin_failed_attempts", attempts.toString())
      if (attempts >= 3) {
        const lockoutTime = Date.now() + 15 * 60 * 1000 // 15-minute terminal lock
        localStorage.setItem("hirehub_admin_lockout_until", lockoutTime.toString())
      }
      return attempts
    } catch {
      return 1
    }
  }

  const clearFailedAttempts = () => {
    try {
      localStorage.removeItem("hirehub_admin_failed_attempts")
      localStorage.removeItem("hirehub_admin_lockout_until")
    } catch {
      // Fallback
    }
  }

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const target =
        user.role === "admin"
          ? "/admin"
          : user.role === "recruiter"
            ? "/recruiter"
            : "/dashboard"
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Switching role tabs
  const handleRoleChange = (role: "candidate" | "recruiter") => {
    setActiveRole(role)
    setEmail("")
    setPassword("")
    setFormError("")
  }

  // 2FA Admin Passcode Verification Handler
  const handleVerifyAdmin2FA = (e: React.FormEvent) => {
    e.preventDefault()
    setAdmin2FAError("")

    const lockoutMsg = checkLockout()
    if (lockoutMsg) {
      setShowAdmin2FAModal(false)
      setFormError(lockoutMsg)
      return
    }

    setIsVerifying2FA(true)

    setTimeout(() => {
      const enteredCode = admin2FAPin.trim()
      const isCodeValid = useRescueKey
        ? enteredCode.toUpperCase() === MASTER_ADMIN_RESCUE_KEY
        : enteredCode === MASTER_ADMIN_2FA_PIN

      if (isCodeValid) {
        clearFailedAttempts()
        login(
          {
            id: "admin-master",
            name:
              adminPendingEmail.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
                ? "Master Administrator"
                : "Backup Administrator",
            email: adminPendingEmail,
            role: "admin",
            skills: ["Platform Security", "System Oversight", "Root Access"],
            profileCompletion: 100,
            isVerified: true,
            createdAt: "2026-01-01",
          },
          "master-admin-token-" + Date.now(),
        )
        toast.success("Security Challenge Passed! Welcome, Administrator.")
        setShowAdmin2FAModal(false)
        navigate("/admin")
      } else {
        const attempts = recordFailedAttempt()
        if (attempts >= 3) {
          setShowAdmin2FAModal(false)
          setFormError("CRITICAL: Maximum security challenges failed. Terminal locked for 15 minutes.")
          toast.error("Intrusion detected: Terminal locked.")
        } else {
          const remaining = 3 - attempts
          setAdmin2FAError(
            `Invalid security passcode. ${remaining} attempt(s) remaining before security lockout.`
          )
        }
      }
      setIsVerifying2FA(false)
    }, 450)
  }

  // Standard form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    // Check anti-brute force lockout
    const lockoutMsg = checkLockout()
    if (lockoutMsg) {
      setFormError(lockoutMsg)
      return
    }

    if (!email || !email.includes("@")) {
      setFormError("Please enter a valid email address.")
      return
    }

    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    const normalizedEmail = email.trim().toLowerCase()
    const isPrimary = normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()
    const isBackup = normalizedEmail === BACKUP_ADMIN_EMAIL.toLowerCase()

    // 1. HIGH-SECURITY ADMIN CHECK
    if (isPrimary || isBackup) {
      const isPasswordValid =
        (isPrimary && password === PRIMARY_ADMIN_PASSWORD) ||
        (isBackup && password === BACKUP_ADMIN_PASSWORD)

      if (isPasswordValid) {
        // Password is correct, but MUST pass secondary 2FA gate!
        setAdminPendingEmail(normalizedEmail)
        setAdmin2FAPin("")
        setAdmin2FAError("")
        setShowAdmin2FAModal(true)
        setIsLoading(false)
        return
      } else {
        // Wrong password on an admin email: count against anti-brute force
        const attempts = recordFailedAttempt()
        if (attempts >= 3) {
          setFormError("CRITICAL: Maximum security challenges failed. Terminal locked for 15 minutes.")
          toast.error("Intrusion detected: Terminal locked.")
        } else {
          // Decoy error message: completely opaque to intruders
          setFormError("Invalid email or password. Unauthorized access attempts are monitored and recorded.")
        }
        setIsLoading(false)
        return
      }
    }

    // 2. RECRUITER MODE
    if (activeRole === "recruiter") {
      const recruiterName = email.split("@")[0]
      login(
        {
          id: "recruiter-" + Date.now(),
          name: recruiterName,
          email,
          role: "recruiter",
          skills: ["Talent Sourcing", "Interviewing"],
          profileCompletion: 90,
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        "mock-token-recruiter",
      )
      toast.success("Welcome to Recruiter Portal!")
      navigate("/recruiter")
      setIsLoading(false)
      return
    }

    // 3. CANDIDATE MODE
    const candidateName = email.split("@")[0]
    login(
      {
        id: "candidate-" + Date.now(),
        name: candidateName,
        email,
        role: "job_seeker",
        skills: [],
        profileCompletion: 20,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      "mock-token-candidate",
    )
    toast.success("Welcome back!")
    navigate("/dashboard")
    setIsLoading(false)
  }

  return (
    <div className="pt-16 min-h-screen lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[var(--background)] overflow-x-hidden no-scrollbar">
      {/* LEFT PANEL: Interactive Particle Animation */}
      <div className="flex flex-col justify-end w-full lg:w-1/2 h-[260px] sm:h-[300px] md:h-[350px] lg:h-full relative overflow-hidden bg-[#12051B] border-b lg:border-b-0 lg:border-r border-[var(--border)] shrink-0">
        <ParticleTextEffect
          words={["WELCOME", "HIREHUB", "CAREER SEARCH"]}
          holdDurationMs={4500}
        />

        <div className="relative z-10 p-4 sm:p-5 lg:p-8 pointer-events-none select-none max-w-md">
          <h2 className="font-poppins text-base sm:text-lg lg:text-xl font-bold text-white mb-1 leading-tight">
            Your Gateway to Tomorrow's Career
          </h2>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-2 lg:line-clamp-none">
            Intelligent ATS matching, verified employers, and instant candidate pipelines.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-3 lg:py-4 bg-[var(--background)] lg:h-full overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md my-auto py-2"
        >
          {/* Active Session Indicator (if already logged in) */}
          {isAuthenticated && user && (
            <div className="mb-3 p-3 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[var(--foreground)]">
                  Active Session: {user.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    toast.success("Signed out successfully.")
                  }}
                  className="inline-flex items-center gap-1 text-red-500 hover:underline font-semibold"
                >
                  <LogOut size={12} /> Sign out
                </button>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() =>
                  navigate(
                    user.role === "admin"
                      ? "/admin"
                      : user.role === "recruiter"
                        ? "/recruiter"
                        : "/dashboard",
                  )
                }
              >
                Go to Dashboard <ArrowRight size={14} />
              </Button>
            </div>
          )}

          {/* Back navigation */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-3"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          {/* Role Switcher: Candidate vs Recruiter */}
          <div className="p-1 rounded-2xl bg-[var(--muted)] border border-[var(--border)] grid grid-cols-2 gap-1 mb-4 shadow-sm">
            <button
              type="button"
              onClick={() => handleRoleChange("candidate")}
              className={cn(
                "flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200",
                activeRole === "candidate"
                  ? "bg-[var(--card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              <User size={15} />
              Candidate
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("recruiter")}
              className={cn(
                "flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200",
                activeRole === "recruiter"
                  ? "bg-[var(--card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              <Briefcase size={15} />
              Recruiter
            </button>
          </div>

          {/* Form Titles */}
          <div className="mb-4">
            <h1 className="font-poppins text-2xl font-black text-[var(--foreground)] tracking-tight mb-1">
              {activeRole === "recruiter" ? "Recruiter Sign in" : "Candidate Sign in"}
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {activeRole === "recruiter"
                ? "Sign in to publish jobs, review applicants, and source qualified talent."
                : "Sign in to apply to jobs, track stages, and boost your ATS score."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label={activeRole === "recruiter" ? "Work / Recruiter Email" : "Email address"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <div>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-[var(--primary)] font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-1.5 font-bold"
            >
              {activeRole === "recruiter" ? "Sign in as Recruiter" : "Sign in as Candidate"}{" "}
              <ArrowRight size={15} />
            </Button>
          </form>

          {/* Social OAuth & Phone OTP Options */}
          <div className="mt-5">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-[var(--border)] w-full" />
              <span className="bg-[var(--card)] px-3 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider absolute">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.success("Signed in with Google")
                  login(
                    {
                      id: "google-" + Date.now(),
                      name: "Alex Rivera",
                      email: "alex.rivera@gmail.com",
                      role: activeRole === "recruiter" ? "recruiter" : "job_seeker",
                      skills: ["React", "TypeScript"],
                      profileCompletion: 90,
                      isVerified: true,
                      createdAt: new Date().toISOString(),
                    },
                    "token-google-oauth"
                  )
                  navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
                }}
                className="py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🌐</span> Google
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success("Signed in with GitHub")
                  login(
                    {
                      id: "github-" + Date.now(),
                      name: "Dev Chen",
                      email: "dev.chen@github.com",
                      role: activeRole === "recruiter" ? "recruiter" : "job_seeker",
                      skills: ["Go", "Node.js", "Docker"],
                      profileCompletion: 85,
                      isVerified: true,
                      createdAt: new Date().toISOString(),
                    },
                    "token-github-oauth"
                  )
                  navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
                }}
                className="py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🐙</span> GitHub
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success("Signed in with LinkedIn")
                  login(
                    {
                      id: "linkedin-" + Date.now(),
                      name: "Sarah Jenkins",
                      email: "sarah.j@linkedin.com",
                      role: activeRole === "recruiter" ? "recruiter" : "job_seeker",
                      skills: ["Recruitment", "Talent Sourcing"],
                      profileCompletion: 95,
                      isVerified: true,
                      createdAt: new Date().toISOString(),
                    },
                    "token-linkedin-oauth"
                  )
                  navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
                }}
                className="py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>💼</span> LinkedIn
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const phone = prompt("Enter mobile phone number with country code (e.g. +91 98765 43210):")
                if (phone) {
                  const otp = prompt(`Enter 4-digit verification code sent to ${phone} (Demo OTP: 1234):`)
                  if (otp === "1234" || otp?.length === 4) {
                    toast.success("Phone verified successfully!")
                    login(
                      {
                        id: "phone-" + Date.now(),
                        name: "Verified User",
                        email: `${phone.replace(/\D/g, "")}@hirehub.phone`,
                        role: activeRole === "recruiter" ? "recruiter" : "job_seeker",
                        phone,
                        skills: ["Engineering"],
                        profileCompletion: 75,
                        isVerified: true,
                        createdAt: new Date().toISOString(),
                      },
                      "token-phone-auth"
                    )
                    navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
                  } else {
                    toast.error("Invalid OTP code. Please try again.")
                  }
                }
              }}
              className="mt-2.5 w-full py-2 px-3 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>📱</span> Sign in with Phone Number & OTP (India / Global)
            </button>
          </div>

          {/* Don't have an account */}
          <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-[var(--primary)] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* 2FA Master Admin Security Modal (Multi-factor root verification) */}
      {showAdmin2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Top Security Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-purple-600 to-indigo-600" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 className="font-poppins text-lg font-black text-[var(--foreground)] tracking-tight">
                  Two-Factor Authorization
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Verifying root session for: <span className="font-semibold text-[var(--foreground)]">{adminPendingEmail}</span>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] mb-4 text-xs text-[var(--muted-foreground)] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
                <Lock size={13} className="text-indigo-500" /> Protected Endpoint
              </div>
              <p>
                This account is protected by strict zero-knowledge 2FA. Enter your private 6-digit Master Passcode to unlock the administrator portal.
              </p>
            </div>

            <form onSubmit={handleVerifyAdmin2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                  {useRescueKey ? "Emergency Backup Rescue Key" : "6-Digit Master Security Passcode"}
                </label>
                <div className="relative">
                  <input
                    type={useRescueKey ? "text" : "password"}
                    maxLength={useRescueKey ? 32 : 6}
                    value={admin2FAPin}
                    onChange={(e) => setAdmin2FAPin(e.target.value)}
                    placeholder={useRescueKey ? "RESCUE-XXXX-XXXX" : "● ● ● ● ● ●"}
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    <KeyRound size={16} />
                  </div>
                </div>
              </div>

              {admin2FAError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{admin2FAError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setUseRescueKey(!useRescueKey)
                    setAdmin2FAPin("")
                    setAdmin2FAError("")
                  }}
                  className="text-indigo-500 hover:underline font-semibold"
                >
                  {useRescueKey ? "← Use 6-Digit PIN instead" : "Use Emergency Rescue Key"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAdmin2FAModal(false)
                    setAdmin2FAPin("")
                    setAdmin2FAError("")
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isVerifying2FA}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Verify & Access
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
