import { useState } from "react"
import { ParticleTextEffect } from "../../components/ui/particle-text-effect"
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
    <div className="pt-16 min-h-screen lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[var(--background)] overflow-x-hidden no-scrollbar">
      {/* Left panel with Particle Text Effect (Responsive on Phone, Tablet & Desktop) */}
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
            {["ATS Score Checker", "AI Matching", "Verified Employers"].map((item) => (
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
          className="w-full max-w-md my-auto"
        >
          {/* Top back navigation */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-1">
            Create account
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-5">
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
                    ? "border-[var(--primary)] bg-[var(--muted)] dark:bg-[var(--accent)]/40"
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
