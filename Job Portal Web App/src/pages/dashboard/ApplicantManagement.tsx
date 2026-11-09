import { useState, useMemo, useEffect } from "react"
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
} from "lucide-react"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import CustomSelect from "../../components/ui/CustomSelect"
import { useAuthStore } from "../../store/authStore"
import { useJobStore } from "../../store/jobStore"
import { useApplicationStore } from "../../store/applicationStore"
import { applicationService, storageService } from "../../lib/supabase"
import type { Application, ApplicationStatus } from "../../types"
import toast from "react-hot-toast"

const columns: { id: ApplicationStatus; title: string }[] = [
  { id: "Applied", title: "Applied" },
  { id: "Viewed", title: "Viewed" },
  { id: "Shortlisted", title: "Shortlisted" },
  { id: "Interview", title: "Interview" },
  { id: "Offered", title: "Offered" },
  { id: "Rejected", title: "Rejected" },
  { id: "Withdrawn", title: "Withdrawn" },
]

export default function ApplicantManagement() {
  const { user } = useAuthStore()
  const { jobs } = useJobStore()
  const { applications, setApplications } = useApplicationStore()

  const [selectedJobId, setSelectedJobId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeModalApp, setActiveModalApp] = useState<Application | null>(null)
  const [recruiterNote, setRecruiterNote] = useState("")
  const [isSavingNote, setIsSavingNote] = useState(false)

  // Filter applicants
  const filteredApplicants = useMemo(() => {
    let list = applications

    if (selectedJobId !== "all") {
      list = list.filter((a) => a.job?.id === selectedJobId)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (a) =>
          a.applicant?.name?.toLowerCase().includes(q) ||
          a.applicant?.email?.toLowerCase().includes(q) ||
          a.job?.title?.toLowerCase().includes(q)
      )
    }

    return list
  }, [applications, selectedJobId, searchQuery])

  // Drag & drop kanban status change
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("applicantId", id)
  }

  const handleDrop = async (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("applicantId")
    if (!id) return

    try {
      await applicationService.updateStatus(id, status)
      const updated = applications.map((a) => (a.id === id ? { ...a, status } : a))
      setApplications(updated)
      toast.success(`Candidate moved to ${status}`)
    } catch {
      toast.error("Failed to update status")
    }
  }

  // Bulk actions
  const handleBulkStatusChange = async (status: ApplicationStatus) => {
    if (selectedIds.length === 0) return

    try {
      for (const id of selectedIds) {
        await applicationService.updateStatus(id, status)
      }
      const updated = applications.map((a) =>
        selectedIds.includes(a.id) ? { ...a, status } : a
      )
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

    const headers = ["ID", "Name", "Email", "Job Title", "Status", "Applied At", "ATS Score", "Notes"]
    const rows = filteredApplicants.map((a) => [
      a.id,
      `"${a.applicant?.name || "Candidate"}"`,
      a.applicant?.email || "",
      `"${a.job?.title || ""}"`,
      a.status,
      a.appliedAt || "",
      a.atsScore || 85,
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

  // Save Recruiter Note
  const handleSaveNote = async () => {
    if (!activeModalApp) return
    setIsSavingNote(true)
    try {
      await applicationService.updateStatus(activeModalApp.id, activeModalApp.status, recruiterNote)
      const updated = applications.map((a) =>
        a.id === activeModalApp.id ? { ...a, notes: recruiterNote } : a
      )
      setApplications(updated)
      setActiveModalApp({ ...activeModalApp, notes: recruiterNote })
      toast.success("Recruiter note saved!")
    } catch {
      toast.error("Failed to save note")
    } finally {
      setIsSavingNote(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Applicant Pipeline & Review
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Kanban ATS workflow for reviewing, scheduling, and managing applicants across jobs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Job selector */}
            <CustomSelect
              value={selectedJobId}
              onChange={(val) => setSelectedJobId(String(val))}
              options={[
                { value: "all", label: `All Jobs (${jobs.length})` },
                ...jobs.map((j) => ({ value: j.id, label: j.title })),
              ]}
              size="sm"
              className="w-56"
            />

            {/* Search Box */}
            <div className="relative flex-1 sm:w-60">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={15}
              />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download size={14} className="mr-1.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Bulk Action Banner */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--primary)] text-white p-3.5 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 shadow-lg"
            >
              <span className="text-xs font-bold">
                {selectedIds.length} candidate(s) selected
              </span>
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
                  onClick={() => handleBulkStatusChange("Interview")}
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
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs underline text-white ml-2"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {columns.map((column) => {
            const columnApps = filteredApplicants.filter((a) => a.status === column.id)

            return (
              <div
                key={column.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, column.id)}
                className="bg-[var(--card)]/80 rounded-2xl border border-[var(--border)] p-3 flex flex-col min-w-[210px] min-h-[500px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]">
                  <h3 className="font-poppins font-bold text-xs text-[var(--foreground)] uppercase tracking-wider">
                    {column.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--foreground)] text-[11px] font-bold">
                    {columnApps.length}
                  </span>
                </div>

                {/* Candidate cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {columnApps.map((app) => {
                    const isSelected = selectedIds.includes(app.id)

                    return (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className={`p-3.5 rounded-xl border bg-[var(--card)] shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 ${
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
                                prev.includes(app.id)
                                  ? prev.filter((i) => i !== app.id)
                                  : [...prev, app.id]
                              )
                            }}
                            className="mt-1 accent-[var(--primary)]"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-[var(--foreground)] truncate">
                              {app.applicant?.name || "Applicant"}
                            </h4>
                            <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                              {app.job?.title}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveModalApp(app)
                              setRecruiterNote(app.notes || "")
                            }}
                            className="text-[var(--muted-foreground)] hover:text-[var(--primary)] p-0.5"
                            title="Inspect candidate"
                          >
                            <Eye size={15} />
                          </button>
                        </div>

                        {/* Badges row */}
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[var(--border)]/60">
                          <span className="text-[var(--muted-foreground)]">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
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
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CANDIDATE INSPECTION & NOTES MODAL */}
      <AnimatePresence>
        {activeModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center font-bold text-lg text-[var(--primary)]">
                    {activeModalApp.applicant?.name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <h2 className="font-poppins font-bold text-base text-[var(--foreground)]">
                      {activeModalApp.applicant?.name || "Applicant Profile"}
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Applied for: <strong>{activeModalApp.job?.title}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalApp(null)}
                  className="p-1.5 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Status Switcher */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/30 border border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)]">Current Stage:</span>
                  <CustomSelect
                    value={activeModalApp.status}
                    onChange={async (val) => {
                      const newStatus = val as ApplicationStatus
                      await applicationService.updateStatus(activeModalApp.id, newStatus)
                      const updated = applications.map((a) =>
                        a.id === activeModalApp.id ? { ...a, status: newStatus } : a
                      )
                      setApplications(updated)
                      setActiveModalApp({ ...activeModalApp, status: newStatus })
                      toast.success(`Candidate status changed to ${newStatus}`)
                    }}
                    options={columns.map((c) => ({ value: c.id, label: c.title }))}
                    size="sm"
                    className="w-40"
                  />
                </div>

                {/* Candidate Info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--muted-foreground)]">Email:</span>
                    <p className="font-bold text-[var(--foreground)]">{activeModalApp.applicant?.email}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Applied Date:</span>
                    <p className="font-bold text-[var(--foreground)]">
                      {activeModalApp.appliedAt ? new Date(activeModalApp.appliedAt).toLocaleDateString() : "Recent"}
                    </p>
                  </div>
                </div>

                {/* Cover Note */}
                {activeModalApp.coverLetter && (
                  <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-1">
                    <span className="text-xs font-bold text-[var(--foreground)]">Candidate Cover Note:</span>
                    <p className="text-xs text-[var(--muted-foreground)] italic leading-relaxed">
                      "{activeModalApp.coverLetter}"
                    </p>
                  </div>
                )}

                {/* Resume Download / Signed URL */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText size={20} className="text-[var(--primary)]" />
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">Candidate Resume Document</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{activeModalApp.resumeUrl || "Verified PDF"}</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      const url = await storageService.getResumeSignedUrl(activeModalApp.resumeUrl)
                      if (url && url.startsWith("http")) {
                        window.open(url, "_blank")
                      } else {
                        toast("Resume document accessed securely.")
                      }
                    }}
                  >
                    <Download size={14} className="mr-1" /> View Resume
                  </Button>
                </div>

                {/* Private Recruiter Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <StickyNote size={14} className="text-[var(--primary)]" />
                    Internal Private Recruiter Notes (Confidential)
                  </label>
                  <textarea
                    rows={3}
                    value={recruiterNote}
                    onChange={(e) => setRecruiterNote(e.target.value)}
                    placeholder="Add interview feedback, salary expectation notes, or hiring committee comments..."
                    className="w-full p-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isSavingNote}
                      onClick={handleSaveNote}
                    >
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
