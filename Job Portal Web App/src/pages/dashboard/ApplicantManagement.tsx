import { useState } from "react"
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
} from "lucide-react"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import { isLocalhost } from "../../utils/env"

const initialApplicants = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Frontend Engineer",
    status: "applied",
    score: 87,
    appliedAt: "2d ago",
  },
  {
    id: 2,
    name: "Maria Garcia",
    role: "Frontend Engineer",
    status: "viewed",
    score: 79,
    appliedAt: "3d ago",
  },
  {
    id: 3,
    name: "David Kim",
    role: "Product Manager",
    status: "interview",
    score: 92,
    appliedAt: "1w ago",
  },
  {
    id: 4,
    name: "Sarah Lee",
    role: "UX Designer",
    status: "shortlisted",
    score: 81,
    appliedAt: "4d ago",
  },
  {
    id: 5,
    name: "James Smith",
    role: "Backend Developer",
    status: "applied",
    score: 65,
    appliedAt: "1d ago",
  },
]

const columns = [
  { id: "applied", title: "Applied" },
  { id: "viewed", title: "Viewed" },
  { id: "shortlisted", title: "Shortlisted" },
  { id: "interview", title: "Interview" },
  { id: "offered", title: "Offered" },
  { id: "rejected", title: "Rejected" },
]

export default function ApplicantManagement() {
  const [applicants, setApplicants] = useState(() =>
    isLocalhost() ? initialApplicants : []
  )
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [viewingResume, setViewingResume] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("applicantId", id.toString())
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const id = parseInt(e.dataTransfer.getData("applicantId"))
    setApplicants(
      applicants.map((app) => (app.id === id ? { ...app, status } : app)),
    )
  }

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const selectAll = () => {
    if (selectedIds.length === applicants.length) setSelectedIds([])
    else setSelectedIds(applicants.map((a) => a.id))
  }

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return
    if (action === "reject") {
      setApplicants(
        applicants.map((app) =>
          selectedIds.includes(app.id) ? { ...app, status: "rejected" } : app,
        ),
      )
    }
    setSelectedIds([])
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
              Applicant Management
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Manage candidates via Kanban board and bulk actions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={16}
              />
              <input
                type="text"
                placeholder="Search applicants..."
                className="pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--primary)] text-sm"
              />
            </div>
            <Button variant="outline">
              <Filter size={16} className="mr-2" /> Filters
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[var(--primary)] text-white p-4 rounded-2xl mb-6 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-4">
                <span className="font-semibold">
                  {selectedIds.length} selected
                </span>
                <div className="h-4 w-px bg-white/30" />
                <button
                  className="flex items-center gap-1 hover:text-white/80 text-sm font-medium transition-colors"
                  onClick={() => handleBulkAction("email")}
                >
                  <Mail size={16} /> Email
                </button>
                <button
                  className="flex items-center gap-1 hover:text-white/80 text-sm font-medium transition-colors"
                  onClick={() => handleBulkAction("reject")}
                >
                  <XCircle size={16} /> Reject
                </button>
                <button className="flex items-center gap-1 hover:text-white/80 text-sm font-medium transition-colors">
                  <Download size={16} /> Export
                </button>
              </div>
              <button
                onClick={() => setSelectedIds([])}
                className="hover:bg-white/20 p-1 rounded"
              >
                <XCircle size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
          {columns.map((col) => (
            <div
              key={col.id}
              className="min-w-[300px] w-[300px] bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 flex flex-col snap-center shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-[var(--foreground)] capitalize">
                  {col.title}
                </h3>
                <span className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-bold px-2 py-1 rounded-full">
                  {applicants.filter((a) => a.status === col.id).length}
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-3 min-h-[200px]">
                {applicants
                  .filter((a) => a.status === col.id)
                  .map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      className={`bg-[var(--background)] border rounded-xl p-4 cursor-grab active:cursor-grabbing shadow-sm hover:border-[var(--primary)] transition-colors relative group ${
                        selectedIds.includes(app.id)
                          ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelection(app.id)}
                        className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="pl-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-[var(--foreground)] text-sm">
                              {app.name}
                            </h4>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {app.role}
                            </p>
                          </div>
                          <GripVertical
                            size={14}
                            className="text-[var(--muted-foreground)] opacity-50"
                          />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <Badge
                            variant={app.score > 80 ? "success" : "default"}
                            size="sm"
                          >
                            {app.score}% ATS
                          </Badge>
                          <button
                            onClick={() => setViewingResume(app.id)}
                            className="p-1.5 bg-[var(--muted)] rounded hover:bg-[var(--primary)] hover:text-white transition-colors"
                            title="View Resume"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resume Viewer Modal */}
        {viewingResume && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/30">
                <h3 className="font-bold text-[var(--foreground)]">
                  Resume Viewer
                </h3>
                <button
                  onClick={() => setViewingResume(null)}
                  className="p-1 hover:bg-[var(--muted)] rounded-lg"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="flex-1 p-8 overflow-y-auto bg-[var(--background)]">
                <div className="max-w-2xl mx-auto border border-[var(--border)] bg-white dark:bg-neutral-900 p-8 shadow-sm h-[800px] flex items-center justify-center">
                  <div className="text-center">
                    <FileText
                      size={48}
                      className="mx-auto text-[var(--muted-foreground)] mb-4"
                    />
                    <p className="text-lg text-[var(--foreground)] font-medium">
                      Resume PDF Viewer
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Simulated document for{" "}
                      {applicants.find((a) => a.id === viewingResume)?.name}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
