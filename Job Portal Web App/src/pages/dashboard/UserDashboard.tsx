import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  Check,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../store/authStore"
import { mockNotifications } from "../../data/mockData"
import { useJobStore } from "../../store/jobStore"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { useApplicationStore } from "../../store/applicationStore"
import { isLocalhost } from "../../utils/env"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import ProfileStrengthRing from "../../components/dashboard/ProfileStrengthRing"
import { getCompanyRealLogo } from "../../data/companyLogos"
import type { ApplicationStatus } from "../../types"

type DashboardTab = "all" | "interview" | "shortlisted" | "recommended" | "saved"

interface CandidateDashboardApp {
  id: string
  job: any
  status: ApplicationStatus
  appliedAt: string
}

const statusVariant: Record<string, "success" | "warning" | "primary" | "default"> = {
  Shortlisted: "success",
  Interview: "primary",
  Viewed: "warning",
  Applied: "default",
  Offered: "success",
  Rejected: "default",
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { jobs: storeJobs } = useJobStore()
  const { savedJobIds, toggleSaveJob, isJobSaved } = useSavedJobsStore()
  const { applications: storeApplications } = useApplicationStore()

  const [activeTab, setActiveTab] = useState<DashboardTab>("all")
  const [metricFilter, setMetricFilter] = useState<ApplicationStatus | "all">("all")
  const [candidateStatus, setCandidateStatus] = useState<"active" | "interviewing" | "open">("active")

  // Candidate applications with fallback demo items
  const allApplications: CandidateDashboardApp[] = useMemo(() => {
    if (storeApplications && storeApplications.length > 0) {
      return storeApplications
        .filter((a) => a && a.job)
        .map((a) => ({
          id: a.id,
          job: a.job,
          status: a.status,
          appliedAt: a.appliedAt,
        }))
    }
    if (isLocalhost() && storeJobs && storeJobs.length >= 3) {
      return [
        {
          id: "demo-app-1",
          job: storeJobs[0],
          status: "Interview",
          appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "demo-app-2",
          job: storeJobs[1],
          status: "Shortlisted",
          appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "demo-app-3",
          job: storeJobs[2],
          status: "Viewed",
          appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
    }
    return []
  }, [storeApplications, storeJobs])

  // Dynamic application counts
  const countApplied = allApplications.length
  const countViewed = allApplications.filter((a) => a.status === "Viewed" || a.status === "Shortlisted" || a.status === "Interview").length
  const countShortlisted = allApplications.filter((a) => a.status === "Shortlisted").length
  const countInterviews = allApplications.filter((a) => a.status === "Interview").length

  const stats = [
    {
      id: "all" as const,
      label: "Applications Sent",
      count: countApplied || 12,
      subtext: "+3 this week",
      icon: Briefcase,
      color: "#F59E0B",
      bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-500",
      border: "border-amber-500/30",
    },
    {
      id: "Viewed" as const,
      label: "Profile Views",
      count: countViewed || 8,
      subtext: "72% conversion",
      icon: Eye,
      color: "#3B82F6",
      bg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-500",
      border: "border-blue-500/30",
    },
    {
      id: "Shortlisted" as const,
      label: "Shortlisted Roles",
      count: countShortlisted || 3,
      subtext: "Top 5% candidate",
      icon: Star,
      color: "#10B981",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500",
      border: "border-emerald-500/30",
    },
    {
      id: "Interview" as const,
      label: "Interviews Scheduled",
      count: countInterviews || 1,
      subtext: "Next: Tomorrow 2 PM",
      icon: Calendar,
      color: "#8B5CF6",
      bg: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-500",
      border: "border-purple-500/30",
    },
  ]

  // Filtered applications based on tabs & metric cards
  const displayedApplications = useMemo(() => {
    let list = allApplications
    if (metricFilter !== "all") {
      list = list.filter((a) => a.status === metricFilter)
    }
    if (activeTab === "interview") {
      list = list.filter((a) => a.status === "Interview")
    } else if (activeTab === "shortlisted") {
      list = list.filter((a) => a.status === "Shortlisted")
    }
    return list
  }, [allApplications, metricFilter, activeTab])

  // Saved jobs list
  const savedJobsList = useMemo(() => {
    return storeJobs.filter((j) => savedJobIds.includes(j.id))
  }, [storeJobs, savedJobIds])

  // Recommended jobs with high AI match
  const recommendedJobs = useMemo(() => {
    return storeJobs.slice(0, 4)
  }, [storeJobs])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ============================================================= */}
        {/* 1. HERO & CANDIDATE GREETING HEADER                           */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-elevated)] relative overflow-hidden"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                  <Sparkles size={14} /> Career Command Center
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>

                {/* Candidate Availability Status Picker */}
                <div className="inline-flex items-center bg-[var(--muted)] p-0.5 rounded-full text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCandidateStatus("active")}
                    className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1.5 ${
                      candidateStatus === "active"
                        ? "bg-emerald-500 text-white shadow-xs font-bold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Actively Seeking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCandidateStatus("interviewing")}
                    className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1.5 ${
                      candidateStatus === "interviewing"
                        ? "bg-purple-600 text-white shadow-xs font-bold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>Interviewing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCandidateStatus("open")}
                    className={`px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1.5 ${
                      candidateStatus === "open"
                        ? "bg-amber-500 text-white shadow-xs font-bold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span>Open to Offers</span>
                  </button>
                </div>
              </div>

              <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--foreground)] tracking-tight">
                {greeting}, {user?.name ? user.name.split(" ")[0] : "Candidate"} 👋
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
                Track your active recruiter pipelines, benchmark resume ATS matching, and discover global opportunities tailored to your technical skills.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/jobs")}
                className="font-bold flex-1 sm:flex-initial shadow-md"
              >
                <Search size={15} className="mr-1.5" /> Find Jobs
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/ats-checker")}
                className="font-semibold flex-1 sm:flex-initial"
              >
                <TrendingUp size={15} className="mr-1.5 text-[var(--primary)]" /> Scan ATS
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  logout()
                  toast.success("Logged out successfully.")
                  navigate("/login")
                }}
                className="text-red-500 hover:bg-red-500/10 font-semibold"
                title="Log Out of your account"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ============================================================= */}
        {/* 2. PROFILE STRENGTH & RECRUITER READINESS BANNER             */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-lg border border-amber-400/20"
          style={{
            background:
              "linear-gradient(135deg, #1C0A28 0%, #2E103F 45%, #B45309 100%)",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <span className="font-bold text-sm text-amber-200 uppercase tracking-wider">
                  Profile Strength: {user?.profileCompletion || 80}% Complete
                </span>
              </div>
              <h3 className="font-poppins text-lg sm:text-xl font-bold text-white">
                Profiles with 85%+ completion receive 3.4× more recruiter interviews
              </h3>

              {/* Checklist Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md flex items-center gap-1.5 text-white/90">
                  <Check size={13} className="text-emerald-400" /> Verified Credentials
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md flex items-center gap-1.5 text-white/90">
                  <Check size={13} className="text-emerald-400" /> Resume Attached
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md flex items-center gap-1.5 text-white/90">
                  <Check size={13} className="text-emerald-400" /> Technical Skills
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-semibold flex items-center gap-1.5">
                  <Sparkles size={13} /> Add Portfolio (+15%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-end">
              <div className="hidden sm:block">
                <ProfileStrengthRing
                  progress={user?.profileCompletion || 80}
                  color="#F59E0B"
                />
              </div>
              <Link
                to="/profile"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap text-center flex-1 sm:flex-initial"
              >
                Complete Profile →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ============================================================= */}
        {/* 3. INTERACTIVE STATS CARDS (Clickable Filters)                 */}
        {/* ============================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-poppins text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Application Pipeline Overview
            </h2>
            {metricFilter !== "all" && (
              <button
                type="button"
                onClick={() => setMetricFilter("all")}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>Reset metric filter</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => {
              const isSelected = metricFilter === stat.id
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => setMetricFilter(isSelected ? "all" : (stat.id as any))}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[var(--card)] border cursor-pointer transition-all shadow-[var(--shadow-card)] hover:shadow-lg ${
                    isSelected
                      ? `ring-2 ring-amber-500 border-amber-500 shadow-amber-500/10`
                      : `border-[var(--border)] hover:border-slate-300 dark:hover:border-white/20`
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-2xl ${stat.bg} flex items-center justify-center`}
                    >
                      <Icon size={20} />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="font-poppins text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                    {stat.count}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] mt-0.5">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1 font-medium">
                    {stat.subtext}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ============================================================= */}
        {/* 4. MAIN CENTRAL CONTENT & RIGHT SIDEBAR                       */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8 COLS: Segmented Content & Application Cards */}
          <div className="lg:col-span-8 space-y-5">
            {/* Segmented Control Tabs */}
            <div className="p-1 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-1 overflow-x-auto shadow-xs no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all")
                  setMetricFilter("all")
                }}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "all"
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Briefcase size={14} />
                <span>All Roles</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {allApplications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("interview")}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "interview"
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Calendar size={14} />
                <span>Interviews</span>
                {countInterviews > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {countInterviews}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("shortlisted")}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "shortlisted"
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Star size={14} />
                <span>Shortlisted</span>
                {countShortlisted > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {countShortlisted}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("recommended")}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "recommended"
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Zap size={14} />
                <span>AI Matches</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "saved"
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Bookmark size={14} />
                <span>Saved</span>
                {savedJobIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {savedJobIds.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB CONTENT: Applications List */}
            {activeTab !== "recommended" && activeTab !== "saved" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                    {activeTab === "interview"
                      ? "Active Interviews"
                      : activeTab === "shortlisted"
                        ? "Shortlisted Applications"
                        : "Application Tracker Pipeline"}
                  </h3>
                  <Link
                    to="/dashboard/applications"
                    className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    View All Tracking <ChevronRight size={14} />
                  </Link>
                </div>

                {displayedApplications.length === 0 ? (
                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-10 text-center shadow-[var(--shadow-card)]">
                    <FileText size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
                    <h4 className="font-poppins font-bold text-base text-[var(--foreground)]">
                      No applications match this filter
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1 mb-5">
                      Explore positions matching your skillset and submit easy applications.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveTab("all")
                        setMetricFilter("all")
                        navigate("/jobs")
                      }}
                      className="font-bold"
                    >
                      Browse Open Positions <ArrowRight size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {displayedApplications.map((app) => {
                      const stages = ["Applied", "Viewed", "Shortlisted", "Interview"]
                      const currentStageIdx = stages.indexOf(app.status) >= 0 ? stages.indexOf(app.status) : 0

                      return (
                        <div
                          key={app.id}
                          className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] hover:border-amber-500/50 transition-all space-y-4"
                        >
                          {/* Card Top: Company info & Status */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-[var(--border)] p-1 flex items-center justify-center font-bold text-[var(--primary)] shadow-xs">
                                {app.job?.company?.name ? (
                                  <img
                                    src={getCompanyRealLogo(
                                      app.job?.company?.name,
                                      app.job?.company?.website,
                                      app.job?.company?.logo,
                                    )}
                                    alt={app.job?.company?.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = getCompanyRealLogo(app.job?.company?.name || "Company")
                                    }}
                                  />
                                ) : (
                                  <span>{app.job?.company?.name?.charAt(0) || "J"}</span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <Link
                                  to={`/jobs/${app.job?.id}`}
                                  className="font-poppins font-bold text-base text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate block"
                                >
                                  {app.job?.title || "Applied Role"}
                                </Link>
                                <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-2 mt-0.5">
                                  <span className="font-medium text-[var(--foreground)]">
                                    {app.job?.company?.name || "Verified Employer"}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {app.job?.location || "Remote"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <Badge variant={statusVariant[app.status] || "default"} size="sm">
                                {app.status}
                              </Badge>
                              <span className="text-[11px] text-[var(--muted-foreground)]">
                                {app.appliedAt
                                  ? `${Math.max(
                                      0,
                                      Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / 86400000),
                                    )}d ago`
                                  : "Recently"}
                              </span>
                            </div>
                          </div>

                          {/* Interactive 4-Stage Application Timeline Stepper */}
                          <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)]/70">
                            <div className="grid grid-cols-4 gap-1 relative">
                              {stages.map((stage, sIdx) => {
                                const isPassed = sIdx <= currentStageIdx
                                const isCurrent = sIdx === currentStageIdx

                                return (
                                  <div key={stage} className="text-center space-y-1 relative">
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        isPassed
                                          ? isCurrent
                                            ? "bg-amber-500 shadow-xs"
                                            : "bg-emerald-500"
                                          : "bg-slate-200 dark:bg-white/10"
                                      }`}
                                    />
                                    <p
                                      className={`text-[10px] font-bold ${
                                        isPassed
                                          ? isCurrent
                                            ? "text-amber-600 dark:text-amber-400 font-extrabold"
                                            : "text-emerald-600 dark:text-emerald-400"
                                          : "text-[var(--muted-foreground)]"
                                      }`}
                                    >
                                      {stage}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-[11px] text-[var(--muted-foreground)]">
                              Mode: In-App Direct Apply
                            </span>

                            <div className="flex items-center gap-2">
                              <Link
                                to="/messages"
                                className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] font-semibold text-[var(--foreground)] flex items-center gap-1 transition-colors"
                              >
                                <MessageSquare size={13} /> Message
                              </Link>
                              <Link
                                to={`/jobs/${app.job?.id}`}
                                className="px-3 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-bold text-white flex items-center gap-1 transition-colors shadow-xs"
                              >
                                Details <ExternalLink size={12} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: AI Recommended Jobs */}
            {activeTab === "recommended" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                    AI Match Recommendations
                  </h3>
                  <Link
                    to="/jobs"
                    className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    Explore all jobs <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedJobs.map((job) => {
                    const isSaved = isJobSaved(job.id)
                    return (
                      <div
                        key={job.id}
                        className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] hover:border-amber-500 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-[var(--border)] p-1 flex items-center justify-center font-bold text-[var(--primary)] shadow-xs">
                              {job.company?.name ? (
                                <img
                                  src={getCompanyRealLogo(job.company.name, job.company.website, job.company.logo)}
                                  alt={job.company.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span>{job.company?.name?.charAt(0) || "J"}</span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                toggleSaveJob(job.id)
                                toast.success(isSaved ? "Removed from saved" : "Job saved!")
                              }}
                              className={`p-2 rounded-xl transition-colors ${
                                isSaved
                                  ? "text-amber-500 bg-amber-500/10"
                                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                              }`}
                            >
                              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                          </div>

                          <div>
                            <Link
                              to={`/jobs/${job.id}`}
                              className="font-poppins font-bold text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-1"
                            >
                              {job.title}
                            </Link>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {job.company?.name} • {job.location}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Zap size={11} /> 96% Match
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              ${job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}k+` : "Competitive"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between">
                          <span className="text-[11px] text-[var(--muted-foreground)] capitalize">
                            {job.type}
                          </span>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs shadow-xs"
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Saved Jobs */}
            {activeTab === "saved" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                    Saved Opportunities ({savedJobsList.length})
                  </h3>
                  <Link
                    to="/dashboard/saved"
                    className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    Manage saved <ChevronRight size={14} />
                  </Link>
                </div>

                {savedJobsList.length === 0 ? (
                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-10 text-center shadow-[var(--shadow-card)]">
                    <Bookmark size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
                    <h4 className="font-poppins font-bold text-base text-[var(--foreground)]">
                      No saved jobs yet
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1 mb-5">
                      Bookmark open roles while searching to review or apply to them later.
                    </p>
                    <Button variant="primary" size="sm" onClick={() => navigate("/jobs")} className="font-bold">
                      Explore Open Positions <ArrowRight size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedJobsList.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-[var(--border)] p-1 flex items-center justify-center font-bold text-[var(--primary)]">
                            {job.company?.name ? (
                              <img
                                src={getCompanyRealLogo(job.company.name, job.company.website, job.company.logo)}
                                alt={job.company.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span>{job.company?.name?.charAt(0) || "J"}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="font-bold text-sm text-[var(--foreground)] hover:text-[var(--primary)] truncate block"
                            >
                              {job.title}
                            </Link>
                            <p className="text-xs text-[var(--muted-foreground)] truncate">
                              {job.company?.name} • {job.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="font-bold text-xs"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT 4 COLS: Widgets & Career Toolkit */}
          <div className="lg:col-span-4 space-y-5">
            {/* Widget 1: ATS Resume Score Benchmark */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                      ATS Resume Score
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Algorithm Readiness
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                  88 / 100
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--muted-foreground)]">Keyword Matching</span>
                  <span className="font-bold text-[var(--foreground)]">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: "92%" }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {["React", "TypeScript", "Node.js", "Cloud Architecture"].map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--muted)] text-[var(--foreground)] font-medium"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>

              <Link
                to="/ats-checker"
                className="w-full py-2 px-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                Run In-Depth ATS Scan <ArrowRight size={13} />
              </Link>
            </div>

            {/* Widget 2: Upcoming Interviews & Events */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                      Upcoming Schedule
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Confirmed video screens
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    System Design Technical Round
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white">
                    Tomorrow
                  </span>
                </div>
                <p className="text-xs text-[var(--foreground)] font-medium">
                  Google Infrastructure Core Team
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--muted-foreground)]">
                  <span>⏰ 2:00 PM – 3:00 PM EST</span>
                  <span className="text-blue-500 font-semibold cursor-pointer hover:underline">
                    Join Video Call
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 3: Quick Career Tools Navigation */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] space-y-3">
              <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                Career Acceleration Tools
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Resume Builder", to: "/resume-builder", icon: FileText, color: "text-emerald-500" },
                  { label: "Interactive Map", to: "/jobs?view=map", icon: MapPin, color: "text-blue-500" },
                  { label: "Salary Insights", to: "/salary-insights", icon: BarChart3, color: "text-amber-500" },
                  { label: "Job Alerts", to: "/dashboard/alerts", icon: Bell, color: "text-purple-500" },
                ].map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Link
                      key={tool.label}
                      to={tool.to}
                      className="p-3 rounded-2xl bg-[var(--background)] hover:bg-[var(--muted)] border border-[var(--border)] transition-all flex flex-col items-center text-center group"
                    >
                      <Icon size={20} className={`${tool.color} mb-1.5 transition-transform group-hover:scale-110`} />
                      <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        {tool.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Widget 4: Recent Alerts / Activity */}
            {(() => {
              const notifs = isLocalhost() ? mockNotifications.slice(0, 3) : []
              if (notifs.length === 0) return null

              return (
                <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                      Recent Activity
                    </h3>
                    <Link to="/notifications" className="text-xs text-[var(--primary)] hover:underline">
                      View all
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {notifs.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)]/70 text-xs space-y-1"
                      >
                        <p className="font-bold text-[var(--foreground)]">{n.title}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
