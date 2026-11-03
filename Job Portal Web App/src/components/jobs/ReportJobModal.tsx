import { useState } from "react"
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import Button from "../ui/Button"

interface ReportJobModalProps {
  jobTitle: string
  companyName: string
  jobId: string
  isOpen: boolean
  onClose: () => void
}

const REPORT_REASONS = [
  "Requires payment, application fee or deposit (Scam)",
  "Suspicious employer or fake company",
  "Incorrect or misleading job details/salary",
  "Spam, repetitive listing, or expired position",
  "Discriminatory or offensive content",
  "Other policy violation",
]

export default function ReportJobModal({
  jobTitle,
  companyName,
  jobId,
  isOpen,
  onClose,
}: ReportJobModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0])
  const [details, setDetails] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Save report to localStorage for Admin moderation
    const existingReports = JSON.parse(localStorage.getItem("hirehub-job-reports") || "[]")
    const newReport = {
      id: Math.random().toString(36).substring(2, 9),
      jobId,
      jobTitle,
      companyName,
      reason: selectedReason,
      details,
      status: "pending",
      reportedAt: new Date().toISOString(),
    }
    localStorage.setItem("hirehub-job-reports", JSON.stringify([newReport, ...existingReports]))

    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      toast.success("Report submitted to HireHub Trust & Safety team.")
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-amber-500">
            <ShieldAlert size={20} />
            <h3 className="font-bold text-base text-[var(--foreground)]">Report Job Opening</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
            <h4 className="font-bold text-lg text-[var(--foreground)]">Report Received</h4>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto mt-1 mb-6">
              Thank you for helping keep HireHub safe. Our moderation team will investigate this listing immediately.
            </p>
            <Button variant="primary" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                <strong>Safety Guarantee:</strong> Legitimate employers on HireHub never demand registration fees or financial details during application.
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--foreground)]">Reporting Job:</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{jobTitle} • {companyName}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--foreground)] block mb-2">
                What is the issue with this job?
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] font-medium"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="mt-0.5 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--foreground)] block mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any evidence or details to help our review team..."
                rows={3}
                className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
