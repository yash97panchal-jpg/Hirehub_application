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
  Bookmark,
  MessageSquare,
  Award,
} from "lucide-react"
import ThemeToggle from "../ui/ThemeToggle"
import Button from "../ui/Button"
import LanguageSwitcher from "./LanguageSwitcher"
import { useAuthStore } from "../../store/authStore"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { useMessageStore } from "../../store/messageStore"
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
  const { savedJobIds } = useSavedJobsStore()
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

  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname)

  const { conversations } = useMessageStore()
  const unreadMsgCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)

  // Keyboard shortcut listener: Press "/" to focus or navigate to Jobs Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        e.key === "/" &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        !target.isContentEditable
      ) {
        e.preventDefault()
        navigate("/jobs")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigate])

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

          {/* Desktop Nav - Options list only shows AFTER log in / sign up and NEVER on auth pages */}
          {isAuthenticated && user && !isAuthPage && (
            <nav className="hidden lg:flex items-center gap-1">
              {/* Jobs Mega Menu */}
              <div ref={jobsRef} className="relative">
                <button
                  onClick={() => setJobsOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
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
                              <div className="w-9 h-9 rounded-lg bg-[var(--muted)] flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                                <cat.icon
                                  size={16}
                                  className="text-[var(--primary)] group-hover:text-[#180C22] transition-colors"
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
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
              >
                Companies
              </Link>
              <Link
                to="/skills"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
              >
                Skill Tests
              </Link>
              {user?.role === "recruiter" && (
                <Link
                  to="/recruiter/talent-search"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors font-semibold"
                >
                  Talent Search
                </Link>
              )}
              <Link
                to="/pricing"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/ats-checker"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
              >
                ATS Checker
              </Link>
              <Link
                to="/resume-builder"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
              >
                Resume Builder
              </Link>
              <Link
                to="/salary-insights"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
              >
                Salaries
              </Link>
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                {/* Search icon */}
                <button
                  onClick={() => navigate("/jobs")}
                  title="Search Jobs (Press /)"
                  className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                >
                  <Search size={18} />
                </button>

                {/* Messages Hub */}
                <Link
                  to="/messages"
                  title="Live Messages & Interviews"
                  className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                >
                  <MessageSquare size={18} />
                  {unreadMsgCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary)] rounded-full ring-2 ring-[var(--card)]" />
                  )}
                </Link>

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
                              label:
                                savedJobIds.length > 0
                                  ? `Saved Jobs (${savedJobIds.length})`
                                  : "Saved Jobs",
                              icon: Bookmark,
                              to: "/dashboard/saved",
                            },
                            {
                              label: "My Resumes",
                              icon: FileText,
                              to: "/resume-builder",
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
            ) : !isAuthPage ? (
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
            ) : null}

            {/* Mobile menu button (Hidden on auth pages) */}
            {!isAuthPage && (
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only shown on non-auth pages; option list only appears AFTER login/signup */}
      <AnimatePresence>
        {!isAuthPage && mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[var(--card)] border-t border-[var(--border)] overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {isAuthenticated && user ? (
                <>
                  {[
                    { label: "Find Jobs", to: "/jobs", icon: Briefcase },
                    { label: "Companies", to: "/companies", icon: Building2 },
                    { label: "Live Messages", to: "/messages", icon: MessageSquare },
                    { label: "Skill Tests", to: "/skills", icon: Award },
                    { label: "Pricing", to: "/pricing", icon: DollarSign },
                    ...(user.role === "recruiter"
                      ? [{ label: "Talent Search", to: "/recruiter/talent-search", icon: Users }]
                      : []),
                    { label: "ATS Checker", to: "/ats-checker", icon: FileText },
                    { label: "Resume Builder", to: "/resume-builder", icon: FileText },
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

                  <div className="mt-2 pt-2 border-t border-[var(--border)]">
                    <Link
                      to={
                        user.role === "admin"
                          ? "/admin"
                          : user.role === "recruiter"
                            ? "/recruiter"
                            : "/dashboard"
                      }
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                    >
                      <User size={17} />
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
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
