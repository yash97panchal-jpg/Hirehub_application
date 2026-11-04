import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Cookie, CheckCircle, ShieldCheck } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import Button from "../components/ui/Button"

export default function Cookies() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 md:p-12 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <Cookie size={24} />
            </div>
            <div>
              <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                HireHub Cookie Policy
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                Effective Date: November 4, 2026 &bull; Cookie Transparency Statement Placeholder
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[var(--muted-foreground)] space-y-6 leading-relaxed">
            <section className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)]">
              <p className="font-semibold text-[var(--foreground)] mb-1">
                About This Cookie Notice:
              </p>
              <p>
                HireHub uses essential cookies and local storage tokens to preserve session security, remember user authentication, and optimize marketplace performance.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                1. Types of Cookies We Use
              </h2>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <h3 className="font-bold text-[var(--foreground)] text-xs mb-1">
                    Essential Security & Auth Tokens (Required)
                  </h3>
                  <p>
                    Maintains your authenticated session via Supabase Auth JSON Web Tokens (JWT). These cookies do not track you across unrelated web properties.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <h3 className="font-bold text-[var(--foreground)] text-xs mb-1">
                    User Preferences & Theme Storage
                  </h3>
                  <p>
                    Preserves your dark/light mode preference, active filter states in the Job Directory, and dismissed banners across application launches.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <h3 className="font-bold text-[var(--foreground)] text-xs mb-1">
                    Application Tracker & Referral Verification
                  </h3>
                  <p>
                    Temporarily stores application state while you navigate to an employer's external ATS page to trigger the return confirmation dialog.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                2. Managing Your Cookie Preferences
              </h2>
              <p>
                You can configure your browser to block or alert you about cookies. Note that disabling essential security cookies will prevent sign-in and job application submission.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                3. Third-Party Links & External Job Boards
              </h2>
              <p>
                When clicking "Apply on company site", you leave HireHub and enter the third party's domain. We encourage you to review their specific cookie and privacy terms.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[var(--muted-foreground)]">
              Read our full <Link to="/privacy" className="text-[var(--primary)] hover:underline font-semibold">Privacy Policy</Link>.
            </span>
            <Button variant="primary" size="sm" onClick={() => navigate("/")}>
              Accept & Return
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
