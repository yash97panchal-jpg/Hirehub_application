import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle,
  Mail,
  Download,
  GripVertical,
  Eye,
  MessageSquare,
  Calendar,
  Sparkles,
  User,
  StickyNote,
  X,
  ExternalLink,
  Star,
  Award,
  Video,
  Clock,
  Send,
  Check,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  MapPin,
  GraduationCap,
  Globe,
  Briefcase,
  DollarSign,
  AlertTriangle,
  RotateCcw,
} from "lucide-react"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import CustomSelect from "../../components/ui/CustomSelect"
import { useAuthStore } from "../../store/authStore"
import { useJobStore } from "../../store/jobStore"
import { useApplicationStore } from "../../store/applicationStore"
import { useNotificationStore } from "../../store/notificationStore"
import { useMessageStore } from "../../store/messageStore"
import { applicationService, storageService, interviewService, messageService } from "../../lib/supabase"
import type { Application, ApplicationStatus, InterviewRound, InterviewSchedule } from "../../types"
import toast from "react-hot-toast"

// Standard 11 Recruitment Lifecycle States
const columns: { id: ApplicationStatus; title: string; badgeColor: string }[] = [
  { id: "Applied", title: "New Applied", badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { id: "Viewed", title: "Viewed", badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
  { id: "Screening", title: "Screening", badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { id: "Shortlisted", title: "Shortlisted", badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { id: "Assessment", title: "Assessment", badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  { id: "Interview Scheduled", title: "Interview Scheduled", badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  { id: "Interview Completed", title: "Interview Completed", badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { id: "Selected", title: "Selected", badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
  { id: "Hired", title: "Hired / Offered", badgeColor: "bg-green-600/10 text-green-700 dark:text-green-300 border-green-600/20" },
  { id: "Rejected", title: "Rejected", badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  { id: "Withdrawn", title: "Withdrawn", badgeColor: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
]

export default function ApplicantManagement() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()
  const { applications, setApplications } = useApplicationStore()
  const { addNotification } = useNotificationStore()
  const navigate = useNavigate()

  // Layout View mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban")

  // Filters & Search
  const [selectedJobId, setSelectedJobId] = useState<string>("all")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [talentPoolOnly, setTalentPoolOnly] = useState(false)

  // Candidate Inspection Modal
  const [activeModalApp, setActiveModalApp] = useState<Application | null>(null)
  const [recruiterNote, setRecruiterNote] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [statusRemarks, setStatusRemarks] = useState("")
  const [candidateNotes, setCandidateNotes] = useState<{ id: string; authorName: string; note: string; createdAt: string }[]>([])

  // Talent Pool Storage
  const [talentPoolIds, setTalentPoolIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem("hirehub_recruiter_talent_pool")
      return s ? JSON.parse(s) : []
    } catch {
      return []
    }
  })

  // Interview Scheduling State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [interviewForm, setInterviewForm] = useState({
    title: "Job Interview Round",
    round: "Technical" as InterviewRound,
    interviewType: "Online" as "Online" | "Phone" | "In-person",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    time: "14:00",
    durationMinutes: 45,
    platform: "Google Meet" as const,
    meetingLink: `https://meet.google.com/hhr-${Math.random().toString(36).substring(2, 7)}`,
    location: "",
    instructions: "Please ensure stable internet access and test your camera prior to the call.",
    notes: "Review past system designs and discuss architectural decisions.",
  })
  const [isScheduling, setIsScheduling] = useState(false)

  // Reschedule & Cancel Interview Modals
  const [rescheduleInterviewTarget, setRescheduleInterviewTarget] = useState<InterviewSchedule | null>(null)
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "", reason: "Hiring panel scheduling conflict" })
  const [cancelInterviewTarget, setCancelInterviewTarget] = useState<InterviewSchedule | null>(null)
  const [cancelReason, setCancelReason] = useState("Position filled or schedule conflict")

  // Structured Feedback Form State
  const [isScorecardOpen, setIsScorecardOpen] = useState(false)
  const [scorecardForm, setScorecardForm] = useState({
    score: 5,
    strengths: "Clear technical reasoning, strong architecture design, positive collaboration.",
    weaknesses: "Could go deeper into distributed database sharding strategies.",
    recommendation: "Strong Hire" as "Strong Hire" | "Hire" | "Neutral" | "No Hire",
    notes: "Top candidate for the senior engineering pod.",
  })
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  // Load latest applications on mount for the recruiter's company
  useEffect(() => {
    async function loadApplications() {
      try {
        const fresh = await applicationService.getAllApplications()
        if (fresh && fresh.length > 0) {
          setApplications(fresh)
        }
      } catch (e) {
        console.warn("Could not fetch fresh applications:", e)
      }
    }
    loadApplications()
  }, [setApplications])

  // Automatically mark application as "Viewed" when recruiter opens it for the first time
  const handleOpenCandidateModal = async (app: Application) => {
    setActiveModalApp(app)
    setRecruiterNote(app.notes || "")

    // Load recruiter notes
    try {
      const notes = await applicationService.getRecruiterNotes(app.id)
      setCandidateNotes(notes)
    } catch {}

    // Auto-transition from Applied -> Viewed
    if (app.status === "Applied") {
      try {
        await applicationService.updateStatus(
          app.id,
          "Viewed",
          "Recruiter reviewed candidate profile and application materials.",
          user?.id,
          user?.name || "Hiring Manager"
        )
        const updated = applications.map((a) => (a.id === app.id ? { ...a, status: "Viewed" as ApplicationStatus } : a))
        setApplications(updated)
        setActiveModalApp({ ...app, status: "Viewed" })
      } catch (err) {
        console.warn("Could not transition to Viewed:", err)
      }
    }
  }

  const toggleTalentPool = (appId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const next = talentPoolIds.includes(appId)
      ? talentPoolIds.filter((id) => id !== appId)
      : [...talentPoolIds, appId]
    setTalentPoolIds(next)
    localStorage.setItem("hirehub_recruiter_talent_pool", JSON.stringify(next))
    toast.success(
      next.includes(appId)
        ? "Candidate saved to Talent Pool!"
        : "Candidate removed from Talent Pool."
    )
  }

  // Filter applicants
  const filteredApplicants = useMemo(() => {
    let list = applications

    if (talentPoolOnly) {
      list = list.filter((a) => talentPoolIds.includes(a.id))
    }

    if (selectedJobId !== "all") {
      list = list.filter((a) => (a.job?.id || a.jobId) === selectedJobId)
    }

    if (selectedStatusFilter !== "all") {
      list = list.filter((a) => a.status === selectedStatusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.applicant?.name?.toLowerCase().includes(q) ||
          a.fullName?.toLowerCase().includes(q) ||
          a.applicant?.email?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.job?.title?.toLowerCase().includes(q) ||
          (a.applicationNumber || a.applicationCode || a.id).toLowerCase().includes(q) ||
          (a.skills || []).some((s) => s.toLowerCase().includes(q))
      )
    }

    return list
  }, [applications, selectedJobId, selectedStatusFilter, searchQuery, talentPoolOnly, talentPoolIds])

  // Drag & drop kanban status change
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("applicantId", id)
  }

  const handleDrop = async (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("applicantId")
    if (!id) return

    try {
      await applicationService.updateStatus(
        id,
        status,
        `Stage updated to ${status} via ATS pipeline.`,
        user?.id,
        user?.name || "Recruiter"
      )
      const updated = applications.map((a) => (a.id === id ? { ...a, status } : a))
      setApplications(updated)
      toast.success(`Candidate moved to ${status}`)
    } catch {
      toast.error("Failed to update status")
    }
  }

  // Manual status transition from Candidate Modal
  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!activeModalApp) return
    try {
      await applicationService.updateStatus(
        activeModalApp.id,
        newStatus,
        statusRemarks.trim() || `Status updated to ${newStatus}.`,
        user?.id,
        user?.name || "Recruiter"
      )
      const updated = applications.map((a) => (a.id === activeModalApp.id ? { ...a, status: newStatus } : a))
      setApplications(updated)
      setActiveModalApp({ ...activeModalApp, status: newStatus })
      setStatusRemarks("")
      toast.success(`Candidate status updated to ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  // Bulk actions
  const handleBulkStatusChange = async (status: ApplicationStatus) => {
    if (selectedIds.length === 0) return

    try {
      for (const id of selectedIds) {
        await applicationService.updateStatus(
          id,
          status,
          `Bulk stage update to ${status}.`,
          user?.id,
          user?.name || "Recruiter"
        )
      }
      const updated = applications.map((a) => (selectedIds.includes(a.id) ? { ...a, status } : a))
      setApplications(updated)
      toast.success(`Updated ${selectedIds.length} candidate(s) to ${status}`)
      setSelectedIds([])
    } catch {
      toast.error("Bulk update failed")
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (filteredApplicants.length === 0) {
      toast.error("No applicants to export")
      return
    }

    const headers = [
      "Application ID",
      "Candidate Name",
      "Email",
      "Phone",
      "Location",
      "Job Title",
      "Highest Education",
      "Experience",
      "Current Status",
      "Skills",
      "Status",
      "Applied Date",
      "ATS Match",
      "Internal Notes",
    ]
    const rows = filteredApplicants.map((a) => [
      a.applicationNumber || a.applicationCode || a.id,
      `"${a.fullName || a.applicant?.name || "Candidate"}"`,
      a.email || a.applicant?.email || "",
      a.mobileNumber || a.applicant?.phone || "",
      `"${a.currentLocation || a.applicant?.location || ""}"`,
      `"${a.job?.title || ""}"`,
      `"${a.highestEducation || a.highestQualification || ""}"`,
      `"${a.totalExperience || a.workExperience || ""}"`,
      `"${a.currentEmploymentStatus || ""}"`,
      `"${(a.skills || []).join(", ")}"`,
      a.status,
      a.appliedAt || "",
      `${a.atsScore || 85}%`,
      `"${a.notes || ""}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `hirehub-applicants-${Date.now()}.csv`
    link.click()
    toast.success("Applicants exported to CSV!")
  }

  // Export JSON
  const handleExportJSON = () => {
    if (filteredApplicants.length === 0) {
      toast.error("No applicants to export")
      return
    }
    const blob = new Blob([JSON.stringify(filteredApplicants, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `hirehub-applicants-${Date.now()}.json`
    link.click()
    toast.success("Applicants exported to JSON!")
  }

  // Save Recruiter Note
  const handleSaveNote = async () => {
    if (!activeModalApp || !recruiterNote.trim()) return
    setIsSavingNote(true)
    try {
      const createdNote = await applicationService.addRecruiterNote(
        activeModalApp.id,
        user?.id || "recruiter",
        user?.name || "Hiring Manager",
        recruiterNote.trim()
      )

      await applicationService.updateStatus(activeModalApp.id, activeModalApp.status, recruiterNote.trim())
      const updated = applications.map((a) => (a.id === activeModalApp.id ? { ...a, notes: recruiterNote.trim() } : a))
      setApplications(updated)
      setActiveModalApp({ ...activeModalApp, notes: recruiterNote.trim() })
      setCandidateNotes([createdNote, ...candidateNotes])
      setRecruiterNote("")
      toast.success("Private recruiter note recorded!")
    } catch {
      toast.error("Failed to save note")
    } finally {
      setIsSavingNote(false)
    }
  }

  // Schedule Interview confirmation
  const handleConfirmScheduleInterview = async () => {
    if (!activeModalApp) return
    setIsScheduling(true)
    try {
      const scheduled = await interviewService.scheduleInterview({
        applicationId: activeModalApp.id,
        jobId: activeModalApp.job?.id || activeModalApp.jobId || "job-1",
        candidateId: activeModalApp.applicant?.id || activeModalApp.userId || "usr-candidate",
        candidateName: activeModalApp.fullName || activeModalApp.applicant?.name || "Candidate",
        candidateEmail: activeModalApp.email || activeModalApp.applicant?.email || "candidate@hirehub.app",
        jobTitle: activeModalApp.job?.title || "Position",
        companyName: activeModalApp.job?.company?.name || "HireHub Employer",
        round: interviewForm.round,
        title: interviewForm.title,
        interviewTitle: interviewForm.title,
        interviewType: interviewForm.interviewType,
        date: interviewForm.date,
        time: interviewForm.time,
        durationMinutes: interviewForm.durationMinutes,
        platform: interviewForm.platform,
        meetingLink: interviewForm.meetingLink,
        location: interviewForm.location || undefined,
        interviewerId: user?.id,
        interviewerName: user?.name || "Hiring Manager",
        interviewerEmail: user?.email || "recruiter@hirehub.app",
        instructions: interviewForm.instructions,
        notes: interviewForm.notes,
        status: "scheduled",
      })

      // Update application stage to Interview Scheduled
      const updated = applications.map((a) =>
        a.id === activeModalApp.id
          ? {
              ...a,
              status: "Interview Scheduled" as ApplicationStatus,
              interviews: [...(a.interviews || []), scheduled],
            }
          : a
      )
      setApplications(updated)
      setActiveModalApp({ ...activeModalApp, status: "Interview Scheduled" })

      setIsScheduleModalOpen(false)
      toast.success(`Interview scheduled and invitation sent to ${activeModalApp.fullName || activeModalApp.applicant?.name}!`)
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule interview.")
    } finally {
      setIsScheduling(false)
    }
  }

  // Confirm Reschedule Interview
  const handleConfirmReschedule = async () => {
    if (!rescheduleInterviewTarget) return
    try {
      await interviewService.rescheduleInterview(
        rescheduleInterviewTarget.id,
        rescheduleForm.date,
        rescheduleForm.time,
        rescheduleForm.reason,
        user?.name || "Recruiter"
      )

      toast.success("Interview successfully rescheduled and candidate notified.")
      setRescheduleInterviewTarget(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to reschedule interview")
    }
  }

  // Confirm Cancel Interview
  const handleConfirmCancel = async () => {
    if (!cancelInterviewTarget) return
    try {
      await interviewService.cancelInterview(
        cancelInterviewTarget.id,
        cancelReason,
        user?.name || "Recruiter"
      )

      toast.success("Interview cancelled and candidate informed.")
      setCancelInterviewTarget(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel interview")
    }
  }

  // Submit Feedback Scorecard
  const handleSubmitFeedback = async () => {
    if (!activeModalApp) return
    setIsSubmittingFeedback(true)
    try {
      await interviewService.submitFeedback(activeModalApp.id, {
        score: scorecardForm.score,
        rating: scorecardForm.score,
        strengths: scorecardForm.strengths,
        weaknesses: scorecardForm.weaknesses,
        recommendation: scorecardForm.recommendation,
        result: scorecardForm.recommendation,
        notes: scorecardForm.notes,
        submittedBy: user?.name || "Lead Recruiter",
        interviewerId: user?.id,
      })

      const nextStatus: ApplicationStatus = scorecardForm.recommendation === "Strong Hire" ? "Selected" : "Interview Completed"
      const updated = applications.map((a) => (a.id === activeModalApp.id ? { ...a, status: nextStatus } : a))
      setApplications(updated)
      setActiveModalApp({ ...activeModalApp, status: nextStatus })

      setIsScorecardOpen(false)
      toast.success("Interview scorecard submitted to candidate file!")
    } catch {
      toast.error("Failed to submit scorecard.")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
              <Briefcase className="text-[#F7941D]" />
              <span>Applicants Management (ATS)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                11-Stage Workflow
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Kanban pipeline & candidate table, interview scheduling, scorecard evaluation, and applicant data export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* View Mode Switcher: Kanban vs Table */}
            <div className="p-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-[#101F3E] text-white dark:bg-[#F7941D] dark:text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <LayoutGrid size={14} /> Kanban
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#101F3E] text-white dark:bg-[#F7941D] dark:text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <TableIcon size={14} /> Candidate Table
              </button>
            </div>

            {/* Talent Pool Filter Toggle */}
            <button
              onClick={() => setTalentPoolOnly(!talentPoolOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                talentPoolOnly
                  ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                  : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:border-amber-500/60"
              }`}
            >
              <Star size={14} className={talentPoolOnly ? "fill-current" : "text-amber-500"} />
              <span>Talent Pool ({talentPoolIds.length})</span>
            </button>

            {/* Export Buttons */}
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download size={14} className="mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download size={14} className="mr-1.5" /> JSON
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={15} />
            <input
              type="text"
              placeholder="Search by candidate name, email, skills, job title, or application ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[#F7941D]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Job selector */}
            <CustomSelect
              value={selectedJobId}
              onChange={(val) => setSelectedJobId(String(val))}
              options={[
                { value: "all", label: `All Jobs (${jobs.length})` },
                ...jobs.map((j) => ({ value: j.id, label: j.title })),
              ]}
              size="sm"
              className="w-48"
            />

            {/* Status Filter */}
            <CustomSelect
              value={selectedStatusFilter}
              onChange={(val) => setSelectedStatusFilter(String(val))}
              options={[
                { value: "all", label: "All Statuses" },
                ...columns.map((c) => ({ value: c.id, label: c.title })),
              ]}
              size="sm"
              className="w-44"
            />
          </div>
        </div>

        {/* Bulk Action Banner */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--primary)] text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg"
            >
              <span className="text-xs font-bold">{selectedIds.length} candidate(s) selected</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkStatusChange("Shortlisted")}
                  className="text-xs bg-white text-[var(--primary)] hover:bg-white/90"
                >
                  Bulk Shortlist
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkStatusChange("Interview Scheduled")}
                  className="text-xs bg-white text-[var(--primary)] hover:bg-white/90"
                >
                  Bulk Interview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusChange("Rejected")}
                  className="text-xs border-white text-white hover:bg-white/20"
                >
                  Bulk Reject
                </Button>
                <button onClick={() => setSelectedIds([])} className="text-xs underline text-white ml-2 cursor-pointer">
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 1: KANBAN PIPELINE VIEW */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-8">
            {columns.map((column) => {
              const columnApps = filteredApplicants.filter((a) => a.status === column.id)

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className="bg-[var(--card)]/90 rounded-2xl border border-[var(--border)] p-3 flex flex-col min-w-[220px] min-h-[520px] shadow-xs"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]">
                    <h3 className="font-poppins font-bold text-xs text-[var(--foreground)] truncate pr-1">
                      {column.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${column.badgeColor}`}>
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Candidate cards */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {columnApps.map((app) => {
                      const isSelected = selectedIds.includes(app.id)
                      const isBookmarked = talentPoolIds.includes(app.id)
                      const candidateName = app.fullName || app.applicant?.name || "Candidate"

                      return (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          className={`p-3.5 rounded-xl border bg-[var(--background)] shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group ${
                            isSelected
                              ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                              : "border-[var(--border)] hover:border-[var(--primary)]/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedIds((prev) =>
                                  prev.includes(app.id) ? prev.filter((i) => i !== app.id) : [...prev, app.id]
                                )
                              }}
                              className="mt-1 accent-[var(--primary)] cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-[var(--foreground)] truncate">
                                {candidateName}
                              </h4>
                              <p className="text-[11px] text-[var(--muted-foreground)] truncate">{app.job?.title}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => toggleTalentPool(app.id, e)}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  isBookmarked ? "text-amber-500 fill-current" : "text-[var(--muted-foreground)] hover:text-amber-500"
                                }`}
                                title={isBookmarked ? "In Talent Pool" : "Save to Talent Pool"}
                              >
                                <Star size={13} className={isBookmarked ? "fill-current" : ""} />
                              </button>
                              <button
                                onClick={() => handleOpenCandidateModal(app)}
                                className="text-[var(--muted-foreground)] hover:text-[var(--primary)] p-1 cursor-pointer"
                                title="Inspect candidate profile"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Details line */}
                          <div className="text-[11px] text-[var(--muted-foreground)] space-y-0.5">
                            {app.totalExperience && (
                              <p className="truncate">Exp: <strong className="text-[var(--foreground)]">{app.totalExperience}</strong></p>
                            )}
                            {app.highestEducation && (
                              <p className="truncate">{app.highestEducation}</p>
                            )}
                          </div>

                          {/* Badges row */}
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[var(--border)]/60">
                            <span className="text-[var(--muted-foreground)]">
                              {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              ATS {app.atsScore || 85}%
                            </span>
                          </div>

                          {app.notes && (
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300 truncate">
                              <span className="font-semibold">Note:</span> {app.notes}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {columnApps.length === 0 && (
                      <div className="h-28 border border-dashed border-[var(--border)]/60 rounded-xl flex items-center justify-center text-[11px] text-[var(--muted-foreground)] text-center p-2">
                        No candidates in this stage
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* VIEW 2: CANDIDATE TABLE VIEW */}
        {viewMode === "table" && (
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)] font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredApplicants.length && filteredApplicants.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(filteredApplicants.map((a) => a.id))
                          else setSelectedIds([])
                        }}
                        className="accent-[var(--primary)]"
                      />
                    </th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Applied Job</th>
                    <th className="p-4">Application ID</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Experience & Education</th>
                    <th className="p-4">Skills</th>
                    <th className="p-4">Resume</th>
                    <th className="p-4">Stage Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[var(--muted-foreground)]">
                        No applicants match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((app) => {
                      const isSelected = selectedIds.includes(app.id)
                      const isBookmarked = talentPoolIds.includes(app.id)
                      const candidateName = app.fullName || app.applicant?.name || "Candidate"
                      const candidateEmail = app.email || app.applicant?.email || ""
                      const appCode = app.applicationNumber || app.applicationCode || app.id

                      return (
                        <tr key={app.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedIds((prev) =>
                                  prev.includes(app.id) ? prev.filter((i) => i !== app.id) : [...prev, app.id]
                                )
                              }}
                              className="accent-[var(--primary)]"
                            />
                          </td>
                          <td className="p-4 font-semibold text-[var(--foreground)]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs shrink-0">
                                {candidateName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold truncate text-xs">{candidateName}</p>
                                <p className="text-[11px] text-[var(--muted-foreground)] truncate">{candidateEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[var(--foreground)] font-semibold truncate max-w-[180px]">
                            {app.job?.title}
                          </td>
                          <td className="p-4 font-mono text-[11px] text-[var(--muted-foreground)]">
                            {appCode}
                          </td>
                          <td className="p-4 text-[var(--muted-foreground)]">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                          </td>
                          <td className="p-4 text-[var(--muted-foreground)] text-[11px] max-w-[180px]">
                            <p className="truncate font-semibold text-[var(--foreground)]">{app.totalExperience || "1-3 years"}</p>
                            <p className="truncate opacity-80">{app.highestEducation || "Bachelor's"}</p>
                          </td>
                          <td className="p-4 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {(app.skills || []).slice(0, 3).map((s) => (
                                <span key={s} className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[10px] font-semibold text-[var(--foreground)]">
                                  {s}
                                </span>
                              ))}
                              {(app.skills || []).length > 3 && (
                                <span className="text-[10px] text-[var(--muted-foreground)]">
                                  +{(app.skills || []).length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <a
                              href={app.resumeUrl || "/sample-resume.pdf"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                            >
                              <FileText size={12} /> Document
                            </a>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 whitespace-nowrap">
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => toggleTalentPool(app.id, e)}
                                className={`p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] cursor-pointer ${
                                  isBookmarked ? "text-amber-500 fill-current" : "text-[var(--muted-foreground)]"
                                }`}
                                title={isBookmarked ? "Bookmarked" : "Bookmark candidate"}
                              >
                                <Star size={13} className={isBookmarked ? "fill-current" : ""} />
                              </button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCandidateModal(app)}
                                className="text-xs"
                              >
                                View Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CANDIDATE INSPECTION & RECRUITER ATS MANAGEMENT MODAL */}
      <AnimatePresence>
        {activeModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center font-bold text-lg text-[var(--primary)]">
                    {(activeModalApp.fullName || activeModalApp.applicant?.name || "C").charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-poppins font-bold text-base text-[var(--foreground)]">
                        {activeModalApp.fullName || activeModalApp.applicant?.name || "Candidate Profile"}
                      </h2>
                      {talentPoolIds.includes(activeModalApp.id) && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold flex items-center gap-1">
                          <Star size={10} className="fill-current" /> Talent Pool
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Applied for: <strong>{activeModalApp.job?.title}</strong> • ID: <span className="font-mono">{activeModalApp.applicationNumber || activeModalApp.applicationCode || activeModalApp.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTalentPool(activeModalApp.id)}
                    className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Star size={14} className={talentPoolIds.includes(activeModalApp.id) ? "fill-current text-amber-500" : ""} />
                    <span>{talentPoolIds.includes(activeModalApp.id) ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    onClick={() => setActiveModalApp(null)}
                    className="p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Pipeline Stage Transition Dropdown with Audit Remarks */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[var(--foreground)]">Update Recruitment Milestone Stage:</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Current Status: <strong className="text-[var(--primary)]">{activeModalApp.status}</strong>
                      </p>
                    </div>
                    <CustomSelect
                      value={activeModalApp.status}
                      onChange={(val) => handleStatusChange(val as ApplicationStatus)}
                      options={columns.map((c) => ({ value: c.id, label: c.title }))}
                      size="sm"
                      className="w-56"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                      placeholder="Add stage update notes / remarks (e.g. Passed initial screening)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(activeModalApp.status)}
                    >
                      Log Stage Note
                    </Button>
                  </div>
                </div>

                {/* Candidate Contact & Professional Details */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3 text-xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <User size={14} /> Full Candidate Submission Profile
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[var(--muted-foreground)]">
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">Email:</span>
                      <span className="truncate">{activeModalApp.email || activeModalApp.applicant?.email}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">Mobile Phone:</span>
                      <span>{activeModalApp.mobileNumber || activeModalApp.applicant?.phone || "+1 (555) 349-2041"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">Location:</span>
                      <span>{activeModalApp.currentLocation || activeModalApp.applicant?.location || "San Francisco, CA"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">Highest Education:</span>
                      <span>{activeModalApp.highestEducation || activeModalApp.highestQualification || "Bachelor's Degree"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">Total Experience:</span>
                      <span>{activeModalApp.totalExperience || activeModalApp.workExperience || "1-3 years"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">Employment Status:</span>
                      <span>{activeModalApp.currentEmploymentStatus || "Employed"}</span>
                    </div>
                    {activeModalApp.expectedSalary && (
                      <div>
                        <span className="font-semibold text-[var(--foreground)] block">Expected Salary:</span>
                        <span>{activeModalApp.expectedSalary}</span>
                      </div>
                    )}
                    {activeModalApp.noticePeriod && (
                      <div>
                        <span className="font-semibold text-[var(--foreground)] block">Notice Period:</span>
                        <span>{activeModalApp.noticePeriod}</span>
                      </div>
                    )}
                  </div>

                  {activeModalApp.skills && activeModalApp.skills.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border)]">
                      <span className="font-semibold text-[var(--foreground)] block mb-1">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeModalApp.skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-semibold text-[11px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(activeModalApp.linkedinUrl || activeModalApp.portfolioUrl) && (
                    <div className="pt-2 border-t border-[var(--border)] flex gap-4 text-xs">
                      {activeModalApp.linkedinUrl && (
                        <a
                          href={activeModalApp.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink size={12} /> LinkedIn Profile
                        </a>
                      )}
                      {activeModalApp.portfolioUrl && (
                        <a
                          href={activeModalApp.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink size={12} /> Portfolio / GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons Toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="primary"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="w-full text-xs font-bold"
                  >
                    <Calendar size={15} className="mr-1.5" />
                    Schedule Interview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsScorecardOpen(true)}
                    className="w-full text-xs font-bold text-purple-600 dark:text-purple-400 border-purple-500/30"
                  >
                    <Award size={15} className="mr-1.5" />
                    Submit Scorecard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const candidateId = activeModalApp.userId || activeModalApp.applicant?.id
                      if (user?.id && candidateId) {
                        try {
                          const conv = await messageService.getOrCreateConversation({
                            currentUserId: user.id,
                            participantId: candidateId,
                            jobId: activeModalApp.jobId || activeModalApp.job?.id,
                            jobTitle: activeModalApp.job?.title || "Application",
                            companyName: activeModalApp.job?.company?.name || "HireHub Employer",
                          })
                          useMessageStore.getState().addConversation(conv)
                          useMessageStore.getState().setActiveConversationId(conv.id)
                          navigate("/messages")
                        } catch (err: any) {
                          toast.error(err.message || "Failed to initiate conversation.")
                        }
                      }
                    }}
                    className="w-full text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  >
                    <MessageSquare size={15} className="mr-1.5" />
                    Message Candidate
                  </Button>
                </div>

                {/* Cover Note Pitch */}
                {activeModalApp.coverLetter && (
                  <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-1">
                    <span className="text-xs font-bold text-[var(--foreground)]">Candidate Cover Note Pitch:</span>
                    <p className="text-xs text-[var(--muted-foreground)] italic leading-relaxed whitespace-pre-line">
                      "{activeModalApp.coverLetter}"
                    </p>
                  </div>
                )}

                {/* Resume Document Link */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText size={20} className="text-[var(--primary)]" />
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">Verified Candidate Resume Document</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        {activeModalApp.resumeName || activeModalApp.resumeUrl || "Candidate_Resume.pdf"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const url = await storageService.getResumeSignedUrl(activeModalApp.resumeUrl)
                      if (url && url.startsWith("http")) {
                        window.open(url, "_blank")
                      } else {
                        window.open("/sample-resume.pdf", "_blank")
                      }
                    }}
                  >
                    <Download size={14} className="mr-1" /> View / Download Resume
                  </Button>
                </div>

                {/* Screening Answers */}
                {activeModalApp.answers && Object.keys(activeModalApp.answers).length > 0 && (
                  <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-2">
                    <span className="text-xs font-bold text-[var(--foreground)]">Screening Responses:</span>
                    <div className="space-y-1 text-xs">
                      {Object.entries(activeModalApp.answers).map(([qKey, ans], idx) => (
                        <div key={qKey} className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                          <span className="font-semibold text-[var(--muted-foreground)]">Question {idx + 1}:</span>
                          <p className="font-bold text-[var(--foreground)] mt-0.5">{ans}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidential Internal Recruiter Notes Feed */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <StickyNote size={14} className="text-[var(--primary)]" />
                    Confidential Internal Recruiter Notes (Visible Only to Hiring Committee)
                  </label>
                  <textarea
                    rows={2}
                    value={recruiterNote}
                    onChange={(e) => setRecruiterNote(e.target.value)}
                    placeholder="Add interview observations, salary range discussions, or feedback from team reviewers..."
                    className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isSavingNote}
                      onClick={handleSaveNote}
                    >
                      Save Recruiter Note
                    </Button>
                  </div>

                  {candidateNotes.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[11px] font-bold text-[var(--muted-foreground)]">Prior Notes:</span>
                      {candidateNotes.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] text-xs space-y-0.5">
                          <div className="flex justify-between text-[10px] text-[var(--muted-foreground)]">
                            <span className="font-bold text-[var(--foreground)]">{n.authorName}</span>
                            <span>{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-[var(--foreground)]">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE INTERVIEW MODAL */}
      <AnimatePresence>
        {isScheduleModalOpen && activeModalApp && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[var(--primary)]" />
                  <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                    Schedule Interview Round
                  </h3>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[var(--muted-foreground)]">Candidate:</span>
                  <p className="font-bold text-[var(--foreground)]">
                    {activeModalApp.fullName || activeModalApp.applicant?.name} ({activeModalApp.email || activeModalApp.applicant?.email})
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">Interview Title</label>
                  <input
                    type="text"
                    value={interviewForm.title}
                    onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })}
                    placeholder="e.g. Technical Round 1 - Architecture"
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--foreground)] mb-1">Interview Round</label>
                    <CustomSelect
                      value={interviewForm.round}
                      onChange={(val) => setInterviewForm({ ...interviewForm, round: val as InterviewRound })}
                      options={[
                        { value: "Screening", label: "Screening" },
                        { value: "Technical", label: "Technical Deep-Dive" },
                        { value: "System Design", label: "System Design" },
                        { value: "Behavioral", label: "Behavioral (STAR)" },
                        { value: "Final", label: "Final / Executive" },
                      ]}
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--foreground)] mb-1">Interview Type</label>
                    <CustomSelect
                      value={interviewForm.interviewType}
                      onChange={(val) => setInterviewForm({ ...interviewForm, interviewType: val as any })}
                      options={[
                        { value: "Online", label: "Online Video Call" },
                        { value: "Phone", label: "Phone Screen" },
                        { value: "In-person", label: "In-person Onsite" },
                      ]}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--foreground)] mb-1">Interview Date</label>
                    <input
                      type="date"
                      value={interviewForm.date}
                      onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[var(--foreground)] mb-1">Time (Local)</label>
                    <input
                      type="time"
                      value={interviewForm.time}
                      onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">Meeting Platform & Link</label>
                  <input
                    type="text"
                    value={interviewForm.meetingLink}
                    onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  />
                </div>

                {interviewForm.interviewType === "In-person" && (
                  <div>
                    <label className="block font-bold text-[var(--foreground)] mb-1">Physical Location Address</label>
                    <input
                      type="text"
                      value={interviewForm.location}
                      onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                      placeholder="e.g. 500 Howard Street, Suite 400, San Francisco"
                      className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">Preparation Note / Instructions for Candidate</label>
                  <textarea
                    rows={2}
                    value={interviewForm.instructions}
                    onChange={(e) => setInterviewForm({ ...interviewForm, instructions: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button variant="ghost" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isScheduling}
                  onClick={handleConfirmScheduleInterview}
                >
                  Send Invitation & Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESCHEDULE INTERVIEW MODAL */}
      <AnimatePresence>
        {rescheduleInterviewTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                  <RotateCcw size={16} className="text-amber-500" /> Reschedule Interview
                </h3>
                <button onClick={() => setRescheduleInterviewTarget(null)} className="p-1 text-[var(--muted-foreground)]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-[var(--muted-foreground)]">
                  Rescheduling session for: <strong>{rescheduleInterviewTarget.candidateName}</strong>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">New Date</label>
                    <input
                      type="date"
                      value={rescheduleForm.date}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                      className="w-full p-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">New Time</label>
                    <input
                      type="time"
                      value={rescheduleForm.time}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                      className="w-full p-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Reason for Rescheduling</label>
                  <input
                    type="text"
                    value={rescheduleForm.reason}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button variant="ghost" size="sm" onClick={() => setRescheduleInterviewTarget(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmReschedule}>
                  Confirm Reschedule
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCEL INTERVIEW MODAL */}
      <AnimatePresence>
        {cancelInterviewTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" /> Cancel Interview Round
                </h3>
                <button onClick={() => setCancelInterviewTarget(null)} className="p-1 text-[var(--muted-foreground)]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-[var(--muted-foreground)]">
                  Cancel scheduled interview for <strong>{cancelInterviewTarget.candidateName}</strong> on {cancelInterviewTarget.date}?
                </p>
                <div>
                  <label className="block font-bold mb-1">Reason for Cancellation</label>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button variant="ghost" size="sm" onClick={() => setCancelInterviewTarget(null)}>
                  Keep Interview
                </Button>
                <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700" onClick={handleConfirmCancel}>
                  Confirm Cancellation
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERVIEW SCORECARD & FEEDBACK MODAL */}
      <AnimatePresence>
        {isScorecardOpen && activeModalApp && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-purple-600" />
                  <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                    Structured Candidate Evaluation Scorecard
                  </h3>
                </div>
                <button onClick={() => setIsScorecardOpen(false)} className="p-1 rounded-xl text-[var(--muted-foreground)]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[var(--muted-foreground)]">Evaluating Candidate:</span>
                  <p className="font-bold text-[var(--foreground)]">
                    {activeModalApp.fullName || activeModalApp.applicant?.name} for {activeModalApp.job?.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--foreground)] mb-1">Overall Rating (1 to 5 Stars)</label>
                    <CustomSelect
                      value={String(scorecardForm.score)}
                      onChange={(val) => setScorecardForm({ ...scorecardForm, score: Number(val) })}
                      options={[
                        { value: "5", label: "⭐⭐⭐⭐⭐ Exceptional (5)" },
                        { value: "4", label: "⭐⭐⭐⭐ Strong (4)" },
                        { value: "3", label: "⭐⭐⭐ Competent (3)" },
                        { value: "2", label: "⭐⭐ Needs Improvement (2)" },
                        { value: "1", label: "⭐ Unsatisfactory (1)" },
                      ]}
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--foreground)] mb-1">Final Recommendation</label>
                    <CustomSelect
                      value={scorecardForm.recommendation}
                      onChange={(val) => setScorecardForm({ ...scorecardForm, recommendation: val as any })}
                      options={[
                        { value: "Strong Hire", label: "Strong Hire" },
                        { value: "Hire", label: "Hire" },
                        { value: "Neutral", label: "Neutral / Borderline" },
                        { value: "No Hire", label: "No Hire" },
                      ]}
                      size="sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">Key Strengths Demonstrated</label>
                  <textarea
                    rows={2}
                    value={scorecardForm.strengths}
                    onChange={(e) => setScorecardForm({ ...scorecardForm, strengths: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">Areas for Development</label>
                  <textarea
                    rows={2}
                    value={scorecardForm.weaknesses}
                    onChange={(e) => setScorecardForm({ ...scorecardForm, weaknesses: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--foreground)] mb-1">Confidential Committee Notes</label>
                  <textarea
                    rows={2}
                    value={scorecardForm.notes}
                    onChange={(e) => setScorecardForm({ ...scorecardForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button variant="ghost" size="sm" onClick={() => setIsScorecardOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingFeedback}
                  onClick={handleSubmitFeedback}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Submit Scorecard & Advance
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
