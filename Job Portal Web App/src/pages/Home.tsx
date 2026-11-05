import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  MapPin,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Globe,
  Sparkles,
  Users,
} from "lucide-react"
import Button from "../components/ui/Button"
import RoleSearchInput from "../components/ui/RoleSearchInput"
import LocationSearchInput from "../components/ui/LocationSearchInput"
import { useAuthStore } from "../store/authStore"

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("")

  const authState = useAuthStore.getState()
  const isAuth = (isAuthenticated && !!user) || (authState.isAuthenticated && !!authState.user)
  const currentUser = user || authState.user

  // Auto-redirect authenticated users immediately to their respective dashboard
  useEffect(() => {
    if (isAuth && currentUser) {
      const target =
        currentUser.role === "admin"
          ? "/admin"
          : currentUser.role === "recruiter"
            ? "/recruiter"
            : "/dashboard"
      navigate(target, { replace: true })
    }
  }, [isAuth, currentUser, navigate])

  if (isAuth && currentUser) {
    return null
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set("keyword", keyword.trim())
    if (location.trim()) params.set("location", location.trim())
    navigate(`/jobs?${params.toString()}`)
  }

  const popularTags = [
    { label: "Remote", query: "Remote" },
    { label: "Engineering", query: "Engineering" },
    { label: "Product Manager", query: "Product" },
    { label: "Design", query: "Design" },
    { label: "AI & ML", query: "AI" },
    { label: "Finance", query: "Finance" },
  ]

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between pt-16 w-full max-w-full overflow-x-hidden">
      {/* 1. HERO SECTION: Clean & Focused Search (Like Indeed / LinkedIn) */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--primary)]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] mb-6 shadow-sm"
          >
            <Sparkles size={13} className="text-[var(--primary)]" />
            <span>AI-Powered ATS Matching & Worldwide Career Discovery</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[1.1] mb-5"
          >
            Find the Right Career,{" "}
            <span className="text-[var(--primary)] block sm:inline">Faster.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Connect with verified global employers, benchmark your resume against ATS
            algorithms, and land your next role with confidence.
          </motion.p>

          {/* Central High-Impact Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch}
            className="bg-[var(--card)] p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-[var(--border)] shadow-[var(--shadow-elevated)] flex flex-col md:flex-row items-center gap-2.5 max-w-3xl mx-auto"
          >
            {/* Keyword / Role & Skill Autocomplete Input */}
            <div className="w-full bg-[var(--background)] rounded-xl border border-[var(--border)]/70 flex-1 px-1">
              <RoleSearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder="Job title, role, or skills (e.g. Python Developer)…"
                onSubmit={() => {
                  const params = new URLSearchParams()
                  if (keyword.trim()) params.set("keyword", keyword.trim())
                  if (location.trim()) params.set("location", location.trim())
                  navigate(`/jobs?${params.toString()}`)
                }}
              />
            </div>

            {/* 3-Tier Location Autocomplete Input */}
            <div className="w-full bg-[var(--background)] rounded-xl border border-[var(--border)]/70 flex-1 px-1">
              <LocationSearchInput
                value={location}
                onChange={setLocation}
                placeholder="Country, State, or City (e.g. India, California)…"
                onSubmit={() => {
                  const params = new URLSearchParams()
                  if (keyword.trim()) params.set("keyword", keyword.trim())
                  if (location.trim()) params.set("location", location.trim())
                  navigate(`/jobs?${params.toString()}`)
                }}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full md:w-auto px-7 py-3 font-bold rounded-xl whitespace-nowrap shadow-md"
            >
              Search Jobs <ArrowRight size={16} />
            </Button>
          </motion.form>

          {/* Popular Tag Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-[var(--muted-foreground)]"
          >
            <span className="font-semibold text-[var(--foreground)]">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag.query)}`)}
                className="px-3 py-1 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors border border-[var(--border)]"
              >
                {tag.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. DUAL GATEWAYS: For Job Seekers vs For Employers */}
      <section className="py-12 px-4 sm:px-6 bg-[var(--card)]/40 border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Job Seekers */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center mb-5">
                <Briefcase size={24} />
              </div>
              <h2 className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-2">
                For Job Seekers
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">
                Discover curated worldwide opportunities, check your resume's ATS compatibility
                score, and apply directly to hiring managers with real-time tracking.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--foreground)] mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>Free role-based ATS resume matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>Interactive worldwide map of global tech hubs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>One-click application status monitoring</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1 font-bold"
                onClick={() => navigate(isAuthenticated ? "/jobs" : "/register")}
              >
                Explore Jobs <ArrowRight size={15} />
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
              )}
            </div>
          </div>

          {/* Card 2: Employers & Recruiters */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] dark:text-[var(--primary)] flex items-center justify-center mb-5">
                <Building2 size={24} />
              </div>
              <h2 className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-2">
                For Employers
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">
                Find and hire pre-vetted candidates across global tech hubs. Post openings, manage
                applicants, and build your technical pipeline with intelligent sorting.
              </p>
              <ul className="space-y-2.5 text-xs text-[var(--foreground)] mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>Reach verified active tech professionals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>Automated ATS ranking of candidate resumes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>Dedicated recruiter dashboard & company branding</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1 font-bold"
                onClick={() => navigate(isAuthenticated && user?.role === "recruiter" ? "/recruiter/post-job" : "/login")}
              >
                Post a Job <ArrowRight size={15} />
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Recruiter Log In
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY PLATFORM ESSENTIALS (3 Concise Highlights - No Clutter) */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
              Why Professionals Choose HireHub
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              Built from the ground up for modern career discovery and intelligent hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-poppins font-bold text-base text-[var(--foreground)] mb-1.5">
                ATS Resume Optimization
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Benchmark your resume against real recruiter scoring profiles to ensure you pass automated screenings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <Globe size={20} />
              </div>
              <h3 className="font-poppins font-bold text-base text-[var(--foreground)] mb-1.5">
                Global Interactive Map
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Explore real-world positions on free worldwide satellite, street, and dark canvas tile layers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-poppins font-bold text-base text-[var(--foreground)] mb-1.5">
                Verified Employers
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Zero spam and zero ghost listings. All employers and recruiters are vetted before posting roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLEAN CALL-TO-ACTION (Bottom Welcome Banner) */}
      <section className="py-10 px-4 sm:px-6 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="font-poppins text-xl font-bold text-[var(--foreground)]">
              Ready to find your next career breakthrough?
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Join thousands of professionals already discovering opportunities on HireHub.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!isAuthenticated ? (
              <>
                <Button variant="outline" size="md" onClick={() => navigate("/login")}>
                  Log In
                </Button>
                <Button variant="primary" size="md" onClick={() => navigate("/register")} className="font-bold">
                  Create Account <ArrowRight size={14} />
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  navigate(
                    user?.role === "admin"
                      ? "/admin"
                      : user?.role === "recruiter"
                        ? "/recruiter"
                        : "/dashboard",
                  )
                }
                className="font-bold"
              >
                Go to Dashboard <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
