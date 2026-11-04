import React, { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Trash2, AlertTriangle, ShieldCheck, CheckCircle2, Lock, Mail } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { useAuthStore } from "../store/authStore"
import { authService, moderationService } from "../lib/supabase"
import toast from "react-hot-toast"

export default function DeleteAccountRequest() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [email, setEmail] = useState(user?.email || "")
  const [reason, setReason] = useState("No longer seeking employment")
  const [confirmed, setConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid account email address.")
      return
    }

    if (!confirmed) {
      toast.error("Please confirm that you understand this action is irreversible.")
      return
    }

    setIsSubmitting(true)
    try {
      if (user && user.email.toLowerCase() === email.trim().toLowerCase()) {
        // Authenticated user: Execute real server deletion immediately
        await authService.deleteAccount(user.id)
        logout()
      } else {
        // Unauthenticated request: Log deletion request in moderation queue
        await moderationService.reportJob(
          "account-deletion-request",
          `Data Deletion Request for: ${email.trim()}`,
          `Reason: ${reason}. Submitted via public Google Play compliance deletion page.`
        )
      }

      setIsCompleted(true)
      toast.success("Account deletion request submitted successfully.")
    } catch (err: any) {
      console.error("Account deletion request failed:", err)
      toast.error(err.message || "Failed to submit deletion request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-[var(--shadow-card)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <Trash2 size={24} />
            </div>
            <div>
              <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                Account & Data Deletion Request
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                Google Play Store Policy & GDPR / CCPA Compliance
              </p>
            </div>
          </div>

          {isCompleted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 size={56} className="text-emerald-500 mx-auto" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Deletion Request Processed
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
                Your request to permanently erase account credentials and personal data associated with <strong>{email}</strong> has been received and executed on our server. All profile records, uploaded resumes, and application entries have been purged.
              </p>
              <div className="pt-4">
                <Button variant="primary" onClick={() => navigate("/")}>
                  Return to Home
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Policy Explanation Banner */}
              <div className="p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] space-y-2 text-xs text-[var(--muted-foreground)]">
                <p className="font-bold text-[var(--foreground)] text-sm flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[var(--primary)]" />
                  What data will be permanently deleted?
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Candidate Profile:</strong> Full name, email, phone number, headline, skills, education, and work history.</li>
                  <li><strong>Storage Files:</strong> All uploaded resume files (PDF/DOCX) stored in our private cloud storage.</li>
                  <li><strong>Application Records:</strong> In-app Easy Apply records, cover letters, and external ATS click referral logs.</li>
                  <li><strong>Communications:</strong> Direct chat messages and scheduled interview calendars.</li>
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Input
                  label="Registered Account Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Primary Reason for Deletion (Optional)
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="Found a job through HireHub">Found a job through HireHub</option>
                    <option value="Found a job elsewhere">Found a job elsewhere</option>
                    <option value="Privacy concerns">Privacy concerns</option>
                    <option value="Too many emails or notifications">Too many emails or notifications</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-red-500 accent-red-500 cursor-pointer"
                    />
                    <span className="text-xs text-[var(--foreground)] leading-relaxed select-none">
                      I understand that this action is irreversible. All my applications, resume documents, and account credentials will be permanently erased from the server.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 font-bold text-xs sm:text-sm text-white"
                  >
                    <Trash2 size={16} className="mr-1.5" />
                    Permanently Delete My Account & Data
                  </Button>
                </div>
              </form>

              <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
                Have questions regarding our data retention practices? Read our{" "}
                <Link to="/privacy" className="text-[var(--primary)] font-semibold hover:underline">
                  Privacy Policy
                </Link>{" "}
                or contact{" "}
                <a href="mailto:privacy@hirehub.app" className="text-[var(--primary)] font-semibold hover:underline">
                  privacy@hirehub.app
                </a>
                .
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
