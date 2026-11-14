import { useState, useRef, useEffect, useMemo } from "react"
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
  Target,
} from "lucide-react"
import ThemeToggle from "../ui/ThemeToggle"
import Button from "../ui/Button"
import { useAuthStore } from "../../store/authStore"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { useMessageStore } from "../../store/messageStore"
import { useJobStore } from "../../store/jobStore"
import { useNotificationStore } from "../../store/notificationStore"
import { cn } from "../../utils/cn"
import symbolLogo from "../../imports/symbol_only.jpeg"

function formatNotificationTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffSec < 60) return "Just now"
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}h ago`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  } catch {
    return "Recently"
  }
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { savedJobIds } = useSavedJobsStore()
  const { jobs } = useJobStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Real dynamic categories calculated from actual jobs in store
  const jobCategories = useMemo(() => {
    const engCount = jobs.filter((j) => {
      const text = `${j.category || ""} ${j.title || ""} ${(j.skills || []).join(" ")}`.toLowerCase()
      return text.includes("engineer") || text.includes("developer") || text.includes("software")
    }).length

    const designCount = jobs.filter((j) => {
      const text = `${j.category || ""} ${j.title || ""} ${(j.skills || []).join(" ")}`.toLowerCase()
      return text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("product design")
    }).length

    const marketingCount = jobs.filter((j) => {
      const text = `${j.category || ""} ${j.title || ""} ${(j.skills || []).join(" ")}`.toLowerCase()
      return text.includes("marketing") || text.includes("growth") || text.includes("sales")
    }).length

    const financeCount = jobs.filter((j) => {
      const text = `${j.category || ""} ${j.title || ""}`.toLowerCase()
      return text.includes("finance") || text.includes("account") || text.includes("analyst")
    }).length

    const remoteCount = jobs.filter(
      (j) => j.isRemote || j.remoteType === "Remote" || (j.location || "").toLowerCase().includes("remote"),
    ).length

    const internCount = jobs.filter(
      (j) => j.type === "Internship" || (j.title || "").toLowerCase().includes("intern"),
    ).length

    return [
      { label: "Engineering", icon: Code, count: `${engCount} ${engCount === 1 ? "position" : "positions"}` },
      { label: "Design", icon: Palette, count: `${designCount} ${designCount === 1 ? "position" : "positions"}` },
      { label: "Marketing", icon: TrendingUp, count: `${marketingCount} ${marketingCount === 1 ? "position" : "positions"}` },
      { label: "Finance", icon: DollarSign, count: `${financeCount} ${financeCount === 1 ? "position" : "positions"}` },
      { label: "Remote", icon: Globe, count: `${remoteCount} ${remoteCount === 1 ? "position" : "positions"}` },
      { label: "Internships", icon: Star, count: `${internCount} ${internCount === 1 ? "position" : "positions"}` },
    ]
  }, [jobs])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [jobsOpen, setJobsOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const jobsRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const isAuthPage = [
    "/login",
    "/signin",
    "/sign-in",
    "/register",
    "/signup",
    "/sign-up",
    "/forgot-password",
  ].includes(location.pathname)

  const { conversations } = useMessageStore()
  const unreadMsgCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore()
  const unreadNotifCount = unreadCount()

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

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentAuth = useAuthStore.getState()
    const isAuthed = currentAuth.isAuthenticated || !!currentAuth.user
    if (isAuthed) {
      const role = currentAuth.user?.role
      const target =
        role === "admin"
          ? "/admin"
          : role === "recruiter"
            ? "/recruiter"
            : "/dashboard"
      navigate(target)
    } else {
      navigate("/")
    }
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
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-[var(--border)] shrink-0 overflow-hidden p-1">
              <img
                src={symbolLogo}
                alt="HireHub Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-poppins font-extrabold text-xl text-[var(--foreground)] tracking-tight">
              Hire<span className="text-[#F7941D]">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav - Visible on all non-auth pages */}
          {!isAuthPage && (
            <nav className="hidden lg:flex items-center gap-1">
              {/* Jobs Mega Menu */}
              <div ref={jobsRef} className="relative">
                <button
                  onClick={() => setJobsOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    "text-[var(--foreground)] hover:text-[#F7941D] hover:bg-[var(--muted)]",
                    jobsOpen && "text-[#F7941D] bg-[var(--muted)]",
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
                      className="absolute left-0 top-full mt-2 w-[480px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-elevated)] overflow-hidden z-50"
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
                              onClick={() => setJobsOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-[var(--muted)] flex items-center justify-center group-hover:bg-[#F7941D] transition-colors">
                                <cat.icon
                                  size={16}
                                  className="text-[#F7941D] group-hover:text-white transition-colors"
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
                      <div className="px-4 py-3 bg-[var(--muted)]/60 flex items-center justify-between border-t border-[var(--border)]">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {jobs.length} jobs available
                        </span>
                        <Link
                          to="/jobs"
                          onClick={() => setJobsOpen(false)}
                          className="text-xs font-semibold text-[#F7941D] hover:underline flex items-center gap-1"
                        >
                          View all jobs <Zap size={13} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/companies"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[#F7941D] hover:bg-[var(--muted)] transition-colors"
              >
                Companies
              </Link>

              <Link
                to="/ats-checker"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[#F7941D] hover:bg-[var(--muted)] transition-colors"
              >
                ATS Checker
              </Link>

              <Link
                to="/resume-builder"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[#F7941D] hover:bg-[var(--muted)] transition-colors"
              >
                Resume Builder
              </Link>

              <Link
                to="/salaries"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/salaries" || location.pathname === "/salary-insights"
                    ? "text-[#F7941D] font-semibold bg-[var(--muted)]"
                    : "text-[var(--foreground)] hover:text-[#F7941D] hover:bg-[var(--muted)]"
                }`}
              >
                Salary Insights
              </Link>

              {user?.role === "recruiter" && (
                <Link
                  to="/recruiter/talent-search"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-[#F7941D] hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                >
                  Talent Search
                </Link>
              )}

              {!isAuthenticated && (
                <Link
                  to="/about"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:text-[#F7941D] hover:bg-[var(--muted)] transition-colors"
                >
                  About Us
                </Link>
              )}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
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

                {/* Messages Hub (Desktop/Tablet; on phone it is in MobileBottomNav) */}
                <Link
                  to="/messages"
                  title="Live Messages & Interviews"
                  className="hidden sm:flex relative w-9 h-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
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
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadNotifCount > 0 && (
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
                        className="fixed inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-elevated)] overflow-hidden z-50"
                      >
                        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)]/40">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-[var(--foreground)]">
                              Notifications
                            </h3>
                            {unreadNotifCount > 0 && (
                              <span className="text-[10px] bg-[var(--primary)] text-white font-bold px-2 py-0.5 rounded-full">
                                {unreadNotifCount} new
                              </span>
                            )}
                          </div>
                          {unreadNotifCount > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAllAsRead()
                              }}
                              className="text-[11px] text-[var(--primary)] hover:underline font-semibold"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.slice(0, 6).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  markAsRead(n.id)
                                  setNotifOpen(false)
                                  if (n.link) navigate(n.link)
                                }}
                                className={cn(
                                  "p-3.5 hover:bg-[var(--muted)] transition-colors cursor-pointer flex items-start gap-3",
                                  !n.isRead && "bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10"
                                )}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {n.type === "application" ? (
                                    <Briefcase size={15} className="text-[var(--primary)]" />
                                  ) : n.type === "message" ? (
                                    <MessageSquare size={15} className="text-emerald-500" />
                                  ) : (
                                    <Bell size={15} className="text-[var(--primary)]" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className={cn("text-xs text-[var(--foreground)] truncate", !n.isRead ? "font-bold" : "font-medium")}>
                                      {n.title}
                                    </p>
                                    {!n.isRead && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 mt-0.5 leading-snug">
                                    {n.message}
                                  </p>
                                  <p className="text-[10px] text-[var(--muted-foreground)] mt-1 font-medium">
                                    {formatNotificationTime(n.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="block p-3 text-center text-xs font-bold text-[var(--primary)] hover:bg-[var(--muted)] transition-colors border-t border-[var(--border)]"
                        >
                          View all notifications →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile / Account (Always visible, fits comfortably next to notifications) */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-1.5 p-1 sm:pl-1 sm:pr-2.5 sm:py-1 rounded-xl hover:bg-[var(--muted)] transition-colors focus:outline-none"
                    aria-label="Account menu"
                    title={user?.name || "Account"}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U")}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-[var(--foreground)] max-w-[90px] truncate">
                      {user?.name ? user.name.split(" ")[0] : (user?.email?.split("@")[0] || "User")}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "hidden sm:block text-[var(--muted-foreground)] transition-transform duration-200",
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
                        className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-elevated)] overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-[var(--border)]">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {user?.name || user?.email || "User"}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">
                            {user?.email || ""}
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
                              label: "Application Tracker",
                              icon: Target,
                              to: "/tracker",
                            },
                            {
                              label:
                                savedJobIds.length > 0
                                  ? `Saved Jobs (${savedJobIds.length})`
                                  : "Saved Jobs",
                              icon: Bookmark,
                              to: "/saved",
                            },
                            {
                              label: "My Resumes",
                              icon: FileText,
                              to: "/resume-builder",
                            },
                            ...(user?.role === "recruiter"
                              ? [
                                  {
                                    label: "Recruiter Panel",
                                    icon: Building2,
                                    to: "/recruiter",
                                  },
                                ]
                              : []),
                            ...(user?.role === "admin"
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
                            Log Out
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
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Create Account
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

      {/* Mobile Menu - Only shown on non-auth pages; option list only appears AFTER log in / create account */}
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
                  <div className="mb-2 p-3 rounded-2xl bg-[var(--muted)]/60 border border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--foreground)] truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-[10px] text-[var(--primary)] capitalize font-semibold">
                          {user.role} Account
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-xs font-semibold hover:border-[var(--primary)] transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Settings size={12} /> Settings
                    </Link>
                  </div>

                  {/* Mobile Notifications Link */}
                  <Link
                    to="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10 border border-[var(--primary)]/15 mb-1"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={17} className="text-[var(--primary)]" />
                      <span>Notifications</span>
                    </div>
                    {unreadNotifCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[var(--primary)] text-white">
                        {unreadNotifCount} new
                      </span>
                    )}
                  </Link>

                  {[
                    { label: "Find Jobs", to: "/jobs", icon: Briefcase },
                    { label: "Companies", to: "/companies", icon: Building2 },
                    { label: "Live Messages", to: "/messages", icon: MessageSquare },
                    { label: "Skill Tests", to: "/skills", icon: Award },
                    ...(user?.role === "recruiter"
                      ? [{ label: "Talent Search", to: "/recruiter/talent-search", icon: Users }]
                      : []),
                    { label: "ATS Checker", to: "/ats-checker", icon: FileText },
                    { label: "Resume Builder", to: "/resume-builder", icon: FileText },
                    {
                      label: "Salary Insights",
                      to: "/salaries",
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
                        user?.role === "admin"
                          ? "/admin"
                          : user?.role === "recruiter"
                            ? "/recruiter"
                            : "/dashboard"
                      }
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                    >
                      <User size={17} />
                      My Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                    >
                      <Settings size={17} />
                      Settings & Preferences
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1.5 pt-1">
                  <Link
                    to="/jobs"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[#F7941D]"
                  >
                    <Briefcase size={17} /> Find Jobs
                  </Link>
                  <Link
                    to="/companies"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[#F7941D]"
                  >
                    <Building2 size={17} /> Companies
                  </Link>
                  <Link
                    to="/ats-checker"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[#F7941D]"
                  >
                    <FileText size={17} /> ATS Resume Checker
                  </Link>
                  <Link
                    to="/resume-builder"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[#F7941D]"
                  >
                    <FileText size={17} /> Resume Builder
                  </Link>
                  <Link
                    to="/salaries"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[#F7941D]"
                  >
                    <DollarSign size={17} /> Salary Insights
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[#F7941D]"
                  >
                    <Globe size={17} /> About Us
                  </Link>
                  <div className="pt-3 mt-1 flex flex-col gap-2 border-t border-[var(--border)]">
                    <Button variant="secondary" onClick={() => { setMobileOpen(false); navigate("/login"); }}>
                      Log In
                    </Button>
                    <Button variant="primary" onClick={() => { setMobileOpen(false); navigate("/register"); }}>
                      Get Started Free
                    </Button>
                  </div>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
