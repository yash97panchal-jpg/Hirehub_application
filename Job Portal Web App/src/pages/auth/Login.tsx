import { useState } from "react"

import symbolLogo from "../../imports/symbol_only.jpeg"

import { Link, useNavigate } from "react-router-dom"

import { motion } from "framer-motion"

import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { z } from "zod"

import { Eye, EyeOff, Briefcase, ArrowRight, ArrowLeft } from "lucide-react"

import Button from "../../components/ui/Button"

import Input from "../../components/ui/Input"

import { useAuthStore } from "../../store/authStore"

import toast from "react-hot-toast"

const schema = z.object({
  email: z.string().email("Enter a valid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

const demoAccounts = [
  {
    label: "Job Seeker",

    email: "user@demo.com",

    password: "demo123",

    role: "job_seeker" as const,
  },

  {
    label: "Recruiter",

    email: "recruiter@demo.com",

    password: "demo123",

    role: "recruiter" as const,
  },

  {
    label: "Admin",

    email: "admin@demo.com",

    password: "demo123",

    role: "admin" as const,
  },
]

export default function Login() {
  const navigate = useNavigate()

  const { login } = useAuthStore()

  const [showPw, setShowPw] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const {
    register,

    handleSubmit,

    setValue,

    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    await new Promise((r) => setTimeout(r, 800))

    const demo = demoAccounts.find(
      (d) => d.email === data.email && d.password === data.password,
    )

    if (demo) {
      login(
        {
          id: demo.role,

          name: demo.label + " Demo",

          email: demo.email,

          role: demo.role,

          skills: ["React", "TypeScript"],

          profileCompletion: 75,

          isVerified: true,

          createdAt: "2026-01-01",
        },

        "mock-token-" + demo.role,
      )

      toast.success(`Welcome back, ${demo.label}!`)

      navigate(
        demo.role === "admin"
          ? "/admin"
          : demo.role === "recruiter"
            ? "/recruiter"
            : "/dashboard",
      )
    } else {
      // Allow any arbitrary credentials
      login(
        {
          id: "user-" + Date.now(),
          name: data.email.split('@')[0],
          email: data.email,
          role: "job_seeker",
          skills: [],
          profileCompletion: 30,
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        "mock-token-custom",
      )

      toast.success(`Welcome back!`)
      navigate("/dashboard")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #101F3E 0%, var(--primary) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",

            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border border-[var(--border)] mb-6 shrink-0 overflow-hidden">
            <img
              src={symbolLogo}
              alt="HireHub Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="font-poppins text-4xl font-black text-white mb-4">
            Welcome back to HireHub
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Access 12,400+ active jobs, track your applications, and get
            AI-powered career insights.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              "85,000+ Users",

              "12.4k+ Jobs",

              "41k Placements",

              "4.9★ Rating",
            ].map((stat) => (
              <div
                key={stat}
                className="rounded-full bg-white/10 px-4 py-3 text-white font-semibold text-sm"
              >
                {stat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md pt-16"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)] mb-1">
            Sign in
          </h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[var(--primary)] font-semibold hover:underline"
            >
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                error={errors.password?.message}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register("password")}
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Sign in <ArrowRight size={16} />
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
              Try demo accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => {
                    setValue("email", demo.email)

                    setValue("password", demo.password)
                  }}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-all text-center"
                >
                  {demo.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Click to fill credentials, then Sign in.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
