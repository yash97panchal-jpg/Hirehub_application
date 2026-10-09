import { useState } from "react"
import symbolLogo from "../../imports/symbol_only.jpeg"
import { BlackHoleHeroSection } from "../../components/ui/blackhole-hero-section"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Eye,
  EyeOff,
  Briefcase,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { useAuthStore } from "../../store/authStore"
import toast from "react-hot-toast"
import type { UserRole } from "../../types"

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
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
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    login(
      {
        id: "new-" + Date.now(),
        name: data.name,
        email: data.email,
        role,
        skills: [],
        profileCompletion: 15,
        isVerified: false,
        createdAt: new Date().toISOString(),
      },
      "mock-token-new",
    )
    toast.success("Account created! Let's set up your profile.")
    navigate(role === "recruiter" ? "/recruiter" : "/dashboard")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <BlackHoleHeroSection
          focus={[0.5, 0.6]}
          scrim="bottom"
          scrimStrength={0.7}
          distance={20}
          elevation={-5.5}
          fov={50}
          glow={1}
          steps={300}
          resolution={0.7}
          className="absolute inset-0 z-0"
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-md mx-auto p-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border border-[var(--border)] mb-6 shrink-0 overflow-hidden text-center mx-auto">
              <img
                src={symbolLogo}
                alt="HireHub Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h2 className="font-poppins text-4xl font-black text-white mb-4 text-center">
              Start your career journey today
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8 text-center">
              Join 85,000+ professionals finding their dream jobs through
              intelligent matching and ATS-optimized resumes.
            </p>
            <ul className="space-y-3 w-full">
              {[
                "Free ATS resume score checker",
                "AI-powered job recommendations",
                "Direct recruiter messaging",
                "Salary insights and benchmarks",
                "Resume builder with 4 templates",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-white/90 text-sm p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                >
                  <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xs font-bold flex-shrink-0 border border-[var(--primary)]/30">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </BlackHoleHeroSection>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 bg-[var(--background)] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md pt-16"
        >
          <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)] mb-1">
            Create account
          </h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[var(--primary)] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
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
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  role === opt.value
                    ? "border-[var(--primary)] bg-[var(--muted)] dark:bg-blue-950/30"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }`}
              >
                <opt.icon
                  size={20}
                  className={
                    role === opt.value
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  }
                />
                <p className="font-semibold text-sm text-[var(--foreground)] mt-2">
                  {opt.label}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-700 dark:text-yellow-300">
                Recruiter accounts require admin approval before posting jobs.
                You'll be notified via email within 24 hours.
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Create account <ArrowRight size={16} />
            </Button>

            <p className="text-xs text-center text-[var(--muted-foreground)]">
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
    </div>
  )
}
