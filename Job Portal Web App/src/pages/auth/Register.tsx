import React, { useState, useEffect, useRef } from "react"
import { ParticleTextEffect } from "../../components/ui/particle-text-effect"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Mail,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  LogOut,
} from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import GoogleAccountModal from "../../components/auth/GoogleAccountModal"
import { useAuthStore } from "../../store/authStore"
import { authService, companyService } from "../../lib/supabase"
import { cn } from "../../utils/cn"
import toast from "react-hot-toast"
import type { UserRole, User as UserType } from "../../types"

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    companyName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const { login, user, isAuthenticated, logout } = useAuthStore()
  const [role, setRole] = useState<UserRole>("job_seeker")
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [serverError, setServerError] = useState("")

  // Verification step state
  const [step, setStep] = useState<"form" | "verify">("form")
  const [pendingData, setPendingData] = useState<FormData | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [verifyError, setVerifyError] = useState("")
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Timer countdown for resending verification code
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (step === "verify" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [step, resendTimer])

  // Generate 6-digit verification code and advance to verification step
  const onSubmit = (data: FormData) => {
    setServerError("")
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
    setVerificationCode(randomCode)
    setPendingData(data)
    setDigits(["", "", "", "", "", ""])
    setVerifyError("")
    setResendTimer(30)
    setStep("verify")
    toast.success(`Verification code sent to ${data.email}!`)
  }

  // Handle individual digit input
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "")
    if (!clean) {
      const nextDigits = [...digits]
      nextDigits[index] = ""
      setDigits(nextDigits)
      return
    }

    // If user pasted multi-digit string
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("")
      const nextDigits = [...digits]
      pasted.forEach((d, i) => {
        if (i < 6) nextDigits[i] = d
      })
      setDigits(nextDigits)
      const focusIndex = Math.min(pasted.length, 5)
      inputRefs.current[focusIndex]?.focus()
      return
    }

    const nextDigits = [...digits]
    nextDigits[index] = clean.slice(-1)
    setDigits(nextDigits)
    setVerifyError("")

    // Move to next input if available
    if (index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResendCode = () => {
    if (resendTimer > 0) return
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    setVerificationCode(newCode)
    setResendTimer(30)
    setVerifyError("")
    toast.success(`New verification code sent!`)
  }

  const handleAutoFill = () => {
    if (verificationCode) {
      setDigits(verificationCode.split(""))
      setVerifyError("")
      toast.success("Code auto-filled!")
    }
  }

  // Confirm verification code and complete account registration
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError("")

    const enteredCode = digits.join("")
    if (enteredCode.length < 6) {
      setVerifyError("Please enter the complete 6-digit verification code.")
      return
    }

    if (enteredCode !== verificationCode) {
      setVerifyError("Invalid verification code. Please check the code and try again.")
      return
    }

    if (!pendingData) return

    setIsLoading(true)
    try {
      const res = await authService.signUp(
        pendingData.email.trim(),
        pendingData.password,
        pendingData.name.trim(),
        role === "recruiter" ? "recruiter" : "job_seeker",
      )

      if (res?.user) {
        // If recruiter provided a company name, auto create pending company
        if (role === "recruiter" && pendingData.companyName?.trim()) {
          try {
            await companyService.createCompany(
              {
                name: pendingData.companyName.trim(),
                slug: pendingData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                description: "Leading provider of innovative solutions.",
                industry: "Technology",
                size: "10-50",
                location: "Remote / Hybrid",
                rating: 5.0,
                reviewCount: 0,
              },
              res.user.id,
            )
          } catch (compErr) {
            console.warn("Could not auto-create company on register:", compErr)
          }
        }

        login(res.user as UserType, (res as any).session?.access_token || "auth-token-" + Date.now())
        toast.success("Email verified successfully! Welcome to HireHub.")
        navigate(role === "recruiter" ? "/recruiter" : "/dashboard")
      } else {
        toast.success("Account created! Please log in with your credentials.")
        navigate("/login")
      }
    } catch (err: any) {
      console.error("Account creation error:", err)
      setVerifyError(err.message || "Failed to finalize account creation.")
      toast.error(err.message || "Registration failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAccountSelect = async (account: { email: string; name: string }) => {
    setIsGoogleLoading(true)
    try {
      const res = await authService.signInWithGoogle(account)
      if (res && "user" in res && res.user) {
        login(res.user as any, (res as any).session?.access_token || "google-token")
        toast.success(`Welcome to HireHub, ${account.name || account.email}!`)
        navigate(role === "recruiter" ? "/recruiter" : "/dashboard")
      }
    } catch (err: any) {
      console.error("Google account creation error:", err)
      toast.error(err.message || "Failed to create account with Google.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[var(--background)] w-full max-w-full overflow-x-hidden no-scrollbar">
      {/* Google Account Picker Modal */}
      <GoogleAccountModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        mode="create_account"
        onSelectAccount={handleGoogleAccountSelect}
      />

      {/* Left panel with Particle Text Effect */}
      <div className="flex flex-col justify-end w-full lg:w-1/2 h-[240px] sm:h-[280px] md:h-[320px] lg:h-full relative overflow-hidden bg-[#12051B] border-b lg:border-b-0 lg:border-r border-[var(--border)] shrink-0">
        <ParticleTextEffect words={["WELCOME", "HIREHUB", "JOIN NOW"]} holdDurationMs={4500} />

        <div className="relative z-10 p-4 sm:p-5 lg:p-8 pointer-events-none select-none max-w-md">
          <h2 className="font-poppins text-base sm:text-lg lg:text-xl font-bold text-white mb-1 leading-tight">
            Start Your Career Journey Today
          </h2>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2 lg:line-clamp-none">
            Join verified professionals and top companies with real server-side authentication and RLS security.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["ATS Score Checker", "AI Matching", "Verified Employers", "Direct ATS Apply"].map((item) => (
              <span
                key={item}
                className="px-2 py-0.5 rounded-lg bg-white/10 backdrop-blur-md text-white/90 text-[11px] sm:text-xs font-medium border border-white/10"
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-4 lg:py-6 bg-[var(--background)] lg:h-full overflow-y-auto no-scrollbar w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md my-auto py-2"
        >
          {step === "form" ? (
            /* STEP 1: ACCOUNT DETAILS FORM */
            <>
              {/* Active Session Indicator */}
              {isAuthenticated && user && (
                <div className="mb-4 p-3 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[var(--foreground)] truncate max-w-[200px]">
                      Active Session: {user?.name || user?.email || "User"} ({user.role})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        toast.success("Logged out successfully.")
                      }}
                      className="inline-flex items-center gap-1 text-red-500 hover:underline font-semibold shrink-0"
                    >
                      <LogOut size={12} /> Log Out
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
                to={
                  isAuthenticated && user
                    ? user.role === "admin"
                      ? "/admin"
                      : user.role === "recruiter"
                        ? "/recruiter"
                        : "/dashboard"
                    : "/"
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-3"
              >
                <ArrowLeft size={14} /> {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
              </Link>

              {/* Role selector */}
              <div className="p-1 rounded-2xl bg-[var(--muted)] border border-[var(--border)] grid grid-cols-2 gap-1 mb-3.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setRole("job_seeker")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                    role === "job_seeker"
                      ? "bg-[var(--card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  )}
                >
                  <User size={15} />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                    role === "recruiter"
                      ? "bg-[var(--card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  )}
                >
                  <Building2 size={15} />
                  Recruiter
                </button>
              </div>

              <div className="mb-3.5">
                <h1 className="font-poppins text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight mb-1">
                  {role === "recruiter" ? "Create Recruiter Account" : "Create Candidate Account"}
                </h1>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {role === "recruiter"
                    ? "Post jobs, screen applicants, and manage your company presence."
                    : "Apply for roles directly or through verified company ATS links."}
                </p>
              </div>

              {/* Google Create Account Button */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={() => setShowGoogleModal(true)}
                className="w-full py-2.5 px-4 mb-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-xs sm:text-sm font-semibold text-[var(--foreground)] flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                {isGoogleLoading ? "Connecting to Google..." : "Create Account with Google"}
              </button>

              <div className="relative flex items-center justify-center mb-3.5">
                <div className="border-t border-[var(--border)] w-full" />
                <span className="bg-[var(--background)] px-3 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider absolute">
                  Or register with email
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Input
                  label="Full Name"
                  placeholder="e.g. Sarah Connor"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Input
                  label={role === "recruiter" ? "Work Email Address" : "Email Address"}
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                {role === "recruiter" && (
                  <Input
                    label="Company / Organization Name"
                    placeholder="e.g. Acme Corporation"
                    error={errors.companyName?.message}
                    {...register("companyName")}
                  />
                )}

                <Input
                  label="Password"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 8 characters"
                  error={errors.password?.message}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  {...register("password")}
                />

                <Input
                  label="Confirm Password"
                  type={showPw ? "text" : "password"}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />

                {serverError && (
                  <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                    {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-2 font-bold"
                >
                  Create Account <ArrowRight size={15} />
                </Button>
              </form>

              <p className="text-center text-xs text-[var(--muted-foreground)] mt-3.5">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-[var(--primary)] hover:underline font-semibold">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[var(--primary)] hover:underline font-semibold">
                  Privacy Policy
                </Link>
                .
              </p>

              <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-[var(--primary)] hover:underline">
                  Log In
                </Link>
              </p>
            </>
          ) : (
            /* STEP 2: EMAIL VERIFICATION CODE SCREEN */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
              >
                <ArrowLeft size={14} /> Change Email / Edit Info
              </button>

              <div className="text-center pt-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center mb-3 shadow-sm">
                  <Mail size={28} />
                </div>
                <h2 className="font-poppins text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                  Verify Your Email
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-1.5 max-w-sm mx-auto leading-relaxed">
                  We've sent a 6-digit verification code to{" "}
                  <strong className="text-[var(--foreground)] font-bold">{pendingData?.email}</strong>.
                  Enter the code below to complete account creation.
                </p>
              </div>

              {/* Simulated Email Notification Card */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <ShieldCheck size={15} />
                    <span>Simulated Email Notification</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="text-[11px] font-bold text-[var(--primary)] hover:underline bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-amber-500/20"
                  >
                    Auto-fill Code
                  </button>
                </div>
                <p className="text-[11px] text-[var(--foreground)] font-mono">
                  From: <span className="text-[var(--muted-foreground)]">verify@hirehub.app</span> | Code:{" "}
                  <strong className="text-amber-600 dark:text-amber-400 text-sm font-bold tracking-widest">
                    {verificationCode}
                  </strong>
                </p>
              </div>

              {/* 6 Digit Verification Input Boxes */}
              <form onSubmit={handleVerifySubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-center text-[var(--muted-foreground)] uppercase tracking-wider mb-2.5">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        className="w-11 sm:w-12 h-13 sm:h-14 text-center font-poppins text-lg sm:text-xl font-black rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                {verifyError && (
                  <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900 text-center">
                    {verifyError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full font-bold"
                >
                  Verify & Create Account <CheckCircle2 size={16} />
                </Button>

                {/* Resend Code Section */}
                <div className="text-center pt-2">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Didn't receive the code?{" "}
                    {resendTimer > 0 ? (
                      <span className="font-semibold text-[var(--foreground)]">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Resend Code
                      </button>
                    )}
                  </p>
                </div>
              </form>

              <div className="pt-3 border-t border-[var(--border)] text-center">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold text-[var(--primary)] hover:underline">
                    Log In
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
