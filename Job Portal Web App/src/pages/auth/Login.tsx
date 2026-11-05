import React, { useState, useEffect } from "react"
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
  Mail,
} from "lucide-react"
import { ParticleTextEffect } from "../../components/ui/particle-text-effect"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { useAuthStore } from "../../store/authStore"
import { authService, isSupabaseConfigured } from "../../lib/supabase"
import { cn } from "../../utils/cn"
import toast from "react-hot-toast"

export default function Login() {
  const navigate = useNavigate()
  const { user, isAuthenticated, login, logout } = useAuthStore()

  const [activeRole, setActiveRole] = useState<"candidate" | "recruiter">("candidate")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [formError, setFormError] = useState("")

  // Auto-redirect if already authenticated
  useEffect(() => {
    document.title = "Sign In — HireHub"
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const cleanEmail = email.trim()
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setFormError("Please enter a valid email address.")
      return
    }

    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.signIn(cleanEmail, password)
      if (res?.user) {
        login(res.user, res.session?.access_token || "auth-session-token")
        toast.success(`Welcome back, ${res.user.name || "User"}!`)
        const target =
          res.user.role === "admin"
            ? "/admin"
            : res.user.role === "recruiter"
              ? "/recruiter"
              : "/dashboard"
        navigate(target)
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setFormError(err.message || "Failed to sign in. Please verify your credentials.")
      toast.error(err.message || "Invalid email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const res = await authService.signInWithGoogle()
      if (res && "user" in res && res.user) {
        login(res.user as any, (res as any).session?.access_token || "google-token")
        toast.success("Welcome back with Google!")
        navigate(res.user.role === "recruiter" ? "/recruiter" : "/dashboard")
      }
    } catch (err: any) {
      console.error("Google sign in error:", err)
      toast.error(err.message || "Failed to initiate Google sign in.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[var(--background)] overflow-x-hidden no-scrollbar">
      {/* LEFT PANEL: Interactive Particle Animation */}
      <div className="flex flex-col justify-end w-full lg:w-1/2 h-[240px] sm:h-[280px] md:h-[320px] lg:h-full relative overflow-hidden bg-[#12051B] border-b lg:border-b-0 lg:border-r border-[var(--border)] shrink-0">
        <ParticleTextEffect
          words={["WELCOME", "HIREHUB", "CAREER SEARCH"]}
          holdDurationMs={4500}
        />

        <div className="relative z-10 p-4 sm:p-5 lg:p-8 pointer-events-none select-none max-w-md">
          <h2 className="font-poppins text-base sm:text-lg lg:text-xl font-bold text-white mb-1 leading-tight">
            Your Gateway to Tomorrow's Career
          </h2>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-2 lg:line-clamp-none">
            Supabase verified authentication, multi-company applications, and intelligent ATS matching.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-4 lg:py-6 bg-[var(--background)] lg:h-full overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md my-auto py-2"
        >
          {/* Active Session Indicator */}
          {isAuthenticated && user && (
            <div className="mb-4 p-3 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[var(--foreground)]">
                  Active Session: {user?.name || user?.email || "User"} ({user.role})
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
              onClick={() => {
                setActiveRole("candidate")
                setFormError("")
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
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
              onClick={() => {
                setActiveRole("recruiter")
                setFormError("")
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                activeRole === "recruiter"
                  ? "bg-[var(--card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              <Briefcase size={15} />
              Recruiter
            </button>
          </div>

          {/* Form Title */}
          <div className="mb-4">
            <h1 className="font-poppins text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight mb-1">
              {activeRole === "recruiter" ? "Recruiter Sign In" : "Candidate Sign In"}
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Sign in with your verified email and password. Server-side role enforcement via Supabase Auth & RLS.
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-xs sm:text-sm font-semibold text-[var(--foreground)] flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-[var(--border)] w-full" />
            <span className="bg-[var(--background)] px-3 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider absolute">
              Or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <Input
              label={activeRole === "recruiter" ? "Work Email Address" : "Email Address"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeRole === "recruiter" ? "recruiter@company.com" : "you@example.com"}
              required
            />

            <div>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
              className="w-full mt-2 font-bold"
            >
              {activeRole === "recruiter" ? "Sign in to Recruiter Portal" : "Sign in to HireHub"}{" "}
              <ArrowRight size={15} />
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-[var(--primary)] hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
