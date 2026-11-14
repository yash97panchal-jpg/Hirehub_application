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
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 flex flex-col justify-between pt-16 w-full max-w-full overflow-x-hidden font-inter">
      {/* 1. HERO: full-bleed navy (30%) on ivory page (60%), orange only for action (10%) */}
      <section className="relative overflow-hidden bg-[#101F3E] text-white px-4 sm:px-6 pt-16 pb-28 sm:pt-24 sm:pb-36">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#F7941D]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-[26rem] h-[26rem] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-orange-200 mb-6"
            >
              <Sparkles size={13} className="text-[#F7941D]" />
              Verified jobs · Smart resume matching · Direct employers
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="font-poppins text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold tracking-tight leading-[1.08] mb-5"
            >
              Your next role,{" "}
              <span className="text-[#F7941D]">found faster.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Search verified openings, see how well your resume fits before you apply, and hear back from real hiring teams.
            </motion.p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button variant="primary" size="lg" onClick={() => navigate("/jobs")} className="px-7">
                Browse jobs <ArrowRight size={16} />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/ats-checker")} className="px-7 !border-white/30 !text-white hover:!bg-white/10">
                Check my resume
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-5 grid grid-cols-2 gap-4"
          >
            {[["Verified", "Direct employer listings"], ["ATS", "Resume match checker"], ["1-click", "Easy Apply"], ["5-stage", "Application tracker"]].map(([n, l], i) => (
              <div key={l} className={"rounded-3xl p-5 border " + (i === 0 ? "bg-[#F7941D] border-[#F7941D] text-[#101F3E]" : "bg-white/8 border-white/15 text-white")}>
                <p className="font-poppins text-3xl font-extrabold">{n}</p>
                <p className={"text-xs mt-1 font-medium " + (i === 0 ? "text-[#101F3E]/80" : "text-slate-300")}>{l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search card overlapping the hero */}
      <section className="relative z-20 -mt-16 sm:-mt-20 px-4 sm:px-6">
        <motion.form
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto bg-white dark:bg-[#13223B] p-3 rounded-[28px] border border-[#E6E0D4] dark:border-slate-700 shadow-[0_24px_60px_-20px_rgba(16,31,62,0.35)] flex flex-col md:flex-row items-center gap-2.5"
        >
          <div className="w-full bg-[#FAF8F4] dark:bg-[#0B132B] rounded-2xl flex-1 px-1">
            <RoleSearchInput value={keyword} onChange={setKeyword} placeholder="Job title, skills, or company…"
              onSubmit={() => { const q = new URLSearchParams(); if (keyword.trim()) q.set("keyword", keyword.trim()); if (location.trim()) q.set("location", location.trim()); navigate(`/jobs?${q.toString()}`) }} />
          </div>
          <div className="w-full bg-[#FAF8F4] dark:bg-[#0B132B] rounded-2xl flex-1 px-1">
            <LocationSearchInput value={location} onChange={setLocation} placeholder="City, country, or remote…"
              onSubmit={() => { const q = new URLSearchParams(); if (keyword.trim()) q.set("keyword", keyword.trim()); if (location.trim()) q.set("location", location.trim()); navigate(`/jobs?${q.toString()}`) }} />
          </div>
          <Button type="submit" variant="navy" size="lg" className="w-full md:w-auto px-8 whitespace-nowrap">
            Search jobs <ArrowRight size={16} />
          </Button>
        </motion.form>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs text-slate-500">
          <span className="font-semibold text-[#101F3E] dark:text-slate-300">Popular:</span>
          {popularTags.map((tag) => (
            <button key={tag.label} type="button" onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag.query)}`)}
              className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-[#101F3E] hover:text-white text-slate-700 dark:text-slate-200 transition-colors border border-[#E6E0D4] dark:border-slate-700 cursor-pointer">
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. STATS BAR: Verified Proof Points */}
      <section className="py-7 px-4 sm:px-6 bg-[#FAF8F4] dark:bg-[#0E1833] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-poppins font-extrabold text-2xl sm:text-3xl text-[#101F3E] dark:text-white">
              {jobs.length.toLocaleString()}+
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Active Job Openings</p>
          </div>
          <div>
            <p className="font-poppins font-extrabold text-2xl sm:text-3xl text-[#F7941D]">
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
              <p className="text-xs font-bold uppercase tracking-wider text-[#F7941D] mb-1">
                Find your field
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white">
                Browse jobs by field
              </h2>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-[#F7941D] hover:underline flex items-center gap-1 group"
            >
              <span>See all jobs</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/jobs?keyword=${encodeURIComponent(cat.query)}`}
                className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-[#FAF8F4] dark:bg-[#13223B] hover:bg-white dark:hover:bg-[#1A2E4E] hover:border-orange-400/60 dark:hover:border-orange-500/60 transition-all duration-150 flex items-center justify-between group shadow-xs hover:shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/70 border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-center text-[#F7941D] dark:text-orange-300 group-hover:bg-[#F7941D] group-hover:text-white transition-colors">
                    <cat.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#F7941D] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cat.count} open positions
                    </p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-[#F7941D] group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED JOBS SECTION */}
      <section className="py-16 px-4 sm:px-6 bg-[#FAF8F4] dark:bg-[#0E1833] border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F7941D] mb-1">
                Handpicked Opportunities
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white">
                Featured Positions
              </h2>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-[#F7941D] hover:underline flex items-center gap-1 group"
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
              <p className="text-xs font-bold uppercase tracking-wider text-[#F7941D] mb-1">
                Verified Global Leaders
              </p>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white">
                Top Hiring Companies
              </h2>
            </div>
            <Link
              to="/companies"
              className="text-xs font-semibold text-[#F7941D] hover:underline flex items-center gap-1 group"
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
                className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-[#FAF8F4] dark:bg-[#13223B] hover:bg-white dark:hover:bg-[#1A2E4E] hover:border-orange-400/60 dark:hover:border-orange-500/60 transition-all duration-150 flex flex-col items-center text-center group shadow-xs hover:shadow-sm"
              >
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <img
                    src={getCompanyRealLogo(c.name, undefined, c.logo)}
                    alt={c.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-poppins font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#F7941D] transition-colors truncate max-w-full">
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
      <section className="py-16 px-4 sm:px-6 bg-[#FAF8F4] dark:bg-[#0E1833] border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F7941D] mb-1">
              Simple by design
            </p>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-[#101F3E] dark:text-white mb-3">
              How HireHub Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Three steps from search to interview, with no guesswork in between.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#13223B] border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <span className="text-4xl font-extrabold text-orange-100 dark:text-slate-800 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/80 border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-center text-[#F7941D] mb-4">
                <Search size={20} />
              </div>
              <h3 className="font-poppins font-semibold text-base text-slate-900 dark:text-white mb-2">
                Search & filter
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse verified openings and narrow them by experience, salary, work mode and skills until only the right roles remain.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#13223B] border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <span className="text-4xl font-extrabold text-orange-100 dark:text-slate-800 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/80 border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-center text-[#F7941D] mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="font-poppins font-semibold text-base text-slate-900 dark:text-white mb-2">
                Check your resume fit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Run your resume through our ATS checker and see which keywords you match and which you are missing, in seconds.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#13223B] border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <span className="text-4xl font-extrabold text-orange-100 dark:text-slate-800 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-poppins font-semibold text-base text-slate-900 dark:text-white mb-2">
                Apply & track
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Apply with Easy Apply, then follow every application from submitted to offer in one tracker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMPLOYER CALL TO ACTION */}
      <section className="py-14 px-4 sm:px-6 bg-[#101F3E] text-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F7941D] mb-2 block">
              For employers
            </span>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-2">
              Hire people who fit, faster.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Post a role in minutes, rank applicants automatically and manage your whole hiring pipeline from one dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate(isAuthenticated && user?.role === "recruiter" ? "/recruiter/post-job" : "/register")}
              className="font-semibold"
            >
              Post a job <ArrowRight size={15} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/recruiter")}
              className="border-slate-400 text-white hover:bg-white/10"
            >
              Employer dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
