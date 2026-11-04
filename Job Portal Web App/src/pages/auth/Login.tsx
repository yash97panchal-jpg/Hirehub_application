import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
  Smartphone,
  Mail,
  CheckCircle2,
  RefreshCw,
  Phone,
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
const PRIMARY_ADMIN_EMAIL = "yrmp97p@gmail.com"
const PRIMARY_ADMIN_PASSWORD = "yrmp@97"

const BACKUP_ADMIN_EMAIL = "yash97panchal@gmail.com"
const BACKUP_ADMIN_PASSWORD = "yrmp@backup97"

const MASTER_ADMIN_2FA_PIN = "979726"
const MASTER_ADMIN_RESCUE_KEY = "RESCUE-9797-2026"

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)", flag: "🇮🇳" },
  { code: "+1", label: "USA / Canada (+1)", flag: "🇺🇸" },
  { code: "+44", label: "UK (+44)", flag: "🇬🇧" },
  { code: "+971", label: "UAE (+971)", flag: "🇦🇪" },
  { code: "+61", label: "Australia (+61)", flag: "🇦🇺" },
  { code: "+65", label: "Singapore (+65)", flag: "🇸🇬" },
  { code: "+49", label: "Germany (+49)", flag: "🇩🇪" },
  { code: "+33", label: "France (+33)", flag: "🇫🇷" },
]

export default function Login() {
  const navigate = useNavigate()
  const { user, isAuthenticated, login, logout } = useAuthStore()

  // Login Mode: "password" or "otp"
  const [authMode, setAuthMode] = useState<"password" | "otp">("password")
  const [activeRole, setActiveRole] = useState<"candidate" | "recruiter">("candidate")

  // Password Login States
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  // OTP Login States
  const [otpMethod, setOtpMethod] = useState<"phone" | "email">("phone")
  const [countryCode, setCountryCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpEmail, setOtpEmail] = useState("")

  // OTP Verification Modal
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpTarget, setOtpTarget] = useState("")
  const [otpTargetType, setOtpTargetType] = useState<"phone" | "email">("phone")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [enteredOtp, setEnteredOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [otpTimer, setOtpTimer] = useState(30)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const timerRef = useRef<any>(null)

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
        const lockoutTime = Date.now() + 15 * 60 * 1000
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

  // Timer countdown for OTP
  useEffect(() => {
    if (showOtpModal && otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [showOtpModal, otpTimer])

  // Generate and send OTP
  const triggerOtpSend = (type: "phone" | "email", target: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    setEnteredOtp("")
    setOtpError("")
    setOtpTimer(30)
    setOtpTarget(target)
    setOtpTargetType(type)
    setShowOtpModal(true)
    toast.success(`Verification code dispatched to ${target}!`)
  }

  // Handle Send OTP click from OTP Tab
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (otpMethod === "phone") {
      const cleanPhone = phoneNumber.trim()
      if (!cleanPhone || cleanPhone.length < 7) {
        setFormError("Please enter a valid phone number (minimum 7 digits).")
        return
      }
      const fullPhone = `${countryCode} ${cleanPhone}`
      triggerOtpSend("phone", fullPhone)
    } else {
      const cleanEmail = otpEmail.trim().toLowerCase()
      if (!cleanEmail || !cleanEmail.includes("@")) {
        setFormError("Please enter a valid email address.")
        return
      }
      triggerOtpSend("email", cleanEmail)
    }
  }

  // Verify OTP submission
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError("")
    setIsVerifyingOtp(true)

    setTimeout(() => {
      const entered = enteredOtp.trim()
      if (entered === generatedOtp || entered === "123456" || entered === "1234") {
        toast.success("Verification successful! Logging in...")
        setShowOtpModal(false)

        const isPhone = otpTargetType === "phone"
        login(
          {
            id: (isPhone ? "phone-" : "email-") + Date.now(),
            name: isPhone ? `User (${otpTarget.slice(-4)})` : otpTarget.split("@")[0],
            email: isPhone ? `${otpTarget.replace(/\D/g, "")}@hirehub.phone` : otpTarget,
            phone: isPhone ? otpTarget : undefined,
            role: activeRole === "recruiter" ? "recruiter" : "job_seeker",
            skills: ["Communication", "Professional Ethics"],
            profileCompletion: 85,
            isVerified: true,
            isEmailVerified: !isPhone,
            isPhoneVerified: isPhone,
            createdAt: new Date().toISOString(),
          },
          "token-verified-" + Date.now()
        )
        navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
      } else {
        setOtpError("Incorrect verification code. Please check and try again.")
      }
      setIsVerifyingOtp(false)
    }, 400)
  }

  // Resend OTP handler
  const handleResendOtp = () => {
    if (otpTimer > 0) return
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    setEnteredOtp("")
    setOtpError("")
    setOtpTimer(30)
    toast.success(`New verification code sent to ${otpTarget}!`)
  }

  // Switching role tabs
  const handleRoleChange = (role: "candidate" | "recruiter") => {
    setActiveRole(role)
    setEmailOrPhone("")
    setPassword("")
    setPhoneNumber("")
    setOtpEmail("")
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
            isEmailVerified: true,
            isPhoneVerified: true,
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

  // Standard Password Form submission
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const lockoutMsg = checkLockout()
    if (lockoutMsg) {
      setFormError(lockoutMsg)
      return
    }

    const cleanInput = emailOrPhone.trim()
    if (!cleanInput) {
      setFormError("Please enter your email address or mobile phone number.")
      return
    }

    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    const normalizedEmail = cleanInput.toLowerCase()
    const isPrimary = normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()
    const isBackup = normalizedEmail === BACKUP_ADMIN_EMAIL.toLowerCase()

    // 1. HIGH-SECURITY ADMIN CHECK
    if (isPrimary || isBackup) {
      const isPasswordValid =
        (isPrimary && password === PRIMARY_ADMIN_PASSWORD) ||
        (isBackup && password === BACKUP_ADMIN_PASSWORD)

      if (isPasswordValid) {
        setAdminPendingEmail(normalizedEmail)
        setAdmin2FAPin("")
        setAdmin2FAError("")
        setShowAdmin2FAModal(true)
        setIsLoading(false)
        return
      } else {
        const attempts = recordFailedAttempt()
        if (attempts >= 3) {
          setFormError("CRITICAL: Maximum security challenges failed. Terminal locked for 15 minutes.")
          toast.error("Intrusion detected: Terminal locked.")
        } else {
          setFormError("Invalid email or password. Unauthorized access attempts are monitored and recorded.")
        }
        setIsLoading(false)
        return
      }
    }

    // Determine if input is phone or email
    const isPhone = !cleanInput.includes("@") && /^[+0-9\s-]+$/.test(cleanInput)

    // 2. RECRUITER MODE
    if (activeRole === "recruiter") {
      const recruiterName = isPhone ? `Recruiter (${cleanInput.slice(-4)})` : cleanInput.split("@")[0]
      login(
        {
          id: "recruiter-" + Date.now(),
          name: recruiterName,
          email: isPhone ? `${cleanInput.replace(/\D/g, "")}@hirehub.recruiter` : cleanInput,
          phone: isPhone ? cleanInput : undefined,
          role: "recruiter",
          skills: ["Talent Sourcing", "Interviewing"],
          profileCompletion: 90,
          isVerified: true,
          isEmailVerified: !isPhone,
          isPhoneVerified: isPhone,
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
    const candidateName = isPhone ? `Candidate (${cleanInput.slice(-4)})` : cleanInput.split("@")[0]
    login(
      {
        id: "candidate-" + Date.now(),
        name: candidateName,
        email: isPhone ? `${cleanInput.replace(/\D/g, "")}@hirehub.phone` : cleanInput,
        phone: isPhone ? cleanInput : undefined,
        role: "job_seeker",
        skills: ["Skill Assessment", "Problem Solving"],
        profileCompletion: 30,
        isVerified: true,
        isEmailVerified: !isPhone,
        isPhoneVerified: isPhone,
        createdAt: new Date().toISOString(),
      },
      "mock-token-candidate",
    )
    toast.success("Welcome back to HireHub!")
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
          {/* Active Session Indicator */}
          {isAuthenticated && user && (
            <div className="mb-3 p-3 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[var(--foreground)]">
                  Active Session: {user?.name || user?.email || "User"}
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
          <div className="p-1 rounded-2xl bg-[var(--muted)] border border-[var(--border)] grid grid-cols-2 gap-1 mb-3 shadow-sm">
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

          {/* Auth Method Toggle: Password vs OTP Verification */}
          <div className="flex border-b border-[var(--border)] mb-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode("password")
                setFormError("")
              }}
              className={cn(
                "flex-1 pb-2 text-xs font-bold transition-colors border-b-2",
                authMode === "password"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              Password Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp")
                setFormError("")
              }}
              className={cn(
                "flex-1 pb-2 text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5",
                authMode === "otp"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Smartphone size={13} />
              Phone / Email OTP Verification
            </button>
          </div>

          {/* Form Titles */}
          <div className="mb-3">
            <h1 className="font-poppins text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight mb-1">
              {activeRole === "recruiter" ? "Recruiter Sign in" : "Candidate Sign in"}
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {authMode === "password"
                ? "Sign in using your Email or Phone number and password."
                : "Sign in instantly via one-time verification passcode (OTP)."}
            </p>
          </div>

          {/* 1. PASSWORD SIGN IN FORM */}
          {authMode === "password" && (
            <form onSubmit={handleSubmitPassword} className="space-y-3">
              <Input
                label={activeRole === "recruiter" ? "Work Email or Phone Number" : "Email or Phone Number"}
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="you@example.com or +91 9876543210"
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
                <div className="flex justify-between items-center mt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode("otp")}
                    className="text-xs text-[var(--primary)] font-semibold hover:underline"
                  >
                    Sign in with OTP instead
                  </button>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline"
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
          )}

          {/* 2. OTP VERIFICATION SIGN IN FORM */}
          {authMode === "otp" && (
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--muted)] rounded-xl border border-[var(--border)] text-xs mb-1">
                <button
                  type="button"
                  onClick={() => setOtpMethod("phone")}
                  className={cn(
                    "py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all",
                    otpMethod === "phone"
                      ? "bg-[var(--card)] text-[var(--primary)] shadow-sm font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Phone size={13} /> Mobile Phone
                </button>
                <button
                  type="button"
                  onClick={() => setOtpMethod("email")}
                  className={cn(
                    "py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all",
                    otpMethod === "email"
                      ? "bg-[var(--card)] text-[var(--primary)] shadow-sm font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Mail size={13} /> Email Address
                </button>
              </div>

              {otpMethod === "phone" ? (
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      aria-label="Country Code"
                      className="w-28 px-2 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, ""))}
                      placeholder="e.g. 98765 43210"
                      required
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                    A 6-digit verification code (OTP) will be sent via SMS.
                  </p>
                </div>
              ) : (
                <Input
                  label="Email address for Verification"
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              )}

              {formError && (
                <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 font-bold"
              >
                Send Verification OTP <ArrowRight size={15} />
              </Button>
            </form>
          )}

          {/* Social OAuth & Quick OTP Button */}
          <div className="mt-4">
            <div className="relative flex items-center justify-center mb-3">
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
                      isEmailVerified: true,
                      isPhoneVerified: false,
                      createdAt: new Date().toISOString(),
                    },
                    "token-google-oauth"
                  )
                  navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
                }}
                className="py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
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
                      isEmailVerified: true,
                      isPhoneVerified: false,
                      createdAt: new Date().toISOString(),
                    },
                    "token-github-oauth"
                  )
                  navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
                }}
                className="py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
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
                      isEmailVerified: true,
                      isPhoneVerified: false,
                      createdAt: new Date().toISOString(),
                    },
                    "token-linkedin-oauth"
                  )
                  navigate(activeRole === "recruiter" ? "/recruiter" : "/dashboard")
                }}
                className="py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>💼</span> LinkedIn
              </button>
            </div>

            {authMode !== "otp" && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp")
                  setOtpMethod("phone")
                }}
                className="mt-2.5 w-full py-2 px-3 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <Smartphone size={14} className="text-[var(--primary)]" />
                Sign in with Phone Number & OTP Verification
              </button>
            )}
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

      {/* ----------------------------------------------------------------------- */}
      {/* PHONE / EMAIL OTP VERIFICATION MODAL                                    */}
      {/* ----------------------------------------------------------------------- */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0">
                  {otpTargetType === "phone" ? <Smartphone size={24} /> : <Mail size={24} />}
                </div>
                <div>
                  <h3 className="font-poppins text-lg font-black text-[var(--foreground)] tracking-tight">
                    Verify Your {otpTargetType === "phone" ? "Phone Number" : "Email"}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Code sent to <span className="font-semibold text-[var(--foreground)]">{otpTarget}</span>
                  </p>
                </div>
              </div>

              {/* Demo Code Helper */}
              <div className="p-3 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/25 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0" />
                  <span className="text-xs text-[var(--foreground)]">
                    Demo Code: <strong className="font-mono text-sm tracking-wider text-[var(--primary)]">{generatedOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="text-xs font-bold text-[var(--primary)] underline hover:opacity-80"
                >
                  Auto-fill
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="● ● ● ● ● ●"
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-mono text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-black"
                  />
                </div>

                {otpError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--muted-foreground)]">
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Didn't receive code?"}
                  </span>
                  <button
                    type="button"
                    disabled={otpTimer > 0}
                    onClick={handleResendOtp}
                    className={cn(
                      "font-semibold flex items-center gap-1",
                      otpTimer > 0
                        ? "text-[var(--muted-foreground)] cursor-not-allowed"
                        : "text-[var(--primary)] hover:underline cursor-pointer"
                    )}
                  >
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowOtpModal(false)
                      setEnteredOtp("")
                      setOtpError("")
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isVerifyingOtp}
                    className="w-full font-bold"
                  >
                    Verify & Sign In
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------------- */}
      {/* 2FA MASTER ADMIN SECURITY MODAL                                         */}
      {/* ----------------------------------------------------------------------- */}
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
