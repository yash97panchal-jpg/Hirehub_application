import { Link, useLocation } from "react-router-dom"
import { Briefcase, Target, Bookmark, MessageSquare, User, LayoutDashboard } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { useApplicationStore } from "../../store/applicationStore"
import { useMessageStore } from "../../store/messageStore"

export default function MobileBottomNav() {
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const { savedJobIds } = useSavedJobsStore()
  const { applications } = useApplicationStore()
  const { conversations } = useMessageStore()
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)

  // Don't show bottom nav on auth screens
  const isAuthScreen = [
    "/login",
    "/signin",
    "/sign-in",
    "/register",
    "/signup",
    "/sign-up",
    "/forgot-password",
  ].includes(location.pathname)
  if (isAuthScreen) return null

  const isSeeker = !user || user.role === "job_seeker"
  const isRecruiter = user?.role === "recruiter"
  const isAdmin = user?.role === "admin"

  const navItems = [
    {
      label: "Jobs",
      to: "/jobs",
      icon: Briefcase,
      isActive: location.pathname === "/jobs" || location.pathname.startsWith("/jobs/"),
      badge: null,
    },
    {
      label: isRecruiter ? "Applicants" : "Tracker",
      to: isRecruiter ? "/recruiter/applicants" : "/tracker",
      icon: Target,
      isActive:
        location.pathname === "/tracker" ||
        location.pathname === "/applications" ||
        location.pathname === "/dashboard/applications" ||
        location.pathname === "/dashboard/tracker" ||
        location.pathname === "/recruiter/applicants" ||
        location.pathname === "/dashboard/applicants",
      badge: applications.length > 0 ? applications.length : null,
    },
    {
      label: isRecruiter ? "Post Job" : "Saved",
      to: isRecruiter ? "/recruiter/post-job" : "/saved",
      icon: Bookmark,
      isActive:
        location.pathname === "/saved" ||
        location.pathname === "/saved-jobs" ||
        location.pathname === "/dashboard/saved" ||
        location.pathname === "/recruiter/post-job" ||
        location.pathname === "/dashboard/post-job",
      badge: !isRecruiter && savedJobIds.length > 0 ? savedJobIds.length : null,
    },
    {
      label: "Messages",
      to: "/messages",
      icon: MessageSquare,
      isActive: location.pathname === "/messages",
      badge: totalUnread > 0 ? totalUnread : null,
    },
    {
      label: isAuthenticated ? (isAdmin ? "Admin" : isRecruiter ? "Manage" : "Profile") : "Sign In",
      to: isAuthenticated
        ? (isAdmin ? "/admin" : isRecruiter ? "/recruiter" : "/profile")
        : "/login",
      icon: isAuthenticated && (isAdmin || isRecruiter) ? LayoutDashboard : User,
      isActive:
        location.pathname === "/profile" ||
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/admin") ||
        location.pathname.startsWith("/recruiter") ||
        location.pathname.startsWith("/dashboard/recruiter"),
      badge: null,
    },
  ]

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/95 backdrop-blur-xl border-t border-[var(--border)] pb-safe transition-all shadow-[0_-8px_20px_rgba(0,0,0,0.12)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 transition-all group ${
                active
                  ? "text-[var(--primary)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    active ? "bg-[var(--primary)]/15 scale-110" : "group-hover:bg-[var(--muted)]"
                  }`}
                >
                  <Icon size={20} className={active ? "text-[var(--primary)]" : ""} />
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[var(--primary)] text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-[var(--primary)] mt-0.5 animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
