import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2 } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import Button from "../components/ui/Button"

export default function Privacy() {
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
              <Shield size={24} />
            </div>
            <div>
              <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                HireHub Privacy Policy
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                Effective Date: November 4, 2026 &bull; Version 2.0 (Legal Compliance Placeholder)
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[var(--muted-foreground)] space-y-6 leading-relaxed">
            <section className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)]">
              <p className="font-semibold text-[var(--foreground)] mb-1">
                Notice to Evaluators and Counsel:
              </p>
              <p>
                This document serves as the official privacy disclosure placeholder for the HireHub job platform. Replace the bracketed terms below with your jurisdiction-specific legal entities and registered office details.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                1. Information We Collect
              </h2>
              <p>
                When you create an account, apply for jobs, or recruit talent through HireHub, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li><strong>Identity Data:</strong> Full name, professional headline, email address, and authentication credentials managed securely via Supabase Auth.</li>
                <li><strong>Candidate Documents:</strong> Uploaded resumes (PDF/DOCX), cover letters, screening answers, and portfolio URLs stored in private Supabase Storage buckets.</li>
                <li><strong>Employer Data:</strong> Company name, registration documents, workplace location, corporate website, and recruiter member designations.</li>
                <li><strong>Usage & Telemetry:</strong> Log data, external ATS redirection clicks, timestamped application status updates, and session cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                2. How We Use Your Data
              </h2>
              <p>
                We use collected information solely to facilitate job discovery, power ATS matching algorithms, enable recruiter communications, and ensure platform safety. We do not sell your personal data to data brokers or third-party advertisers.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                3. Third-Party ATS & External Apply Redirects
              </h2>
              <p>
                When you choose to apply via an employer's external website or Applicant Tracking System (such as Greenhouse, Lever, or Workable), you will be transferred to their external domain with secure attributes (<code>rel="noopener noreferrer"</code>). We log the referral timestamp to provide your application tracker with self-reporting status updates.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                4. Data Security, Row-Level Security (RLS) & Storage
              </h2>
              <p>
                Candidate resumes are stored in private cloud storage and can only be accessed via time-limited signed URLs generated for verified company recruiters and the applying candidate. Postgres Row-Level Security policies prevent unauthorized access across tenant boundaries.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                5. Account Deletion & Right to Erasure (GDPR / CCPA)
              </h2>
              <p>
                You retain the right to delete your HireHub account at any time through your Profile Settings. Account deletion triggers an immediate cascade delete across server-side databases, permanently erasing your profile, uploaded resumes, in-app applications, and external click logs.
              </p>
              <p className="mt-2">
                In compliance with Google Play Store policies and GDPR, you can also submit an account removal request at any time through our public{" "}
                <Link to="/delete-account" className="text-[var(--primary)] font-bold hover:underline">
                  Account & Data Deletion Request Portal
                </Link>{" "}
                without needing to be signed in.
              </p>
            </section>

            <section>
              <h2 className="font-poppins text-base sm:text-lg font-bold text-[var(--foreground)] mb-2">
                6. Contact Our Data Protection Officer
              </h2>
              <p>
                For privacy inquiries or compliance requests, contact our team at{" "}
                <a href="mailto:privacy@hirehub.app" className="text-[var(--primary)] font-bold hover:underline">
                  privacy@hirehub.app
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[var(--muted-foreground)]">
              Also review our <Link to="/terms" className="text-[var(--primary)] hover:underline font-semibold">Terms of Service</Link> and <Link to="/cookies" className="text-[var(--primary)] hover:underline font-semibold">Cookie Policy</Link>.
            </span>
            <Button variant="primary" size="sm" onClick={() => navigate("/")}>
              Return to Marketplace
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
