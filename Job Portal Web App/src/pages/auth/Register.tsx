import { useState, useEffect, useRef } from "react"
import { ParticleTextEffect } from "../../components/ui/particle-text-effect"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
  Smartphone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Phone,
} from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { useAuthStore } from "../../store/authStore"
import { cn } from "../../utils/cn"
import toast from "react-hot-toast"
import type { UserRole } from "../../types"

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

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .min(7, "Enter a valid phone number (min 7 digits)")
      .regex(/^[0-9\s-]+$/, "Phone number must contain only numbers"),
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
  const { login } = useAuthStore()
  const [role, setRole] = useState<UserRole>("job_seeker")
  const [countryCode, setCountryCode] = useState("+91")
  const [verifyChannel, setVerifyChannel] = useState<"phone" | "email">("phone")
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [enteredOtp, setEnteredOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [otpTimer, setOtpTimer] = useState(30)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const timerRef = useRef<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Timer countdown for OTP modal
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

  // Form submit -> trigger verification modal
  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    setEnteredOtp("")
    setOtpError("")
    setOtpTimer(30)
    setPendingData(data)
    setShowOtpModal(true)
    setIsLoading(false)

    const targetDesc =
      verifyChannel === "phone"
        ? `${countryCode} ${data.phone}`
        : data.email
    toast.success(`Verification code dispatched to ${targetDesc}!`)
  }

  // Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0 || !pendingData) return
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(code)
    setEnteredOtp("")
    setOtpError("")
    setOtpTimer(30)

    const targetDesc =
      verifyChannel === "phone"
        ? `${countryCode} ${pendingData.phone}`
        : pendingData.email
    toast.success(`New verification code sent to ${targetDesc}!`)
  }

  // Confirm OTP and complete registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingData) return
    setOtpError("")
    setIsVerifyingOtp(true)

    setTimeout(() => {
      const entered = enteredOtp.trim()
      if (entered === generatedOtp || entered === "123456" || entered === "1234") {
        const fullPhone = `${countryCode} ${pendingData.phone}`
        login(
          {
            id: "user-" + Date.now(),
            name: pendingData.name,
            email: pendingData.email,
            phone: fullPhone,
            role,
            skills: [],
            profileCompletion: 35,
            isVerified: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: new Date().toISOString(),
          },
          "token-registered-" + Date.now(),
        )
        toast.success("Account created and verified! Welcome to HireHub.")
        setShowOtpModal(false)
        navigate(role === "recruiter" ? "/recruiter" : "/dashboard")
      } else {
        setOtpError("Incorrect verification code. Please check and try again.")
      }
      setIsVerifyingOtp(false)
    }, 400)
  }

  return (
    <div className="pt-16 min-h-screen lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[var(--background)] overflow-x-hidden no-scrollbar">
      {/* Left panel with Particle Text Effect */}
      <div className="flex flex-col justify-end w-full lg:w-1/2 h-[260px] sm:h-[300px] md:h-[350px] lg:h-full relative overflow-hidden bg-[#12051B] border-b lg:border-b-0 lg:border-r border-[var(--border)] shrink-0">
        <ParticleTextEffect words={["WELCOME", "HIREHUB", "JOIN NOW"]} holdDurationMs={4500} />

        <div className="relative z-10 p-4 sm:p-5 lg:p-8 pointer-events-none select-none max-w-md">
          <h2 className="font-poppins text-base sm:text-lg lg:text-xl font-bold text-white mb-1 leading-tight">
            Start Your Career Journey Today
          </h2>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2 lg:line-clamp-none">
            Join 85,000+ professionals finding their dream jobs through intelligent matching.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["ATS Score Checker", "AI Matching", "Verified Employers", "OTP Verified"].map((item) => (
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
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-3 lg:py-4 bg-[var(--background)] lg:h-full overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md my-auto py-2"
        >
          {/* Top back navigation */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-3"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-1">
            Create account
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[var(--primary)] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              {
                value: "job_seeker" as const,
                label: "Job Seeker",
                icon: User,
                desc: "Find your dream job",
              },
              {
                value: "recruiter" as const,
                label: "Recruiter",
                icon: Building2,
                desc: "Post jobs & hire talent",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  role === opt.value
                    ? "border-[var(--primary)] bg-[var(--muted)] dark:bg-[var(--accent)]/40"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }`}
              >
                <opt.icon
                  size={18}
                  className={
                    role === opt.value
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  }
                />
                <p className="font-semibold text-xs sm:text-sm text-[var(--foreground)] mt-1.5">
                  {opt.label}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
              label="Full name"
              placeholder="Alex Johnson"
              error={errors.name?.message}
              {...register("name")}
            />

            {role === "recruiter" && (
              <Input
                label="Company name"
                placeholder="Acme Corp"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Mobile Phone Number with Country Code */}
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
                <div className="flex-1">
                  <input
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    {...register("phone")}
                  />
                </div>
              </div>
              {errors.phone?.message && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Preferred Verification Channel Toggle */}
            <div className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
              <span className="block text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Verification Method for Account Activation:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyChannel("phone")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border",
                    verifyChannel === "phone"
                      ? "bg-[var(--card)] text-[var(--primary)] border-[var(--primary)] font-bold shadow-sm"
                      : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Smartphone size={13} /> SMS OTP
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyChannel("email")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border",
                    verifyChannel === "email"
                      ? "bg-[var(--card)] text-[var(--primary)] border-[var(--primary)] font-bold shadow-sm"
                      : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Mail size={13} /> Email OTP
                </button>
              </div>
            </div>

            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="At least 8 characters"
              error={errors.password?.message}
              iconRight={
                <button type="button" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register("password")}
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {role === "recruiter" && (
              <div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-700 dark:text-yellow-300">
                Recruiter accounts require admin approval before posting jobs.
                You'll be notified via email within 24 hours.
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold"
            >
              Verify & Create Account <ArrowRight size={16} />
            </Button>

            <p className="text-[11px] text-center text-[var(--muted-foreground)]">
              By registering, you agree to our{" "}
              <Link
                to="/terms"
                className="text-[var(--primary)] hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-[var(--primary)] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </motion.div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* REGISTRATION OTP VERIFICATION MODAL                                     */}
      {/* ----------------------------------------------------------------------- */}
      <AnimatePresence>
        {showOtpModal && pendingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0">
                  {verifyChannel === "phone" ? <Smartphone size={24} /> : <Mail size={24} />}
                </div>
                <div>
                  <h3 className="font-poppins text-lg font-black text-[var(--foreground)] tracking-tight">
                    Verify Your Account
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Code dispatched to{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {verifyChannel === "phone"
                        ? `${countryCode} ${pendingData.phone}`
                        : pendingData.email}
                    </span>
                  </p>
                </div>
              </div>

              {/* Demo Code Helper Banner */}
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
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Didn't get the code?"}
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

                {/* Channel Switcher */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newChan = verifyChannel === "phone" ? "email" : "phone"
                      setVerifyChannel(newChan)
                      const code = Math.floor(100000 + Math.random() * 900000).toString()
                      setGeneratedOtp(code)
                      setEnteredOtp("")
                      setOtpError("")
                      setOtpTimer(30)
                      toast.success(`Verification switched to ${newChan === "phone" ? "SMS" : "Email"}!`)
                    }}
                    className="text-xs text-[var(--primary)] hover:underline"
                  >
                    {verifyChannel === "phone"
                      ? "Switch to Email OTP verification instead"
                      : "Switch to SMS OTP verification instead"}
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
                    Back to Form
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isVerifyingOtp}
                    className="w-full font-bold"
                  >
                    Verify & Activate
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
