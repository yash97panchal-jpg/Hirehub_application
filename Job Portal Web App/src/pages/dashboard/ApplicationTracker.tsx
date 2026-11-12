import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  Filter,
  Mail,
  Download,
  Sparkles,
  BookOpen,
  ChevronUp,
  Search,
  Copy,
  Check,
  Eye,
  FileText,
  Video,
  User,
  Phone,
  GraduationCap,
  Globe,
  Tag,
  ArrowUpDown,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { useApplicationStore } from "../../store/applicationStore"
import { useAuthStore } from "../../store/authStore"
import { useNotificationStore } from "../../store/notificationStore"
import { applicationService, interviewService } from "../../lib/supabase"
import AICoverLetterModal from "../../components/dashboard/AICoverLetterModal"
import InterviewPrepModal from "../../components/dashboard/InterviewPrepModal"
import { getCompanyRealLogo } from "../../data/companyLogos"
import CustomSelect from "../../components/ui/CustomSelect"
import type { Application, ApplicationStatus, ApplicationStatusHistory, InterviewSchedule } from "../../types"
import toast from "react-hot-toast"

export default function ApplicationTracker() {
  const { applications: storeApplications, setApplications, withdrawApplication } = useApplicationStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSource, setFilterSource] = useState<"all" | "easy" | "external">("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "updated" | "company" | "title">("newest")

  // Modals & Interactivity
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null)
  const [withdrawReason, setWithdrawReason] = useState("Accepted another offer")
  const [detailsModalApp, setDetailsModalApp] = useState<Application | null>(null)
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // AI & Interview Prep Modals
  const [aiModalJob, setAiModalJob] = useState<{ title: string; company: string } | null>(null)
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false)

  // Load latest applications on mount for the current candidate
  useEffect(() => {
    async function loadCandidateApps() {
      if (user?.id) {
        try {
          const fresh = await applicationService.getSeekerApplications(user.id)
          if (fresh && fresh.length > 0) {
            setApplications(fresh)
          }
        } catch (e) {
          console.warn("Could not load fresh applications:", e)
        }
      }
    }
    loadCandidateApps()
  }, [user?.id, setApplications])

  // Copy Application Code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(code)
    toast.success(`Copied Application ID: ${code}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered & Sorted applications
  const filteredApplications = useMemo(() => {
    let list = storeApplications

    // 1. Filter by user: candidate should see their own applications
    if (user?.id) {
      list = list.filter(
        (a) =>
          !a.userId ||
          a.userId === user.id ||
          a.candidateId === user.id ||
          a.applicant?.id === user.id ||
          a.email?.toLowerCase() === user.email.toLowerCase() ||
          a.applicant?.email?.toLowerCase() === user.email.toLowerCase()
      )
    }

    // 2. Filter by source (easy / external)
    if (filterSource !== "all") {
      list = list.filter((a) => (a.source || "easy") === filterSource)
    }

    // 3. Filter by standard recruitment status
    if (filterStatus !== "all") {
      if (filterStatus === "Interview") {
        list = list.filter(
          (a) =>
            a.status === "Interview" ||
            a.status === "Interview Scheduled" ||
            a.status === "Interview Completed"
        )
      } else if (filterStatus === "Selected") {
        list = list.filter((a) => a.status === "Selected" || a.status === "Offered" || a.status === "Final Selection")
      } else {
        list = list.filter((a) => a.status === filterStatus)
      }
    }

    // 4. Search query by Title, Company, or Application ID
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((a) => {
        const idMatch = (a.applicationNumber || a.applicationCode || a.id).toLowerCase().includes(q)
        const titleMatch = (a.job?.title || "").toLowerCase().includes(q)
        const companyMatch = (a.job?.company?.name || "").toLowerCase().includes(q)
        const locationMatch = (a.job?.location || "").toLowerCase().includes(q)
        return idMatch || titleMatch || companyMatch || locationMatch
      })
    }

    // 5. Sorting
    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime()
      }
      if (sortBy === "oldest") {
        return new Date(a.appliedAt || 0).getTime() - new Date(b.appliedAt || 0).getTime()
      }
      if (sortBy === "updated") {
        return new Date(b.updatedAt || b.appliedAt || 0).getTime() - new Date(a.updatedAt || a.appliedAt || 0).getTime()
      }
      if (sortBy === "company") {
        return (a.job?.company?.name || "").localeCompare(b.job?.company?.name || "")
      }
      if (sortBy === "title") {
        return (a.job?.title || "").localeCompare(b.job?.title || "")
      }
      return 0
    })

    return sorted
  }, [storeApplications, user, filterSource, filterStatus, searchQuery, sortBy])

  // Download Application History as CSV
  const handleDownloadCSV = () => {
    if (filteredApplications.length === 0) {
      toast.error("No applications to download.")
      return
    }

    const headers = [
      "Application ID",
      "Job Title",
      "Company",
      "Location",
      "Job Type",
      "Status",
      "Applied Date",
      "Last Updated",
      "Source",
      "ATS Match",
    ]
    const rows = filteredApplications.map((a) => [
      a.applicationNumber || a.applicationCode || a.id,
      `"${a.job?.title || ""}"`,
      `"${a.job?.company?.name || ""}"`,
      `"${a.job?.location || ""}"`,
      `"${a.job?.type || ""}"`,
      a.status,
      a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "",
      a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "",
      a.source || "easy",
      `${a.atsScore || 85}%`,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `hirehub-applications-${Date.now()}.csv`
    link.click()
    toast.success("Application history downloaded as CSV!")
  }

  // Handle Seeker Withdrawing Application
  const confirmWithdraw = async (target: Application) => {
    setWithdrawingId(target.id)
    try {
      withdrawApplication(target.id)
      await applicationService.withdrawApplication(
        target.id,
        user?.id,
        user?.name || target.fullName || "Candidate"
      )

      addNotification({
        type: "application",
        title: "Application Withdrawn",
        message: `You successfully withdrew your application for ${target.job?.title || "the position"} at ${target.job?.company?.name || "the company"}.`,
        link: `/jobs/${target.job?.id || target.jobId}`,
      })

      // Refresh applications from service
      if (user?.id) {
        const fresh = await applicationService.getSeekerApplications(user.id)
        setApplications(fresh)
      }

      toast.success("Application successfully withdrawn.")
      setWithdrawTarget(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw application.")
    } finally {
      setWithdrawingId(null)
    }
  }

  // Visual status badge helper
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "Applied":
        return <Badge variant="primary">Applied</Badge>
      case "Viewed":
        return <Badge variant="accent">Viewed by Recruiter</Badge>
      case "Screening":
        return <Badge variant="warning">Screening Stage</Badge>
      case "Shortlisted":
        return <Badge variant="success">Shortlisted for Review</Badge>
      case "Assessment":
        return <Badge variant="primary">Skills Assessment</Badge>
      case "Interview":
      case "Interview Scheduled":
        return <Badge variant="warning">Interview Scheduled</Badge>
      case "Interview Completed":
        return <Badge variant="accent">Interview Completed</Badge>
      case "Final Selection":
      case "Selected":
        return <Badge variant="success">Selected for Role</Badge>
      case "Offered":
      case "Hired":
        return <Badge variant="success">Hired / Offer Extended</Badge>
      case "Rejected":
        return <Badge variant="error">Not Selected</Badge>
      case "Withdrawn":
        return <Badge variant="outline">Withdrawn</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
              <Briefcase className="text-[#F97316]" />
              My Job Applications
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Track your real-time recruitment progress, interview invitations, milestone timelines, and application records.
            </p>
          </div>

          {/* Quick Actions & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="text-xs font-semibold"
              title="Download application history as CSV"
            >
              <Download size={14} className="mr-1" /> Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrepModalOpen(true)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            >
              <BookOpen size={14} className="mr-1" /> Interview Prep
            </Button>
            <Link to="/jobs">
              <Button variant="primary" size="sm" className="text-xs font-bold">
                Browse More Jobs <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Applications", count: storeApplications.length },
            {
              label: "In Review / Shortlisted",
              count: storeApplications.filter((a) =>
                ["Shortlisted", "Viewed", "Screening", "Assessment"].includes(a.status)
              ).length,
            },
            {
              label: "Interviews Scheduled",
              count: storeApplications.filter((a) =>
                ["Interview", "Interview Scheduled", "Interview Completed"].includes(a.status)
              ).length,
            },
            {
              label: "Offers / Selected",
              count: storeApplications.filter((a) =>
                ["Selected", "Offered", "Hired"].includes(a.status)
              ).length,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs"
            >
              <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
              <p className="text-2xl font-poppins font-black text-[var(--foreground)] mt-1">
                {item.count}
              </p>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search by Job Title / Company / Application ID */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company name, or application ID (e.g. APP-2026...)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status (All 11 lifecycle states) */}
            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(String(val))}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "Applied", label: "Applied" },
                { value: "Viewed", label: "Viewed" },
                { value: "Screening", label: "Screening" },
                { value: "Shortlisted", label: "Shortlisted" },
                { value: "Assessment", label: "Assessment" },
                { value: "Interview", label: "Interview Scheduled" },
                { value: "Selected", label: "Selected / Offered" },
                { value: "Hired", label: "Hired" },
                { value: "Rejected", label: "Rejected" },
                { value: "Withdrawn", label: "Withdrawn" },
              ]}
              size="sm"
              className="w-44"
            />

            {/* Source */}
            <CustomSelect
              value={filterSource}
              onChange={(val) => setFilterSource(val)}
              options={[
                { value: "all", label: "All Sources" },
                { value: "easy", label: "In-App Apply" },
                { value: "external", label: "External Site" },
              ]}
              size="sm"
              className="w-36"
            />

            {/* Sort */}
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={[
                { value: "newest", label: "Newest Applied" },
                { value: "oldest", label: "Oldest Applied" },
                { value: "updated", label: "Recently Updated" },
                { value: "company", label: "Company (A-Z)" },
                { value: "title", label: "Job Title (A-Z)" },
              ]}
              size="sm"
              className="w-40"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xs">
          {filteredApplications.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Briefcase size={44} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No Applications Found</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                {storeApplications.length === 0
                  ? "You haven't submitted any job applications yet. Find your next career move on the jobs marketplace."
                  : "No applications match your search query or selected filters."}
              </p>
              <Link to="/jobs">
                <Button variant="primary" size="sm" className="mt-2 font-bold">
                  Browse Active Positions <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredApplications.map((app) => {
                const appCode = app.applicationNumber || app.applicationCode || app.id
                const isTimelineOpen = expandedTimelineId === app.id
                const history = app.statusHistory || []
                const isInterviewStage =
                  app.status === "Interview" ||
                  app.status === "Interview Scheduled" ||
                  app.status === "Interview Completed"

                return (
                  <div
                    key={app.id}
                    className="p-5 sm:p-6 hover:bg-[var(--muted)]/10 transition-all space-y-4"
                  >
                    {/* Top Row: Company Info & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Company Logo */}
                        <div className="w-13 h-13 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg text-[var(--primary)] border border-[var(--border)] p-1 shadow-xs">
                          {app.job?.company?.name ? (
                            <img
                              src={getCompanyRealLogo(app.job.company.name, app.job.company.website, app.job.company.logo)}
                              alt={app.job.company.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = getCompanyRealLogo(app.job?.company?.name || "Company", app.job?.company?.website)
                              }}
                            />
                          ) : (
                            app.job?.company?.name?.charAt(0) || "C"
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/jobs/${app.job?.id || app.jobId}`}
                              className="font-poppins font-bold text-base text-[var(--foreground)] hover:text-[var(--primary)] hover:underline truncate"
                            >
                              {app.job?.title || "Untitled Position"}
                            </Link>

                            {/* Application Code Pill with Copy */}
                            <button
                              type="button"
                              onClick={() => handleCopyCode(appCode)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--muted)] hover:bg-[var(--primary)]/10 text-[11px] font-mono font-semibold text-[var(--foreground)] border border-[var(--border)] transition-colors cursor-pointer"
                              title="Click to copy Application ID"
                            >
                              <span>{appCode}</span>
                              {copiedId === appCode ? (
                                <Check size={11} className="text-emerald-500" />
                              ) : (
                                <Copy size={11} className="text-[var(--muted-foreground)]" />
                              )}
                            </button>

                            {app.source === "external" ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                External Site
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                                Easy Apply
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] flex-wrap">
                            <span className="font-semibold text-[var(--foreground)]">
                              {app.job?.company?.name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {app.job?.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Briefcase size={12} />
                              {app.job?.type || "Full-time"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently"}
                            </span>
                            {app.updatedAt && (
                              <>
                                <span>•</span>
                                <span className="text-[11px] opacity-80">
                                  Updated {new Date(app.updatedAt).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Status Badge & Interview Button */}
                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {getStatusBadge(app.status)}
                        {isInterviewStage && (
                          <Link to="/messages">
                            <Button variant="primary" size="sm" className="text-xs font-bold">
                              <Video size={13} className="mr-1" /> Join Room
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Timeline Toggle & Action Toolbar */}
                    <div className="pt-2 border-t border-[var(--border)]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedTimelineId(isTimelineOpen ? null : app.id)}
                          className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isTimelineOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isTimelineOpen ? "Hide Application Timeline" : "View Event Timeline"}
                        </button>
                        <span className="text-[var(--muted-foreground)]">•</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAiModalJob({
                              title: app.job?.title || "Role",
                              company: app.job?.company?.name || "Company",
                            })
                          }
                          className="text-[var(--muted-foreground)] hover:text-[#F97316] flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Sparkles size={13} />
                          AI Cover Letter
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDetailsModalApp(app)}
                          className="text-[var(--primary)] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> View Details
                        </button>

                        {/* Allow withdrawal only if not already withdrawn or finished */}
                        {app.status !== "Withdrawn" && app.status !== "Hired" && app.status !== "Rejected" && (
                          <button
                            type="button"
                            onClick={() => setWithdrawTarget(app)}
                            className="text-red-500 hover:text-red-600 font-semibold cursor-pointer transition-colors"
                          >
                            Withdraw Application
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Visual Timeline (Showing ACTUAL database events) */}
                    <AnimatePresence>
                      {isTimelineOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-3 border-t border-[var(--border)] bg-[var(--muted)]/20 rounded-2xl p-4 mt-2"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                              Real-Time Milestone Audit Trail
                            </h4>
                            <span className="text-[11px] text-[var(--muted-foreground)]">
                              ID: {appCode}
                            </span>
                          </div>

                          {/* Show actual events from database status history */}
                          {history && history.length > 0 ? (
                            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                              {history.map((h, i) => (
                                <div key={h.id || i} className="flex items-start gap-3 relative pl-7">
                                  <span
                                    className={`absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-[var(--card)] ${
                                      h.newStatus === "Hired" || h.status === "Hired" || h.status === "Selected"
                                        ? "bg-emerald-500"
                                        : h.status === "Interview Scheduled" || h.status === "Interview"
                                        ? "bg-purple-500"
                                        : h.status === "Rejected"
                                        ? "bg-rose-500"
                                        : h.status === "Withdrawn"
                                        ? "bg-slate-400"
                                        : "bg-[var(--primary)]"
                                    }`}
                                  />
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-bold text-xs text-[var(--foreground)]">
                                        {h.newStatus || h.status}
                                      </p>
                                      <span className="text-[10px] text-[var(--muted-foreground)]">
                                        by {h.changedByName || "Hiring Team"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[var(--muted-foreground)]">
                                      {h.remarks || h.notes || "Stage recorded in recruitment database."}
                                    </p>
                                    <p className="text-[10px] text-[var(--muted-foreground)] font-mono opacity-80">
                                      {h.createdAt || h.changedAt
                                        ? new Date(h.createdAt || h.changedAt || "").toLocaleString()
                                        : "Confirmed"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Fallback to verified application event */
                            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                              <div className="flex items-start gap-3 relative pl-7">
                                <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-[var(--card)]" />
                                <div>
                                  <p className="font-bold text-xs text-[var(--foreground)]">Application Received</p>
                                  <p className="text-[11px] text-[var(--muted-foreground)]">
                                    {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : "Confirmed"} • Resume verified and delivered to hiring team.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 relative pl-7">
                                <span className={`absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-[var(--card)] ${app.status !== 'Applied' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                <div>
                                  <p className="font-bold text-xs text-[var(--foreground)]">Current Status: {app.status}</p>
                                  <p className="text-[11px] text-[var(--muted-foreground)]">
                                    ATS Skill Match: <strong>{app.atsScore || 85}%</strong>. Recruiter informed.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Show scheduled interview details if any exist */}
                          {app.interviews && app.interviews.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[var(--border)]/70">
                              <h5 className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                                <Video size={13} /> Scheduled Interview Session
                              </h5>
                              {app.interviews.map((int) => (
                                <div key={int.id} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-[var(--foreground)]">{int.round} Round ({int.interviewType || int.platform})</span>
                                    <span className="font-mono text-[11px] text-purple-600 dark:text-purple-300 font-semibold">{int.date} at {int.time}</span>
                                  </div>
                                  <p className="text-[11px] text-[var(--muted-foreground)]">
                                    Interviewer: {int.interviewerName} ({int.interviewerEmail})
                                  </p>
                                  {int.meetingLink && (
                                    <a
                                      href={int.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-[var(--primary)] font-bold hover:underline inline-flex items-center gap-1 pt-1"
                                    >
                                      Join Meeting Link <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FULL APPLICATION DETAILS MODAL */}
      <AnimatePresence>
        {detailsModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold font-mono">
                      {detailsModalApp.applicationNumber || detailsModalApp.applicationCode || detailsModalApp.id}
                    </span>
                    {getStatusBadge(detailsModalApp.status)}
                  </div>
                  <h3 className="font-poppins font-bold text-lg text-[var(--foreground)] mt-1">
                    {detailsModalApp.job?.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {detailsModalApp.job?.company?.name} · {detailsModalApp.job?.location}
                  </p>
                </div>
                <button
                  onClick={() => setDetailsModalApp(null)}
                  className="p-1.5 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Candidate Information */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-2">
                  <h4 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                    <User size={15} /> Candidate Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[var(--muted-foreground)]">
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Full Name:</span> {detailsModalApp.fullName || detailsModalApp.applicant?.name || "Candidate"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Email:</span> {detailsModalApp.email || detailsModalApp.applicant?.email}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Mobile:</span> {detailsModalApp.mobileNumber || detailsModalApp.applicant?.phone || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Location:</span> {detailsModalApp.currentLocation || detailsModalApp.applicant?.location || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Professional Qualifications */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-2">
                  <h4 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                    <GraduationCap size={15} /> Academic & Professional Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[var(--muted-foreground)]">
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Education:</span> {detailsModalApp.highestEducation || detailsModalApp.highestQualification || "Bachelor's Degree"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Experience:</span> {detailsModalApp.totalExperience || detailsModalApp.workExperience || "1-3 years"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Status:</span> {detailsModalApp.currentEmploymentStatus || "Employed"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">Notice Period:</span> {detailsModalApp.noticePeriod || "30 Days"}
                    </div>
                    {detailsModalApp.expectedSalary && (
                      <div className="col-span-2">
                        <span className="font-semibold text-[var(--foreground)]">Expected Salary:</span> {detailsModalApp.expectedSalary}
                      </div>
                    )}
                  </div>

                  {detailsModalApp.skills && detailsModalApp.skills.length > 0 && (
                    <div className="pt-2">
                      <span className="font-semibold text-[var(--foreground)] block mb-1">Key Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {detailsModalApp.skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-semibold text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submitted Resume Document */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[var(--foreground)]">
                        {detailsModalApp.resumeName || "Submitted Resume Document.pdf"}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        PDF Format · Verified Candidate Profile Document
                      </p>
                    </div>
                  </div>
                  <a
                    href={detailsModalApp.resumeUrl || "/sample-resume.pdf"}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] flex items-center gap-1"
                  >
                    <Download size={13} /> View Resume
                  </a>
                </div>

                {/* Cover Letter */}
                {detailsModalApp.coverLetter && (
                  <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-1.5">
                    <h4 className="font-bold text-sm text-[var(--foreground)]">Cover Letter Note</h4>
                    <p className="text-[var(--foreground)] italic whitespace-pre-line leading-relaxed bg-[var(--card)] p-3 rounded-xl border border-[var(--border)]">
                      {detailsModalApp.coverLetter}
                    </p>
                  </div>
                )}

                {/* Screening Answers */}
                {detailsModalApp.answers && Object.keys(detailsModalApp.answers).length > 0 && (
                  <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-2">
                    <h4 className="font-bold text-sm text-[var(--foreground)]">Employer Screening Responses</h4>
                    <div className="space-y-1.5">
                      {Object.entries(detailsModalApp.answers).map(([qKey, ans], idx) => (
                        <div key={qKey} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                          <span className="font-semibold text-[var(--muted-foreground)]">Question {idx + 1}:</span>
                          <p className="font-bold text-[var(--foreground)] mt-0.5">{ans}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/20 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setDetailsModalApp(null)}>
                  Close Details
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WITHDRAW APPLICATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {withdrawTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto">
                <XCircle size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-[var(--foreground)]">Withdraw Application?</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Are you sure you want to withdraw your application for <strong>{withdrawTarget.job?.title}</strong> at {withdrawTarget.job?.company?.name}?
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-[var(--foreground)]">
                  Reason for withdrawal (Optional)
                </label>
                <select
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="Accepted another job offer">Accepted another job offer</option>
                  <option value="Salary / compensation not aligned">Salary / compensation not aligned</option>
                  <option value="Role location / commute not suitable">Role location / commute not suitable</option>
                  <option value="Applied by mistake">Applied by mistake</option>
                  <option value="Other career plans">Other career plans</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                The hiring team will be notified that your application was withdrawn. You can re-apply in the future if permitted.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setWithdrawTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                  isLoading={Boolean(withdrawingId)}
                  onClick={() => confirmWithdraw(withdrawTarget)}
                >
                  Confirm Withdrawal
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Modals */}
      {aiModalJob && (
        <AICoverLetterModal
          isOpen={Boolean(aiModalJob)}
          onClose={() => setAiModalJob(null)}
          jobTitle={aiModalJob.title}
          companyName={aiModalJob.company}
        />
      )}

      {isPrepModalOpen && (
        <InterviewPrepModal
          isOpen={isPrepModalOpen}
          onClose={() => setIsPrepModalOpen(false)}
        />
      )}
    </div>
  )
}
