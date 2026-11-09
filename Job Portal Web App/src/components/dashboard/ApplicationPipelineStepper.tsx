import { Check, Clock, Sparkles, Award, XCircle, AlertCircle } from "lucide-react"
import type { ApplicationStatus } from "../../types"

interface ApplicationPipelineStepperProps {
  status: ApplicationStatus
  appliedAt?: string
  className?: string
}

const STAGES = [
  { id: "Applied", label: "Submitted", desc: "Application received" },
  { id: "Viewed", label: "Reviewed", desc: "Recruiter reviewed resume" },
  { id: "Shortlisted", label: "Shortlisted", desc: "Advanced to team review" },
  { id: "Interview", label: "Interview", desc: "Interview stage" },
  { id: "Offered", label: "Offer", desc: "Formal offer extended" },
]

export default function ApplicationPipelineStepper({
  status,
  appliedAt,
  className = "",
}: ApplicationPipelineStepperProps) {
  const getStageIndex = (st: ApplicationStatus): number => {
    switch (st) {
      case "Applied":
        return 0
      case "Viewed":
        return 1
      case "Shortlisted":
        return 2
      case "Interview":
        return 3
      case "Offered":
        return 4
      case "Rejected":
      case "Withdrawn":
        return -1
      default:
        return 0
    }
  }

  const currentIdx = getStageIndex(status)
  const isTerminalNegative = status === "Rejected" || status === "Withdrawn"

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bars & Nodes */}
      <div className="relative pt-2 pb-1">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 relative items-center">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentIdx > idx || status === "Offered"
            const isCurrent = currentIdx === idx && !isTerminalNegative

            return (
              <div key={stage.id} className="flex flex-col items-center text-center relative group">
                {/* Connecting track line to previous step */}
                {idx > 0 && (
                  <div
                    className={`absolute top-3.5 right-1/2 w-full h-1 -translate-y-1/2 -z-0 transition-colors duration-300 ${
                      isCompleted || (isCurrent && idx <= currentIdx)
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-700/60"
                    }`}
                  />
                )}

                {/* Node circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs relative z-10 transition-all shadow-xs ${
                    isCompleted
                      ? "bg-emerald-500 text-white ring-2 ring-emerald-500/30"
                      : isCurrent
                      ? "bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20 animate-pulse"
                      : "bg-slate-100 dark:bg-slate-800 text-[var(--muted-foreground)] border border-[var(--border)]"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={13} className="stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <span className="text-[10px]">{idx + 1}</span>
                  )}
                </div>

                {/* Stage Title */}
                <span
                  className={`text-[11px] font-bold mt-2 truncate max-w-full ${
                    isCurrent
                      ? "text-[var(--primary)] font-extrabold"
                      : isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {stage.label}
                </span>

                {/* Subtext description on larger screens */}
                <span className="text-[9px] text-[var(--muted-foreground)] hidden md:block line-clamp-1 mt-0.5">
                  {stage.desc}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Terminal status notice if Rejected or Withdrawn */}
      {status === "Rejected" && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <XCircle size={15} className="shrink-0" />
          <span>Application Closed: Position filled or candidate not selected for this cohort.</span>
        </div>
      )}

      {status === "Withdrawn" && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <AlertCircle size={15} className="shrink-0" />
          <span>Application Withdrawn: You withdrew this submission. Your profile remains active.</span>
        </div>
      )}

      {status === "Offered" && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
          <Award size={16} className="text-emerald-500 shrink-0" />
          <span>Congratulations! A formal employment offer has been extended by the hiring team.</span>
        </div>
      )}
    </div>
  )
}
