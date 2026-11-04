import { useMemo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Briefcase,
  Bookmark,
  FileText,
  Bell,
  TrendingUp,
  CheckCircle,
  Clock,
  Eye,
  Star,
  ArrowRight,
  User,
  BarChart3,
  Zap,
  ChevronRight,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../store/authStore"
import { mockNotifications, mockJobs } from "../../data/mockData"
import { useJobStore } from "../../store/jobStore"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { useApplicationStore } from "../../store/applicationStore"
import { isLocalhost } from "../../utils/env"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import ProfileStrengthRing from "../../components/dashboard/ProfileStrengthRing"
import { getCompanyRealLogo } from "../../data/companyLogos"

const applicationStats = [
  {
    label: "Applied",
    count: 12,
    icon: Briefcase,
    color: "var(--primary)",
    bg: "bg-[var(--muted)] ",
  },
  {
    label: "Viewed",
    count: 8,
    icon: Eye,
    color: "#F59E0B",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    label: "Shortlisted",
    count: 3,
    icon: Star,
    color: "#22C55E",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    label: "Interviews",
    count: 1,
    icon: CheckCircle,
    color: "#8B5CF6",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
]



const statusVariant: Record<string, "success" | "warning" | "primary" | "default"> =
  {
    Shortlisted: "success",
    Interview: "primary",
    Viewed: "warning",
    Applied: "default",
    Offered: "success",
    Rejected: "error" as any,
  }

export default function UserDashboard() {
  const { user, logout } = useAuthStore()
  const { jobs: storeJobs } = useJobStore()
  const { savedJobIds } = useSavedJobsStore()
  const { applications: storeApplications } = useApplicationStore()

  // Real candidate applications from applicationStore or safe fallback on localhost
  const recentApplications = useMemo(() => {
    if (storeApplications && storeApplications.length > 0) {
      return storeApplications
        .filter((a) => a && a.job)
        .slice(0, 3)
        .map((a) => ({
          id: a.id,
          job: a.job,
          status: a.status || "Applied",
          appliedAt: a.appliedAt || new Date().toISOString(),
        }))
    }
    if (isLocalhost() && storeJobs && storeJobs.length >= 3) {
      return [
        { id: "demo-1", job: storeJobs[0], status: "Shortlisted" as const, appliedAt: "2026-09-28" },
        { id: "demo-2", job: storeJobs[1], status: "Viewed" as const, appliedAt: "2026-09-25" },
        { id: "demo-3", job: storeJobs[2], status: "Applied" as const, appliedAt: "2026-09-22" },
      ]
    }
    return []
  }, [storeApplications, storeJobs])

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)]">
              Welcome back, {user?.name ? user.name.split(" ")[0] : "Candidate"} 👋
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Here's what's happening with your job search.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                logout()
                toast.success("Signed out successfully.")
                window.location.href = "/"
              }}
              className="text-red-500 border-red-500/30 hover:bg-red-500/10 font-bold"
            >
              <LogOut size={15} /> Sign out
            </Button>
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/jobs")}
            >
              Find Jobs <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>

        {/* Profile Strength */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] rounded-2xl p-5 mb-6 text-[#180C22]"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User size={18} />
                <span className="font-semibold">
                  Profile Strength: {user?.profileCompletion || 75}%
                </span>
              </div>
              <p className="text-[#180C22]/80 text-sm">
                Complete your profile to get 3× more recruiter views.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ProfileStrengthRing
                progress={user?.profileCompletion || 75}
                color="#180C22"
              />
              <Link
                to="/profile"
                className="text-sm font-bold text-[#F1F5F9] bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {applicationStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <p className="font-poppins text-3xl font-bold text-[var(--foreground)]">
                {stat.count}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins font-bold text-xl text-[var(--foreground)]">
                Recent Applications
              </h2>
              <Link
                to="/dashboard/applications"
                className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {recentApplications.length === 0 ? (
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 text-center shadow-[var(--shadow-card)]">
                <FileText size={36} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
                <p className="text-sm font-semibold text-[var(--foreground)]">No applications submitted yet</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-4">Explore thousands of open positions and apply directly.</p>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Browse Jobs <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-card)]">
                {recentApplications.map((app, i) => (
                  <div
                    key={app.id || i}
                    className={`p-4 flex items-center gap-4 ${
                      i < recentApplications.length - 1
                        ? "border-b border-[var(--border)]"
                        : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-[var(--border)] p-1 flex items-center justify-center font-bold text-[var(--primary)] shadow-xs">
                      {app.job?.company?.name ? (
                        <img
                          src={getCompanyRealLogo(app.job?.company?.name, app.job?.company?.website, app.job?.company?.logo)}
                          alt={app.job?.company?.name || "Company"}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = getCompanyRealLogo(app.job?.company?.name || "Company")
                          }}
                        />
                      ) : (
                        <span>{app.job?.company?.name?.charAt(0) || "J"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                        {app.job?.title || "Application"}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {app.job?.company?.name || "Company"} · {app.job?.location || "Remote"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant={statusVariant[app.status] || "default"}
                        size="sm"
                      >
                        {app.status}
                      </Badge>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {app.appliedAt
                          ? `${Math.max(0, Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / 86400000))}d ago`
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Jobs */}
            <div className="flex items-center justify-between mt-2">
              <h2 className="font-poppins font-bold text-xl text-[var(--foreground)]">
                Recommended for You
              </h2>
              <Link
                to="/jobs"
                className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {storeJobs.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--muted-foreground)] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                  No recommended jobs right now. Check back soon!
                </div>
              ) : (
                storeJobs.slice(0, 2).map((job) => (
                  <div
                    key={job.id}
                    className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 hover:border-[var(--primary)] transition-colors shadow-[var(--shadow-card)]"
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-[var(--border)] p-1 flex items-center justify-center font-bold text-[var(--primary)] shadow-xs">
                      {job.company?.name ? (
                        <img
                          src={getCompanyRealLogo(job.company.name, job.company.website, job.company.logo)}
                          alt={job.company.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = getCompanyRealLogo(job.company.name, job.company.website)
                          }}
                        />
                      ) : (
                        <span>{job.company?.name?.charAt(0) || "J"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate block"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {job.company?.name || "Company"} · {job.type}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {job.salaryMin && (
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          ${(job.salaryMin / 1000).toFixed(0)}k+
                        </p>
                      )}
                      <Badge variant="accent" size="sm">
                        <Zap size={9} className="mr-0.5" />
                        Match
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Notifications */}
            {(() => {
              const notifs = isLocalhost() ? mockNotifications : []
              const unreadCount = notifs.filter((n) => !n.isRead).length
              return (
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {notifs.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
                        No notifications yet.
                      </p>
                    ) : (
                      notifs.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl ${
                            !n.isRead
                              ? "bg-[var(--muted)] dark:bg-[var(--accent)]/40"
                              : "bg-[var(--muted)]"
                          }`}
                        >
                          <p className="text-xs font-semibold text-[var(--foreground)]">
                            {n.title}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Quick Actions */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-poppins font-semibold text-[var(--foreground)] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  {
                    label: "Check ATS Score",
                    icon: TrendingUp,
                    to: "/ats-checker",
                    color: "text-[var(--primary)]",
                  },
                  {
                    label: "Build Resume",
                    icon: FileText,
                    to: "/resume-builder",
                    color: "text-green-500",
                  },
                  {
                    label:
                      savedJobIds.length > 0
                        ? `Saved Jobs (${savedJobIds.length})`
                        : "Saved Jobs",
                    icon: Bookmark,
                    to: "/dashboard/saved",
                    color: "text-yellow-500",
                  },
                  {
                    label: "Job Alerts",
                    icon: Bell,
                    to: "/dashboard/alerts",
                    color: "text-purple-500",
                  },
                  {
                    label: "Salary Insights",
                    icon: BarChart3,
                    to: "/salary-insights",
                    color: "text-orange-500",
                  },
                  {
                    label: "Account Settings",
                    icon: SettingsIcon,
                    to: "/settings",
                    color: "text-blue-500",
                  },
                ].map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--muted)] transition-colors group"
                  >
                    <action.icon size={16} className={action.color} />
                    <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                      {action.label}
                    </span>
                    <ChevronRight
                      size={13}
                      className="ml-auto text-[var(--muted-foreground)]"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
