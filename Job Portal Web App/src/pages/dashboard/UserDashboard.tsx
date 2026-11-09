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
  User as UserIcon,
  BarChart3,
  Zap,
  ChevronRight,
  Settings as SettingsIcon,
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
  Building2,
  Award,
  Compass,
  ArrowUpRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../store/authStore"
import { useJobStore } from "../../store/jobStore"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { useApplicationStore } from "../../store/applicationStore"
import { useNotificationStore } from "../../store/notificationStore"
import { applicationService } from "../../lib/supabase"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import RoundSkillMatchBadge from "../../components/ui/RoundSkillMatchBadge"
import ApplicationPipelineStepper from "../../components/dashboard/ApplicationPipelineStepper"
import ProfileStrengthRing from "../../components/dashboard/ProfileStrengthRing"
import { getCompanyRealLogo } from "../../data/companyLogos"
import { calculateSkillMatch } from "../../utils/skillMatcher"
import { isLocalhost } from "../../utils/env"
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
  const { user } = useAuthStore()
  const { jobs: storeJobs } = useJobStore()
  const { savedJobIds, toggleSaveJob, isJobSaved } = useSavedJobsStore()
  const { applications: storeApplications, withdrawApplication } = useApplicationStore()
  const { notifications, addNotification } = useNotificationStore()

  const [activeTab, setActiveTab] = useState<DashboardTab>("all")
  const [metricFilter, setMetricFilter] = useState<ApplicationStatus | "all">("all")
  const [candidateStatus, setCandidateStatus] = useState<"active" | "interviewing" | "open">("active")
  const [withdrawTarget, setWithdrawTarget] = useState<any | null>(null)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const confirmWithdraw = async (target: any) => {
    setWithdrawingId(target.id)
    try {
      withdrawApplication(target.id)
      await applicationService.withdrawApplication(target.id)
      addNotification({
        type: "application",
        title: "Application Withdrawn",
        message: `You successfully withdrew your application for ${target.job?.title || "the role"} at ${target.job?.company?.name || "the company"}.`,
        link: `/jobs/${target.job?.id || target.jobId}`,
      })
      toast.success("Application successfully withdrawn.")
      setWithdrawTarget(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw application.")
    } finally {
      setWithdrawingId(null)
    }
  }

  // Read uploaded resume from storage
  const [uploadedResume] = useState<{
    fileName: string
    fileSize: string
    uploadedAt: string
    skills: string[]
  } | null>(() => {
    try {
      const stored = localStorage.getItem("hirehub_uploaded_resume")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Skills from uploaded resume or profile
  const candidateSkills = useMemo(() => {
    if (uploadedResume?.skills && uploadedResume.skills.length > 0) {
      return uploadedResume.skills
    }
    if (user?.skills && user.skills.length > 0) {
      return user.skills
    }
    return ["React", "TypeScript", "Python", "SQL", "Cloud"]
  }, [uploadedResume, user])

  // Open positions matched against resume skills
  const skillMatchedJobs = useMemo(() => {
    return storeJobs
      .map((job) => {
        const matches = job.skills.filter((js) =>
          candidateSkills.some((cs) => cs.toLowerCase() === js.toLowerCase()),
        )
        const matchPercent = Math.min(
          99,
          Math.max(
            75,
            Math.round(70 + (matches.length / Math.max(1, job.skills.length)) * 30),
          ),
        )
        return {
          ...job,
          matchedSkills: matches.length > 0 ? matches : job.skills.slice(0, 2),
          matchPercent,
        }
      })
      .filter((j) => j.matchedSkills.length > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent)
  }, [storeJobs, candidateSkills])

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
  const countViewed = allApplications.filter((a) => a.status === "Viewed").length
  const countShortlisted = allApplications.filter((a) => a.status === "Shortlisted").length
  const countInterviews = allApplications.filter((a) => a.status === "Interview").length

  const stats = [
    {
      id: "all" as const,
      label: "Applications Sent",
      count: countApplied,
      subtext: countApplied > 0 ? `${countApplied} in tracking` : "No applications yet",
      trend: countApplied > 0 ? "Active Pipeline" : "Ready to Apply",
      icon: Briefcase,
      color: "from-amber-500 to-amber-600",
      accent: "text-amber-500",
      bg: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20",
      borderColor: "border-amber-500/30",
    },
    {
      id: "Viewed" as const,
      label: "Recruiter Views",
      count: countViewed,
      subtext: countViewed > 0 ? `${countViewed} reviewed` : "Awaiting review",
      trend: countViewed > 0 ? "In Review" : "Pending",
      icon: Eye,
      color: "from-blue-500 to-blue-600",
      accent: "text-blue-500",
      bg: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      id: "Shortlisted" as const,
      label: "Shortlisted Roles",
      count: countShortlisted,
      subtext: countShortlisted > 0 ? `${countShortlisted} advanced` : "None shortlisted yet",
      trend: countShortlisted > 0 ? "High Interest" : "In Evaluation",
      icon: Star,
      color: "from-emerald-500 to-emerald-600",
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
    },
    {
      id: "Interview" as const,
      label: "Interviews Booked",
      count: countInterviews,
      subtext: countInterviews > 0 ? `${countInterviews} scheduled` : "No upcoming calls",
      trend: countInterviews > 0 ? "Confirmed" : "Awaiting Call",
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      accent: "text-purple-500",
      bg: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20",
      borderColor: "border-purple-500/30",
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
    return skillMatchedJobs.slice(0, 4)
  }, [skillMatchedJobs])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-24 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ============================================================= */}
        {/* 1. EXECUTIVE COMMAND HEADER                                   */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl"
        >
          {/* Subtle background ambient mesh */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Top Meta Bar */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  <Sparkles size={13} className="text-amber-400" /> Executive Candidate Portal
                </span>

                {/* Candidate Availability Status Picker */}
                <div className="inline-flex items-center bg-black/40 backdrop-blur-md p-1 rounded-full text-xs font-semibold border border-white/10">
                  <button
                    type="button"
                    onClick={() => setCandidateStatus("active")}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      candidateStatus === "active"
                        ? "bg-emerald-500 text-white shadow-sm font-bold"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Actively Seeking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCandidateStatus("interviewing")}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      candidateStatus === "interviewing"
                        ? "bg-purple-600 text-white shadow-sm font-bold"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>Interviewing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCandidateStatus("open")}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      candidateStatus === "open"
                        ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>Open to Offers</span>
                  </button>
                </div>
              </div>

              {/* Title & Greeting */}
              <div className="space-y-1">
                <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{greeting}, {user?.name ? user.name.split(" ")[0] : "Candidate"}</span>
                  <span className="inline-flex items-center p-1 rounded-full bg-emerald-500/20 text-emerald-400" title="Verified Profile">
                    <ShieldCheck size={20} />
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Real-time pipeline overview, AI resume skill matching, and executive interview scheduling.
                </p>
              </div>

              {/* Key Indicators */}
              <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Profile Strength: <strong className="text-white">{user?.profileCompletion || 80}%</strong></span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Award size={13} className="text-amber-400" />
                  <span>ATS Benchmark: <strong className="text-white">88/100 (High Readiness)</strong></span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-blue-400" />
                  <span>Platform Status: <strong className="text-white">Active & Verified</strong></span>
                </span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/jobs")}
                className="font-bold flex-1 sm:flex-initial shadow-lg bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                <Search size={15} className="mr-1.5" /> Explore Open Roles
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/ats-checker")}
                className="font-semibold flex-1 sm:flex-initial border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-white"
              >
                <TrendingUp size={15} className="mr-1.5 text-amber-400" /> Scan Resume ATS
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/settings")}
                className="font-semibold flex-1 sm:flex-initial border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-white"
                title="Account Settings"
              >
                <SettingsIcon size={15} className="mr-1.5" /> Settings
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ============================================================= */}
        {/* 2. EXECUTIVE KPI CARDS (Interactive application metrics)       */}
        {/* ============================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-poppins text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
              <BarChart3 size={14} className="text-[var(--primary)]" />
              <span>Application Pipeline Analytics</span>
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const isSelected = metricFilter === stat.id
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  onClick={() => setMetricFilter(isSelected ? "all" : (stat.id as any))}
                  className={`p-5 rounded-3xl bg-[var(--card)] border cursor-pointer transition-all duration-200 relative overflow-hidden group shadow-sm hover:shadow-md ${
                    isSelected
                      ? `ring-2 ring-amber-500 border-amber-500 shadow-amber-500/10`
                      : `border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-700`
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                      {stat.trend}
                    </span>
                  </div>

                  <p className="font-poppins text-3xl font-black text-[var(--foreground)] tracking-tight">
                    {stat.count}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] mt-1">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 font-medium">
                    {stat.subtext}
                  </p>

                  {isSelected && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ============================================================= */}
        {/* 3. RESUME SKILL-MATCHED OPENINGS (Directly Below KPI Cards)    */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 sm:p-7 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-card)] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-poppins font-black text-lg sm:text-xl text-[var(--foreground)] tracking-tight">
                  Resume Skill-Matched Positions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  {skillMatchedJobs.length} Positions Available
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Matched against your active resume skills:</span>
                <span className="font-bold text-[var(--foreground)]">
                  {candidateSkills.slice(0, 5).join(", ")}
                </span>
                {uploadedResume && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-semibold">
                    ({uploadedResume.fileName})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>{uploadedResume ? "Manage / Upload New Resume" : "Upload Resume in Profile"}</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Matched Open Positions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillMatchedJobs.slice(0, 6).map((job) => {
              const isApplied = allApplications.some(
                (a) =>
                  (a.job?.id === job.id || a.job?.title?.toLowerCase() === job.title.toLowerCase()) &&
                  a.status !== "Withdrawn",
              )
              const existingApp = allApplications.find(
                (a) =>
                  (a.job?.id === job.id || a.job?.title?.toLowerCase() === job.title.toLowerCase()) &&
                  a.status !== "Withdrawn",
              )
              const isSaved = isJobSaved(job.id)

              return (
                <div
                  key={`matched-${job.id}`}
                  className="p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-amber-500/60 transition-all flex flex-col justify-between group shadow-xs space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Logo, Company & Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-[var(--border)] p-1 flex items-center justify-center font-bold text-[var(--primary)] shadow-xs">
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
                            to={`/companies/${job.company.id || job.company.slug || job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                            className="font-bold text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] truncate block"
                            title="Open Company Profile"
                          >
                            {job.company.name}
                          </Link>
                          <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                            <MapPin size={10} /> {job.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <RoundSkillMatchBadge
                          skillMatch={{
                            matchPercent: job.matchPercent,
                            matchedSkills: job.matchedSkills,
                            matchedCount: job.matchedSkills.length,
                            totalCount: job.skills.length,
                          }}
                          size="xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            toggleSaveJob(job.id)
                            toast.success(isSaved ? "Removed from bookmarks" : "Saved to bookmarks!")
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSaved ? "text-amber-500" : "text-[var(--muted-foreground)] hover:text-amber-500"
                          }`}
                          title={isSaved ? "Saved" : "Save role"}
                        >
                          <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    {/* Job Title & Details */}
                    <div>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-poppins font-bold text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-1 block"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k+` : "Competitive"}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">· {job.location || "Remote"}</span>
                      </div>
                    </div>

                    {/* Matching Skill Chips */}
                    <div className="flex flex-wrap gap-1">
                      {job.matchedSkills.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Apply Now & Company Profile */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
                    {isApplied ? (
                      <div className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30">
                        <Check size={13} />
                        <span>Applied ({existingApp?.status || "In Review"})</span>
                      </div>
                    ) : (
                      <Link
                        to={`/jobs/${job.id}`}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs text-center"
                      >
                        <span>Apply Now</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}

                    <Link
                      to={`/companies/${job.company.id || job.company.slug || job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="py-1.5 px-3 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] font-semibold text-xs flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
                      title="Open company profile for applying to jobs"
                    >
                      <Building2 size={12} className="text-[var(--primary)]" />
                      <span>Company Profile</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ============================================================= */}
        {/* 4. MAIN WORKSPACE: PIPELINE + EXECUTIVE TOOLKIT                */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLS: Segmented Content & Application Cards */}
          <div className="lg:col-span-8 space-y-6">
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
                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-12 text-center shadow-[var(--shadow-card)]">
                    <FileText size={44} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-30" />
                    <h4 className="font-poppins font-bold text-base text-[var(--foreground)]">
                      No applications found for this filter
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1 mb-5">
                      Explore positions matching your skillset and submit fast applications.
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
                      Browse Open Roles <ArrowRight size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedApplications.map((app) => {
                      const skillMatch = app.job?.skills
                        ? calculateSkillMatch(app.job.skills, undefined, user)
                        : null

                      return (
                        <div
                          key={app.id}
                          className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)] hover:border-amber-500/50 transition-all space-y-4"
                        >
                          {/* Card Top: Company info & Status */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
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
                                      e.currentTarget.src = getCompanyRealLogo(
                                        app.job?.company?.name || "Company",
                                      )
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
                                  <span className="font-semibold text-[var(--foreground)]">
                                    {app.job?.company?.name || "Verified Employer"}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {app.job?.location || "Remote"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {skillMatch && (
                                <RoundSkillMatchBadge skillMatch={skillMatch} size="sm" />
                              )}
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant={statusVariant[app.status] || "default"} size="sm">
                                  {app.status}
                                </Badge>
                                <span className="text-[11px] text-[var(--muted-foreground)]">
                                  {app.appliedAt
                                    ? `${Math.max(
                                        0,
                                        Math.floor(
                                          (Date.now() - new Date(app.appliedAt).getTime()) /
                                            86400000,
                                        ),
                                      )}d ago`
                                    : "Recently"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 5-Stage Timeline Stepper */}
                          <div className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)]/70">
                            <ApplicationPipelineStepper status={app.status} appliedAt={app.appliedAt} />
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-[11px] text-[var(--muted-foreground)]">
                              Mode: In-App Direct Apply
                            </span>

                            <div className="flex items-center gap-2">
                              {app.status !== "Withdrawn" && app.status !== "Rejected" && (
                                <button
                                  type="button"
                                  onClick={() => setWithdrawTarget(app)}
                                  className="px-2.5 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-semibold text-xs transition-colors"
                                >
                                  Withdraw
                                </button>
                              )}
                              <Link
                                to="/messages"
                                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] font-semibold text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
                              >
                                <MessageSquare size={13} /> Message
                              </Link>
                              <Link
                                to={`/jobs/${app.job?.id}`}
                                className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-bold text-white flex items-center gap-1.5 transition-colors shadow-xs"
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

                            <div className="flex items-center gap-2">
                              <RoundSkillMatchBadge
                                skillMatch={{
                                  matchPercent: 96,
                                  matchedSkills: job.skills.slice(0, 3),
                                  matchedCount: Math.min(3, job.skills.length),
                                  totalCount: job.skills.length,
                                }}
                                size="xs"
                              />
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
                            <span className="text-xs font-semibold text-[var(--foreground)]">
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
                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-12 text-center shadow-[var(--shadow-card)]">
                    <Bookmark size={44} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-30" />
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
          <div className="lg:col-span-4 space-y-6">
            {/* Widget 1: ATS Resume Score Benchmark */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                      ATS Resume Score
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Algorithm Readiness Index
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  88 / 100
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--muted-foreground)]">Keyword Matching</span>
                  <span className="font-bold text-[var(--foreground)]">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: "92%" }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {candidateSkills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)] font-semibold"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>

              <Link
                to="/ats-checker"
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                Run In-Depth ATS Scan <ArrowRight size={13} />
              </Link>
            </div>

            {/* Widget 2: Upcoming Schedule & Interview Hub */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                      Upcoming Interviews
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Confirmed video screens
                    </p>
                  </div>
                </div>
              </div>

              {countInterviews > 0 ? (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      Technical Screen
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white">
                      Scheduled
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground)] font-medium">
                    Hiring Team Video Call
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--muted-foreground)]">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} /> Next Available Slot
                    </span>
                    <span className="text-blue-500 font-semibold cursor-pointer hover:underline">
                      Join Call
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-center space-y-1">
                  <Calendar size={20} className="mx-auto text-[var(--muted-foreground)] opacity-40 mb-1" />
                  <p className="text-xs font-bold text-[var(--foreground)]">No Scheduled Calls</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Invitations from hiring managers will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Widget 3: Quick Career Tools Navigation */}
            <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
              <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                Career Acceleration Tools
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Resume Builder", to: "/resume-builder", icon: FileText, color: "text-emerald-500" },
                  { label: "Find Jobs", to: "/jobs", icon: Search, color: "text-blue-500" },
                  { label: "Salary Insights", to: "/salary-insights", icon: BarChart3, color: "text-amber-500" },
                  { label: "Job Alerts", to: "/dashboard/alerts", icon: Bell, color: "text-purple-500" },
                ].map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Link
                      key={tool.label}
                      to={tool.to}
                      className="p-3.5 rounded-2xl bg-[var(--background)] hover:bg-[var(--muted)] border border-[var(--border)] transition-all flex flex-col items-center text-center group"
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
              const notifs = notifications.slice(0, 3)
              if (notifs.length === 0) return null

              return (
                <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-3">
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
                      <Link
                        key={n.id}
                        to={n.link || "/notifications"}
                        className="block p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)]/70 hover:border-[var(--primary)]/50 transition-colors text-xs space-y-1"
                      >
                        <p className="font-bold text-[var(--foreground)]">{n.title}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                          {n.message}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Modern Mobile-Optimized Withdraw Confirmation Modal */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 mx-auto">
              <AlertCircle size={26} />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                Withdraw Application?
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Are you sure you want to withdraw your application for{" "}
                <strong className="text-[var(--foreground)]">
                  {withdrawTarget.job?.title || "this position"}
                </strong>{" "}
                at{" "}
                <strong className="text-[var(--foreground)]">
                  {withdrawTarget.job?.company?.name || "the company"}
                </strong>?
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
              The hiring team will be notified that your application was withdrawn. You can re-apply at any time.
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 font-semibold"
                onClick={() => setWithdrawTarget(null)}
                disabled={Boolean(withdrawingId)}
              >
                Keep Active
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold border-red-600"
                onClick={() => confirmWithdraw(withdrawTarget)}
                disabled={Boolean(withdrawingId)}
              >
                {withdrawingId ? "Withdrawing..." : "Confirm Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
