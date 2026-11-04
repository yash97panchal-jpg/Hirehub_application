import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  Mail,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from "lucide-react"
import { Link } from "react-router-dom"
import Button from "../ui/Button"
import type { Job, User } from "../../types"
import type { SentEmailRecord } from "../../services/emailService"

interface ApplicationSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
  user: User | null
  emailRecord: SentEmailRecord | null
}

export default function ApplicationSuccessModal({
  isOpen,
  onClose,
  job,
  user,
  emailRecord,
}: ApplicationSuccessModalProps) {
  const [showEmailPreview, setShowEmailPreview] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle size={36} className="text-white" />
          </div>
          <h2 className="font-poppins font-bold text-2xl tracking-tight">Application Submitted!</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Your application was successfully delivered to {job.company.name}.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Email Confirmation Notice */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
              <Mail size={18} />
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--foreground)]">Confirmation Email Dispatched</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Delivered
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Sent to <strong className="text-[var(--foreground)]">{user?.email || "your registered email"}</strong> with full company details, role specs, and status reference.
              </p>
              {emailRecord && (
                <button
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  {showEmailPreview ? "Hide Email Content" : "View Dispatched Email Preview"}
                  {showEmailPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Email Preview */}
          {showEmailPreview && emailRecord && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] text-xs space-y-2 font-mono overflow-x-auto"
            >
              <div className="text-[var(--muted-foreground)] border-b border-[var(--border)] pb-2">
                <div><strong>Subject:</strong> {emailRecord.subject}</div>
                <div><strong>To:</strong> {emailRecord.to}</div>
                <div><strong>Timestamp:</strong> {new Date(emailRecord.timestamp).toLocaleString()}</div>
              </div>
              <div className="pt-2 text-[var(--foreground)]">
                <p>Status: <strong>Applied (Under Review)</strong></p>
                <p>Company: <strong>{emailRecord.companyName}</strong> ({emailRecord.companyLocation})</p>
                <p>Role: <strong>{emailRecord.jobTitle}</strong> ({emailRecord.jobType})</p>
                <p>Salary: <strong>{emailRecord.salary}</strong></p>
                <p>Application ID: <code>{emailRecord.applicationId}</code></p>
              </div>
            </motion.div>
          )}

          {/* Details Summary Card */}
          <div className="p-4 rounded-2xl bg-[var(--muted)]/30 border border-[var(--border)] space-y-3">
            <div className="text-[11px] uppercase tracking-wider font-bold text-[var(--muted-foreground)]">
              Submission Overview
            </div>

            <div className="flex items-center gap-3">
              <img
                src={job.company.logo || "https://www.google.com/s2/favicons?domain=google.com&sz=128"}
                alt={job.company.name}
                className="w-12 h-12 rounded-xl object-contain p-1 bg-white dark:bg-slate-900 border border-[var(--border)] shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--foreground)] text-sm truncate">{job.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 mt-0.5">
                  <Building size={13} /> {job.company.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] text-xs">
              <div>
                <span className="text-[var(--muted-foreground)] block">Location</span>
                <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-emerald-500" /> {job.location}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] block">Job Type</span>
                <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
                  <Briefcase size={12} className="text-[var(--primary)]" /> {job.type}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] block">Application Status</span>
                <span className="font-bold text-emerald-500 mt-0.5 block">Applied</span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] block">Submitted On</span>
                <span className="font-semibold text-[var(--foreground)] flex items-center gap-1 mt-0.5">
                  <Calendar size={12} /> Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[var(--border)] bg-[var(--muted)]/20 flex flex-col sm:flex-row gap-3">
          <Link to="/tracker" className="flex-1" onClick={onClose}>
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <Briefcase size={16} /> Open Application Tracker
            </Button>
          </Link>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Browse More Jobs
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
