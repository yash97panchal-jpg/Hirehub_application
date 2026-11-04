import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import Button from "../components/ui/Button"

export default function Terms() {
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
              <FileText size={24} />
            </div>
            <div>
              <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                HireHub Terms of Service
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                Last Updated: November 4, 2026 &bull; Master Marketplace Agreement Placeholder
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[var(--muted-foreground)] space-y-6 leading-relaxed">
            <section className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)]">
              <p className="font-semibold text-[var(--foreground)] mb-1">
                Notice of Placeholder Agreement:
              </p>
              <p>
                These Terms of Service govern your access to the HireHub website, APIs, mobile applications, and recruitment services. Fill the defined covenants below with counsel-reviewed clauses.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                1. Acceptance of Terms & Eligibility
              </h2>
              <p>
                By creating a HireHub account or browsing listings, you agree to be bound by these Terms. You represent that you are at least 18 years of age and possess full legal authority to enter into these terms.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                2. Recruiter Onboarding & Company Verification
              </h2>
              <p>
                Recruiter accounts are granted posting capabilities only after company approval by HireHub system administrators. Unverified companies with "pending" status cannot publish public job listings. HireHub reserves the right to reject, suspend, or block any employer that violates non-discrimination rules or posts misleading job information.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                3. Job Seeker Easy Apply & External Applications
              </h2>
              <p>
                HireHub provides both in-app ("Easy Apply") submission pipelines and external links to employer applicant tracking systems ("External Apply"). Candidates agree that submitted application details, resumes, and screening responses are truthful and accurate.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                4. Prohibited Platform Conduct
              </h2>
              <p>
                Users agree not to: (a) deploy automated web scrapers or unauthorized spiders against HireHub or employer ATS links, (b) post fraudulent, spam, or multi-level marketing positions, (c) upload malicious payloads disguised as resume documents, or (d) attempt to circumvent database Row-Level Security checks.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                5. Mobile In-App Purchases & Pricing
              </h2>
              <p>
                All mobile subscription upgrades conform to native platform store requirements (Apple Store and Google Play). Enterprise invoicing is handled via executed corporate insertion orders.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                6. Limitation of Liability
              </h2>
              <p>
                HireHub is a technology marketplace and is not an employment agency. We do not guarantee job placement, interview scheduling, or candidate quality.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[var(--muted-foreground)]">
              Questions? Read our <Link to="/privacy" className="text-[var(--primary)] hover:underline font-semibold">Privacy Policy</Link> or <Link to="/contact" className="text-[var(--primary)] hover:underline font-semibold">Contact Support</Link>.
            </span>
            <Button variant="primary" size="sm" onClick={() => navigate("/")}>
              I Understand & Agree
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
