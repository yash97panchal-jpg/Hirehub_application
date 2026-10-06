import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Briefcase,
  Building2,
  FileText,
  BarChart3,
  BookOpen,
  LogOut,
  User,
  Settings,
  Star,
  Zap,
  Globe,
  Code,
  Palette,
  TrendingUp,
  DollarSign,
  Users,
  Shield,
  MessageSquare,
  Bookmark,
} from "lucide-react"
import ThemeToggle from "../ui/ThemeToggle"
import Button from "../ui/Button"
import { useAuthStore } from "../../store/authStore"
import { mockNotifications } from "../../data/mockData"
import { cn } from "../../utils/cn"
import symbolLogo from "../../imports/symbol_only.jpeg"

const jobCategories = [
  { label: "Engineering", icon: Code, count: "4.2k jobs" },
  { label: "Design", icon: Palette, count: "1.8k jobs" },
  { label: "Marketing", icon: TrendingUp, count: "1.4k jobs" },
  { label: "Finance", icon: DollarSign, count: "720 jobs" },
  { label: "Remote", icon: Globe, count: "3.1k jobs" },
  { label: "Internships", icon: Star, count: "890 jobs" },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [jobsOpen, setJobsOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const jobsRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (jobsRef.current && !jobsRef.current.contains(e.target as Node))
        setJobsOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setJobsOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.18 },
    },
    exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.12 } },
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-sm"
          : "bg-[var(--card)]/60 backdrop-blur-md border-b border-[var(--border)]/50",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-[var(--border)] shrink-0 overflow-hidden">
              <img
                src={symbolLogo}
                alt="HireHub Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="font-poppins font-bold text-xl text-[var(--foreground)]">
              Hire<span className="text-[var(--primary)]">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Jobs Mega Menu */}
            <div ref={jobsRef} className="relative">
              <button
                onClick={() => setJobsOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]",
                  jobsOpen && "text-[var(--primary)] bg-[var(--muted)]",
                )}
              >
                Find Jobs
                <ChevronDown
                  size={15}
                  className={cn(
                    "transition-transform duration-200",
                    jobsOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {jobsOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-0 top-full mt-2 w-[480px] rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-elevated)] overflow-hidden"
                  >
                    <div className="p-4">
                      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mb-3">
                        Browse by Category
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {jobCategories.map((cat) => (
                          <Link
                            key={cat.label}
                            to={`/jobs?category=${cat.label.toLowerCase()}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-[var(--muted)]  flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                              <cat.icon
                                size={16}
                                className="text-[var(--primary)] group-hover:text-white transition-colors"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--foreground)]">
                                {cat.label}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {cat.count}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-[var(--muted)] flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        12,400+ jobs available
                      </span>
                      <Link
                        to="/jobs"
                        className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                      >
                        View all <Zap size={13} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/companies"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
            >
              Companies
            </Link>
            <Link
              to="/internships"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
            >
              Internships
            </Link>
            <Link
              to="/ats-checker"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
            >
              ATS Checker
            </Link>
            <Link
              to="/roadmap"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
            >
              Roadmap
            </Link>
            <Link
              to="/salary-insights"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
            >
              Salaries
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                {/* Search icon */}
                <button
                  onClick={() => navigate("/jobs")}
                  className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                >
                  <Search size={18} />
                </button>

                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--card)]" />
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-elevated)] overflow-hidden"
                      >
                        <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
                          <h3 className="font-semibold text-sm text-[var(--foreground)]">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
                          {mockNotifications.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                "p-4 hover:bg-[var(--muted)] transition-colors cursor-pointer",
                                !n.isRead && "bg-[var(--muted)] ",
                              )}
                            >
                              <p className="text-sm font-medium text-[var(--foreground)]">
                                {n.title}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                {n.message}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                        <Link
                          to="/notifications"
                          className="block p-3 text-center text-sm font-semibold text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                        >
                          View all notifications
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[var(--foreground)] max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-[var(--muted-foreground)] transition-transform duration-200",
                        profileOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-elevated)] overflow-hidden"
                      >
                        <div className="p-3 border-b border-[var(--border)]">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {user.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-1.5">
                          {[
                            { label: "My Profile", icon: User, to: "/profile" },
                            {
                              label: "Dashboard",
                              icon: BarChart3,
                              to: "/dashboard",
                            },
                            {
                              label: "Saved Jobs",
                              icon: Bookmark,
                              to: "/dashboard/saved",
                            },
                            {
                              label: "My Resumes",
                              icon: FileText,
                              to: "/dashboard/resumes",
                            },
                            {
                              label: "Messages",
                              icon: MessageSquare,
                              to: "/messages",
                            },
                            ...(user.role === "recruiter"
                              ? [
                                  {
                                    label: "Recruiter Panel",
                                    icon: Building2,
                                    to: "/recruiter",
                                  },
                                ]
                              : []),
                            ...(user.role === "admin"
                              ? [
                                  {
                                    label: "Admin Panel",
                                    icon: Shield,
                                    to: "/admin",
                                  },
                                ]
                              : []),
                            {
                              label: "Settings",
                              icon: Settings,
                              to: "/settings",
                            },
                          ].map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                            >
                              <item.icon size={15} />
                              {item.label}
                            </Link>
                          ))}
                          <hr className="my-1 border-[var(--border)]" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[var(--card)] border-t border-[var(--border)] overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {[
                { label: "Find Jobs", to: "/jobs", icon: Briefcase },
                { label: "Companies", to: "/companies", icon: Building2 },
                { label: "Internships", to: "/internships", icon: Star },
                { label: "ATS Checker", to: "/ats-checker", icon: FileText },
                { label: "Roadmap", to: "/roadmap", icon: BookOpen },
                {
                  label: "Salary Insights",
                  to: "/salary-insights",
                  icon: DollarSign,
                },
                { label: "Career Tips", to: "/blog", icon: BookOpen },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/register")}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
