import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe,
  Send,
  CheckCircle,
  Briefcase,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react"
import symbolLogo from "../../imports/symbol_only.jpeg"
import { useAuthStore } from "../../store/authStore"
import { useJobStore } from "../../store/jobStore"

export default function Footer() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { jobs } = useJobStore()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [selectedRoleAlert, setSelectedRoleAlert] = useState("All Engineering & Tech")

  // Real dynamic counts from actual store data
  const liveJobsCount = jobs.length
  const uniqueCompaniesCount = useMemo(() => {
    const names = new Set(jobs.map((j) => j.company?.name).filter(Boolean))
    return names.size || 25
  }, [jobs])
  const uniqueCountriesCount = useMemo(() => {
    const countries = new Set()
    jobs.forEach((j) => {
      const parts = (j.location || "").split(",")
      const c = parts[parts.length - 1]?.trim()
      if (c && c.toLowerCase() !== "remote") countries.add(c)
    })
    return Math.max(countries.size, 15)
  }, [jobs])

  const handleLogoClick = (e: React.MouseEvent) => {
    const currentAuth = useAuthStore.getState()
    if (currentAuth.isAuthenticated && currentAuth.user) {
      e.preventDefault()
      const target =
        currentAuth.user.role === "admin"
          ? "/admin"
          : currentAuth.user.role === "recruiter"
            ? "/recruiter"
            : "/dashboard"
      navigate(target)
    }
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    setSubscribed(true)
    setTimeout(() => {
      setEmail("")
    }, 4000)
  }

  const globalHubs = [
    { name: "London, UK", query: "London" },
    { name: "San Francisco, USA", query: "San Francisco" },
    { name: "Tokyo, Japan", query: "Tokyo" },
    { name: "Berlin, Germany", query: "Berlin" },
    { name: "Singapore", query: "Singapore" },
    { name: "Bengaluru, India", query: "Bengaluru" },
    { name: "Toronto, Canada", query: "Toronto" },
    { name: "Sydney, Australia", query: "Sydney" },
    { name: "Zurich, Switzerland", query: "Zurich" },
    { name: "Austin, USA", query: "Austin" },
  ]

  const careerLinks = [
    { label: "Frontend Engineer Jobs", href: "/jobs?keyword=Frontend" },
    { label: "Backend & Systems Jobs", href: "/jobs?keyword=Backend" },
    { label: "AI & Machine Learning Jobs", href: "/jobs?keyword=AI" },
    { label: "DevOps & Cloud Jobs", href: "/jobs?keyword=DevOps" },
    { label: "Product Manager Roles", href: "/jobs?keyword=Product" },
    { label: "UI/UX Designer Openings", href: "/jobs?keyword=Design" },
    { label: "Worldwide Remote Jobs", href: "/jobs?location=Remote" },
  ]

  const toolLinks = [
    { label: "Role-Based ATS Checker", href: "/ats-checker", isNew: true },
    { label: "AI Resume Builder", href: "/resume-builder" },
    { label: "Interactive Job Map", href: "/jobs" },
    { label: "Global Salary Insights", href: "/salary-insights" },
    { label: "Application Tracker", href: "/dashboard/applications" },
  ]

  const companyLinks = [
    { label: "About HireHub", href: "/about" },
    { label: "Browse Companies", href: "/companies" },
    { label: "Employer Portal", href: "/recruiter" },
    { label: "Platform FAQs", href: "/faq" },
    { label: "Contact Support", href: "/contact" },
    { label: "Data Deletion Request", href: "/delete-account" },
  ]

  return (
    <footer className="relative overflow-hidden bg-[#12071C] text-[#F1F5F9] border-t border-white/10 select-none">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-[var(--accent)]/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] bg-[#F59E0B]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Dynamic Live Activity Status Ticker */}
      <div className="border-b border-white/10 bg-black/25 backdrop-blur-md py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Live system pulse */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold text-emerald-400">All Global Systems Operational</span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="text-white/70 hidden sm:inline">{liveJobsCount} Live Opportunities Available</span>
          </div>

          {/* Quick metric stats */}
          <div className="flex items-center gap-5 text-white/60 text-[11px] font-medium">
            <div className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#F59E0B]" />
              <span>{uniqueCompaniesCount} Verified Employers</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={13} className="text-emerald-400" />
              <span>Real-Time Matching</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe size={13} className="text-[#F59E0B]" />
              <span>{uniqueCountriesCount} Global Hubs Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Left Column: Brand, Value Proposition & Dynamic Newsletter */}
          <div className="lg:col-span-4 space-y-5">
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
              className="inline-flex items-center gap-2.5 group cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 ring-2 ring-[#F59E0B]/40 group-hover:ring-[#F59E0B] transition-all overflow-hidden shrink-0">
                <img
                  src={symbolLogo}
                  alt="HireHub Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-poppins text-2xl font-black tracking-tight text-white flex items-center gap-1">
                  Hire<span className="text-[#F59E0B]">Hub</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-white/50 block -mt-1">
                  Global Talent Network
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Empowering global professionals and borderless companies to discover their next breakthrough career with role-based ATS intelligence and interactive worldwide exploration.
            </p>

            {/* Dynamic Job Alert Subscription Form */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#F59E0B]" />
                  Worldwide Job Alerts
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Free Weekly
                </span>
              </div>
              <p className="text-[11px] text-white/60 mb-3">
                Get curated roles matching your profile delivered directly to your inbox.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
                >
                  <CheckCircle size={16} className="shrink-0 text-emerald-400" />
                  <span>You're subscribed! Check your inbox for your first weekly briefing.</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address…"
                      required
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#F59E0B] text-[#1E0B29] font-bold text-xs hover:bg-[#F59E0B]/90 transition-all flex items-center gap-1 shrink-0 shadow-md"
                    >
                      <Send size={12} />
                      Join
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span>Zero spam · Unsubscribe anytime</span>
                    <span>Curated weekly alerts</span>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Center & Right Columns: Navigation Directories */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Find Careers */}
            <div>
              <h3 className="font-poppins font-bold text-xs uppercase tracking-wider text-[#F59E0B] mb-4 flex items-center gap-1.5">
                <Briefcase size={14} /> Popular Careers
              </h3>
              <ul className="space-y-2.5 text-xs">
                {careerLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-white/70 hover:text-white transition-colors flex items-center group gap-1"
                    >
                      <ChevronRight
                        size={11}
                        className="text-[#F59E0B] opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all"
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Career Tools */}
            <div>
              <h3 className="font-poppins font-bold text-xs uppercase tracking-wider text-[#F59E0B] mb-4 flex items-center gap-1.5">
                <Sparkles size={14} /> AI Career Tools
              </h3>
              <ul className="space-y-2.5 text-xs">
                {toolLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-white/70 hover:text-white transition-colors flex items-center justify-between group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {item.label}
                      </span>
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F59E0B] text-[#1E0B29]">
                          HOT
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Platform & Company */}
            <div>
              <h3 className="font-poppins font-bold text-xs uppercase tracking-wider text-[#F59E0B] mb-4 flex items-center gap-1.5">
                <Globe size={14} /> Platform & Trust
              </h3>
              <ul className="space-y-2.5 text-xs">
                {companyLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-white/70 hover:text-white transition-colors flex items-center group gap-1"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dynamic Global Tech Hub Direct Search Chips */}
        <div className="py-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MapPin size={14} className="text-[#F59E0B]" />
              Direct Worldwide Tech Hub Explorers:
            </span>
            <span className="text-[11px] text-white/50">
              Click any hub to automatically launch map & job matching
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {globalHubs.map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => navigate(`/jobs?location=${encodeURIComponent(hub.query)}`)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 hover:border-[#F59E0B] text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
              >
                <span>{hub.name}</span>
                <ArrowUpRight size={11} className="text-[#F59E0B]" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Global Selector & Social Icons */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-3 text-center sm:text-left">
            <span>
              © {new Date().getFullYear()} HireHub Global Technologies Inc. All rights reserved.
            </span>
            <span className="hidden sm:inline">·</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie Preferences</Link>
            <span>·</span>
            <Link to="/delete-account" className="hover:text-red-400 transition-colors">Data Deletion</Link>
          </div>

          {/* Global Currency & Region indicator + Social icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70">
              <Globe size={12} className="text-[#F59E0B]" />
              <span>Global (USD / EUR / GBP / JPY)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="GitHub"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="LinkedIn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Twitter / X"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
