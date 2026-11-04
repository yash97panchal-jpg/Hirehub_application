import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Clock, ExternalLink, Building2 } from "lucide-react"
import Button from "../ui/Button"
import type { Job } from "../../types"

interface ExternalApplyPromptModalProps {
  job: Job
  isOpen: boolean
  onConfirm: () => void
  onDecline: () => void
  onDismiss: () => void
}

export default function ExternalApplyPromptModal({
  job,
  isOpen,
  onConfirm,
  onDecline,
  onDismiss,
}: ExternalApplyPromptModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl relative text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 mx-auto flex items-center justify-center text-[var(--primary)]">
          <ExternalLink size={26} />
        </div>

        <div>
          <h3 className="font-poppins text-lg font-bold text-[var(--foreground)]">
            Did you finish applying?
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
            We noticed you visited <strong className="text-[var(--foreground)]">{job.company.name}</strong>'s official career portal for the <strong className="text-[var(--foreground)]">{job.title}</strong> opening.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs text-[var(--foreground)] text-left flex items-center gap-3">
          <Building2 size={24} className="text-[var(--primary)] shrink-0" />
          <div className="overflow-hidden">
            <p className="font-bold truncate">{job.title}</p>
            <p className="text-[11px] text-[var(--muted-foreground)] truncate">{job.company.name} · {job.location}</p>
          </div>
        </div>

        <p className="text-[11px] text-[var(--muted-foreground)]">
          Confirming helps keep your Application Tracker updated with interview deadlines and status reminders.
        </p>

        <div className="space-y-2 pt-1">
          <Button
            variant="primary"
            size="md"
            className="w-full font-bold justify-center"
            onClick={onConfirm}
          >
            <CheckCircle2 size={16} className="mr-1.5" /> Yes, I submitted my application
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={onDecline}
            >
              <XCircle size={14} className="mr-1" /> Not yet
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-[var(--muted-foreground)]"
              onClick={onDismiss}
            >
              <Clock size={14} className="mr-1" /> Ask later
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
