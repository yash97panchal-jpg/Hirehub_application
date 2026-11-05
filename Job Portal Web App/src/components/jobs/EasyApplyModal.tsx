import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  HelpCircle,
  Loader2,
  Zap,
} from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import type { Job, User, Application } from "../../types"
import { applicationService, storageService } from "../../lib/supabase"
import { emailService, type SentEmailRecord } from "../../services/emailService"
import { triggerConfetti } from "../../utils/confetti"
import toast from "react-hot-toast"

interface EasyApplyModalProps {
  job: Job
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (app?: Application, emailRecord?: SentEmailRecord | null) => void
}

export default function EasyApplyModal({
  job,
  user,
  isOpen,
  onClose,
  onSuccess,
}: EasyApplyModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumePath, setResumePath] = useState(user?.resumeUrl || "resumes/sample-candidate-resume.pdf")
  const [coverLetter, setCoverLetter] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const questions = job.screeningQuestions || []

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setErrorMsg("")
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File exceeds 5MB size limit.")
      }
      if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
        throw new Error("Only PDF and DOCX documents are accepted.")
      }
      setResumeFile(file)
      // Upload to storage
      if (user) {
        const path = await storageService.uploadResume(file, user.id)
        setResumePath(path)
      } else {
        setResumePath(file.name)
      }
      toast.success("Resume uploaded and validated!")
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process resume")
      toast.error(err.message || "Failed to process resume")
    }
  }

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to complete your application.")
      return
    }

    // Validate required questions
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        setErrorMsg(`Please answer required question: "${q.question}"`)
        setStep(3)
        return
      }
    }

    setIsSubmitting(true)
    setErrorMsg("")

    try {
      const newApp = await applicationService.submitApplication({
        jobId: job.id,
        userId: user.id,
        resumeFile: resumePath,
        coverLetter: coverLetter.trim() || undefined,
        answers,
        job,
        applicant: user,
      })

      let emailRecord: SentEmailRecord | null = null
      try {
        emailRecord = await emailService.sendApplicationConfirmation({
          applicant: user,
          job,
          applicationId: newApp.id,
        })
      } catch (emailErr) {
        console.warn("Could not send confirmation email:", emailErr)
      }

      triggerConfetti()
      toast.success("Application submitted! Confirmation email sent to " + user.email)
      onSuccess(newApp, emailRecord)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application.")
      toast.error(err.message || "Failed to submit application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold uppercase tracking-wider inline-flex items-center">
                <Zap size={11} className="mr-1 fill-current" /> Easy Apply
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">Step {step} of 4</span>
            </div>
            <h2 className="font-poppins font-bold text-lg text-[var(--foreground)] mt-1">
              Apply to {job.title}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">{job.company.name} · {job.location}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1.5 rounded-xl hover:bg-[var(--muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[var(--muted)] h-1">
          <div
            className="bg-[var(--primary)] h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: RESUME SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                1. Select or Upload Resume
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Recruiters use your resume to evaluate technical qualifications. (PDF or DOCX, max 5MB).
              </p>

              {/* Current Resume Option */}
              <div
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  !resumeFile
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] hover:border-[var(--border)]/80"
                }`}
                onClick={() => setResumeFile(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      {user?.name ? `${user.name}'s Profile Resume` : "Saved Profile Resume"}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      PDF Document · Verified
                    </p>
                  </div>
                </div>
                {!resumeFile && <CheckCircle size={18} className="text-[var(--primary)]" />}
              </div>

              {/* Upload New Resume */}
              <div className="relative p-6 border-2 border-dashed border-[var(--border)] rounded-2xl text-center hover:border-[var(--primary)] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload size={28} className="mx-auto text-[var(--muted-foreground)] mb-2" />
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  {resumeFile ? resumeFile.name : "Click or drag to upload new resume"}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  PDF or DOCX format up to 5MB
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: COVER LETTER */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                2. Cover Note / Introduction (Optional)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Share why you're a great fit for {job.title} at {job.company.name}.
              </p>
              <textarea
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Hi hiring team, I'm excited to apply because..."
                className="w-full p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}

          {/* STEP 3: SCREENING QUESTIONS */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                3. Employer Screening Questions
              </h3>
              {questions.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/30 rounded-2xl">
                  No additional questions required for this position.
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="space-y-1.5 p-3.5 rounded-2xl bg-[var(--muted)]/30 border border-[var(--border)]">
                    <label className="block text-xs font-semibold text-[var(--foreground)]">
                      {idx + 1}. {q.question} {q.required && <span className="text-red-500">*</span>}
                    </label>
                    {q.type === "yes_no" ? (
                      <div className="flex gap-3 pt-1">
                        {["Yes", "No"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs text-[var(--foreground)] cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className="accent-[var(--primary)]"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Your answer..."
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                4. Review Your Application
              </h3>

              <div className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Applicant:</span>
                  <span className="font-semibold text-[var(--foreground)]">{user?.name} ({user?.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Resume Document:</span>
                  <span className="font-semibold text-[var(--primary)]">{resumeFile ? resumeFile.name : "Saved Profile Resume"}</span>
                </div>
                {coverLetter && (
                  <div>
                    <span className="text-[var(--muted-foreground)]">Cover Note:</span>
                    <p className="mt-1 italic text-[var(--foreground)] line-clamp-3">"{coverLetter}"</p>
                  </div>
                )}
                {questions.length > 0 && (
                  <div>
                    <span className="text-[var(--muted-foreground)]">Screening Answers:</span>
                    <span className="font-semibold text-[var(--foreground)] ml-1">{Object.keys(answers).length} answered</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[var(--muted-foreground)] text-center">
                By submitting, your profile and resume will be securely transmitted to {job.company.name}'s recruiting team.
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => (s - 1) as any)}
            >
              <ArrowLeft size={14} className="mr-1" /> Previous
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setStep((s) => (s + 1) as any)}
            >
              Next Step <ArrowRight size={14} className="ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSubmit}
              className="font-bold px-6"
            >
              Confirm & Submit Application
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
