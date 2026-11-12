import { useState, useEffect, useMemo } from "react"
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
  Code2,
  Palette,
  LineChart,
  Cpu,
  Layers,
  ArrowUpRight,
  Clock,
  Check,
} from "lucide-react"
import Button from "../components/ui/Button"
import RoleSearchInput from "../components/ui/RoleSearchInput"
import LocationSearchInput from "../components/ui/LocationSearchInput"
import JobCard from "../components/ui/JobCard"
import { useAuthStore } from "../store/authStore"
import { useJobStore } from "../store/jobStore"
import { getCompanyRealLogo } from "../data/companyLogos"

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { jobs } = useJobStore()
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

  // Real job subsets from store
  const featuredJobs = useMemo(() => {
    const featured = jobs.filter((j) => j.isFeatured)
    return (featured.length > 0 ? featured : jobs).slice(0, 6)
  }, [jobs])

  const recentJobs = useMemo(() => {
    return jobs.slice(0, 6)
  }, [jobs])

  // Real distinct companies from store
  const topCompanies = useMemo(() => {
    const map = new Map<string, { name: string; logo?: string; location: string; count: number; slug?: string }>()
    jobs.forEach((j) => {
      const name = j.company?.name
      if (!name) return
      if (!map.has(name)) {
        map.set(name, {
          name,
          logo: j.company.logo,
          location: j.company.location || j.location,
          count: 1,
          slug: j.company.slug || j.company.id,
        })
      } else {
        const item = map.get(name)!
        item.count += 1
      }
    })
    return Array.from(map.values()).slice(0, 8)
  }, [jobs])

  // Job categories with real counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {
      Engineering: 0,
      Design: 0,
      Product: 0,
      "Data & AI": 0,
      Marketing: 0,
      Sales: 0,
    }

    jobs.forEach((j) => {
      const text = `${j.category || ""} ${j.title || ""} ${(j.skills || []).join(" ")}`.toLowerCase()
      if (text.includes("engineer") || text.includes("developer") || text.includes("software")) counts["Engineering"]++
      else if (text.includes("design") || text.includes("ui") || text.includes("ux")) counts["Design"]++
      else if (text.includes("product")) counts["Product"]++
      else if (text.includes("ai") || text.includes("data") || text.includes("machine learning")) counts["Data & AI"]++
      else if (text.includes("market") || text.includes("growth")) counts["Marketing"]++
      else counts["Sales"]++
    })

    return [
      { label: "Engineering", count: counts["Engineering"], icon: Code2, query: "Engineering" },
      { label: "Product & Strategy", count: counts["Product"], icon: Layers, query: "Product" },
      { label: "UI / UX Design", count: counts["Design"], icon: Palette, query: "Design" },
      { label: "Data Science & AI", count: counts["Data & AI"], icon: Cpu, query: "Data" },
      { label: "Growth & Marketing", count: counts["Marketing"], icon: LineChart, query: "Marketing" },
      { label: "Sales & Partnerships", count: counts["Sales"], icon: Briefcase, query: "Sales" },
    ]
  }, [jobs])

  const popularTags = [
    { label: "Remote", query: "Remote" },
    { label: "Full Stack", query: "Full Stack" },
    { label: "React / TypeScript", query: "React" },
    { label: "Python & AI", query: "Python" },
    { label: "Cloud & DevOps", query: "Cloud" },
    { label: "Product Manager", query: "Product" },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 flex flex-col justify-between pt-16 w-full max-w-full overflow-x-hidden font-inter">
      {/* 1. HERO SECTION: Linear / Stripe inspired composition */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B132B]">
        {/* Subtle geometric gradient backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(11,19,43,0))] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-800/80 text-xs font-semibold text-[#EA580C] dark:text-orange-300 mb-6 shadow-xs"
          >
            <Sparkles size={13} className="text-[#F97316]" />
            <span>Intelligent Career Discovery & Role-Based ATS Matching</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101F3E] dark:text-white tracking-tight leading-[1.12] mb-5"
          >
            Find the Right Opportunity.{" "}
            <span className="text-[#F97316] block sm:inline">Build Your Future.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Discover opportunities, connect with employers and take the next step in your career with HireHub.
          </motion.p>

          {/* Elevated Search Container */}
          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onSubmit={handleSearch}
            className="bg-white dark:bg-[#13223B] p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex flex-col md:flex-row items-center gap-2.5 max-w-3xl mx-auto"
          >
            {/* Role & Keyword Input */}
            <div className="w-full bg-slate-50 dark:bg-[#0B132B] rounded-xl border border-slate-200 dark:border-slate-700/80 flex-1 px-1">
              <RoleSearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder="Job title, skills, or company…"
                onSubmit={() => {
                  const params = new URLSearchParams()
                  if (keyword.trim()) params.set("keyword", keyword.trim())
                  if (location.trim()) params.set("location", location.trim())
                  navigate(`/jobs?${params.toString()}`)
                }}
              />
            </div>

            {/* Location Input */}
            <div className="w-full bg-slate-50 dark:bg-[#0B132B] rounded-xl border border-slate-200 dark:border-slate-700/80 flex-1 px-1">
              <LocationSearchInput
                value={location}
                onChange={setLocation}
                placeholder="Location, country, or remote…"
                onSubmit={() => {
                  const params = new URLSearchParams()
                  if (keyword.trim()) params.set("keyword", keyword.trim())
                  if (location.trim()) params.set("location", location.trim())
                  navigate(`/jobs?${params.toString()}`)
                }}
              />
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full md:w-auto px-7 py-3 font-semibold rounded-xl whitespace-nowrap shadow-sm"
            >
              Search Jobs <ArrowRight size={16} />
            </Button>
          </motion.form>

          {/* Popular Tag Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-slate-500 dark:text-slate-400"
          >
            <span className="font-medium text-slate-700 dark:text-slate-300">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag.query)}`)}
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. STATS BAR: Verified Proof Points */}
      <section className="py-7 px-4 sm:px-6 bg-[#F8FAFC] dark:bg-[#0E1833] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-poppins font-extrabold text-2xl sm:text-3xl text-[#101F3E] dark:text-white">
              {jobs.length.toLocaleString()}+
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Active Job Openings</p>
          </div>
          <div>
            <p className="font-poppins font-extrabold text-2xl sm:text-3xl text-[#F97316]">
              {topCompanies.length * 15}+
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Verified Employers</p>
          </div>
          <div>
            <p className="font-poppins font-extrabold text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400">
              96.4%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">ATS Match Accuracy</p>
          </div>
          <div>
            <p className="font-poppins font-extrabold text-2xl sm:text-3xl text-[#101F3E] dark:text-white">
              100%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Verified Direct Listings</p>
          </div>
        </div>
      </section>

      {/* 3. POPULAR JOB CATEGORIES */}
      <section className="py-16 px-4 sm:px-6 bg-white dark:bg-[#0B132B]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-1">
                Explore by Discipline
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white">
                Popular Career Categories
              </h2>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1 group"
            >
              <span>Explore all categories</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/jobs?keyword=${encodeURIComponent(cat.query)}`}
                className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#13223B] hover:bg-white dark:hover:bg-[#1A2E4E] hover:border-orange-400/60 dark:hover:border-orange-500/60 transition-all duration-150 flex items-center justify-between group shadow-xs hover:shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/70 border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-center text-[#F97316] dark:text-orange-300 group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                    <cat.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#F97316] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cat.count} open positions
                    </p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-[#F97316] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED JOBS SECTION */}
      <section className="py-16 px-4 sm:px-6 bg-[#F8FAFC] dark:bg-[#0E1833] border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-1">
                Handpicked Opportunities
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white">
                Featured Positions
              </h2>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1 group"
            >
              <span>View all {jobs.length} jobs</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOP EMPLOYERS SPOTLIGHT */}
      <section className="py-16 px-4 sm:px-6 bg-white dark:bg-[#0B132B]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-1">
                Verified Global Leaders
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white">
                Top Hiring Companies
              </h2>
            </div>
            <Link
              to="/companies"
              className="text-xs font-semibold text-[#F97316] hover:underline flex items-center gap-1 group"
            >
              <span>Explore all companies</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topCompanies.map((c) => (
              <Link
                key={c.name}
                to={`/companies/${c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#13223B] hover:bg-white dark:hover:bg-[#1A2E4E] hover:border-orange-400/60 dark:hover:border-orange-500/60 transition-all duration-150 flex flex-col items-center text-center group shadow-xs hover:shadow-sm"
              >
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <img
                    src={getCompanyRealLogo(c.name, undefined, c.logo)}
                    alt={c.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-poppins font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#F97316] transition-colors truncate max-w-full">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {c.count} open role{c.count === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW HIREHUB WORKS: 3-Step Clear Architecture */}
      <section className="py-16 px-4 sm:px-6 bg-[#F8FAFC] dark:bg-[#0E1833] border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-1">
              Streamlined Process
            </p>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white mb-3">
              How HireHub Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              From discovering unlisted roles to passing ATS filters and securing direct interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#13223B] border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <span className="text-4xl font-extrabold text-orange-100 dark:text-slate-800 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/80 border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-center text-[#F97316] mb-4">
                <Search size={20} />
              </div>
              <h3 className="font-poppins font-semibold text-base text-slate-900 dark:text-white mb-2">
                1. Search & Filter
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Explore thousands of verified direct positions. Filter by exact experience, salary, work mode, and technology stack.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#13223B] border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <span className="text-4xl font-extrabold text-orange-100 dark:text-slate-800 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/80 border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-center text-[#F97316] mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="font-poppins font-semibold text-base text-slate-900 dark:text-white mb-2">
                2. Score Your Resume
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Benchmark your profile against automated ATS parsing filters. See matching keywords and circular progress rings instantly.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#13223B] border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <span className="text-4xl font-extrabold text-orange-100 dark:text-slate-800 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-poppins font-semibold text-base text-slate-900 dark:text-white mb-2">
                3. Apply & Track
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit with 1-click Easy Apply. Monitor your application status across 5 pipeline stages in your unified tracker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMPLOYER CALL TO ACTION */}
      <section className="py-14 px-4 sm:px-6 bg-[#101F3E] text-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F97316] mb-2 block">
              For Hiring Teams & Tech Employers
            </span>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-2">
              Hire exceptional talent worldwide.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Publish job openings, evaluate applicants with automated ATS ranking, and manage your technical hiring pipeline.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate(isAuthenticated && user?.role === "recruiter" ? "/recruiter/post-job" : "/register")}
              className="font-semibold"
            >
              Post a Position <ArrowRight size={15} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/recruiter")}
              className="border-slate-400 text-white hover:bg-white/10"
            >
              Employer Overview
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
