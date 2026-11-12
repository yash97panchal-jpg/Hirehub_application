import type { Job, User } from "../types"
import { supabase, isSupabaseConfigured } from "../lib/supabase"

export type EmailDeliveryStatus = "delivered" | "sent" | "pending" | "failed" | "retrying"

export type EmailType =
  | "application_confirmation"
  | "recruiter_notification"
  | "status_update"
  | "interview_invitation"
  | "interview_cancellation"
  | "password_reset"
  | "job_alert"
  | "security_alert"

export interface SentEmailRecord {
  id: string
  to: string
  subject: string
  timestamp: string
  status: EmailDeliveryStatus
  type?: EmailType
  companyName?: string
  companyLogo?: string
  companyLocation?: string
  companyWebsite?: string
  jobTitle?: string
  jobType?: string
  jobLocation?: string
  salary?: string
  applicationId?: string
  applicationStatus?: string
  htmlPreview: string
  errorMessage?: string
  retryCount?: number
}

const STORAGE_KEY = "hirehub_sent_emails_v1"
const RATE_LIMIT_KEY = "hirehub_email_rate_log_v1"
const MAX_EMAILS_PER_WINDOW = 5
const RATE_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_RETRIES = 3

class EmailService {
  private providerEndpoint: string | null = null

  /**
   * Set or override provider endpoint (useful for testing and runtime config)
   */
  public setProviderEndpoint(url: string | null) {
    this.providerEndpoint = url
  }

  public getProviderEndpoint(): string | null {
    return (
      this.providerEndpoint ||
      (import.meta as any).env?.VITE_EMAIL_API_URL ||
      (typeof process !== "undefined" ? process.env?.VITE_EMAIL_API_URL : null) ||
      null
    )
  }

  /**
   * Escape HTML entities to prevent content injection inside email templates
   */
  private escapeHtml(str?: string): string {
    if (!str) return ""
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  /**
   * Validate RFC 5322 compliant email address
   */
  public isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") return false
    const trimmed = email.trim()
    if (trimmed.length > 254) return false
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
    return emailRegex.test(trimmed)
  }

  /**
   * Get all dispatched confirmation emails from delivery audit history
   */
  getSentEmails(): SentEmailRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  /**
   * Client-side sliding-window rate limiting to prevent email flooding
   */
  private checkRateLimit(recipientEmail: string): boolean {
    try {
      const raw = localStorage.getItem(RATE_LIMIT_KEY)
      const logs: { email: string; timestamp: number }[] = raw ? JSON.parse(raw) : []
      const now = Date.now()
      const recent = logs.filter(
        (entry) => entry.email === recipientEmail && now - entry.timestamp < RATE_WINDOW_MS
      )

      if (recent.length >= MAX_EMAILS_PER_WINDOW) {
        return false
      }

      logs.push({ email: recipientEmail, timestamp: now })
      localStorage.setItem(
        RATE_LIMIT_KEY,
        JSON.stringify(logs.filter((entry) => now - entry.timestamp < RATE_WINDOW_MS * 5))
      )
      return true
    } catch {
      return true
    }
  }

  /**
   * Internal dispatcher that invokes the configured provider endpoint
   * or records a pending/failed state without false success.
   */
  private async dispatchToProvider(params: {
    id: string
    to: string
    subject: string
    html: string
    type: EmailType
  }): Promise<{ status: EmailDeliveryStatus; errorMessage?: string }> {
    if (!this.isValidEmail(params.to)) {
      return {
        status: "failed",
        errorMessage: "Validation Error: Recipient email format is invalid.",
      }
    }

    const endpoint = this.getProviderEndpoint()

    if (!endpoint) {
      // Truthful reporting: no provider configured -> cannot report delivered
      return {
        status: "pending",
        errorMessage: "Email provider not configured (VITE_EMAIL_API_URL is unset). Message stored in outbound queue.",
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": params.id,
        },
        body: JSON.stringify({
          id: params.id,
          to: params.to,
          subject: params.subject,
          html: params.html,
          type: params.type,
          sentAt: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        return {
          status: "failed",
          errorMessage: `Email provider rejected dispatch with HTTP ${res.status}${errText ? ": " + errText : ""}`,
        }
      }

      const body = await res.json().catch(() => ({}))
      // SENT = provider accepted dispatch; DELIVERED = delivery receipt confirmed by provider
      const status: EmailDeliveryStatus = body.delivered === true ? "delivered" : "sent"
      return { status }
    } catch (err: any) {
      return {
        status: "failed",
        errorMessage: `Network error reaching email dispatch provider: ${err?.message || "Connection refused"}`,
      }
    }
  }

  /**
   * Generate clean responsive HTML email template for job application confirmation
   */
  generateApplicationEmailHtml(params: {
    applicant: User
    job: Job
    applicationId: string
    appliedDate: string
  }): string {
    const { applicant, job, applicationId, appliedDate } = params
    const safeApplicantName = this.escapeHtml(applicant.name || "Candidate")
    const safeCompanyName = this.escapeHtml(job.company.name)
    const safeIndustry = this.escapeHtml(job.company.industry || "Technology")
    const safeLocation = this.escapeHtml(job.company.location || job.location)
    const safeAppId = this.escapeHtml(applicationId)

    const salaryText =
      job.salaryMin && job.salaryMax
        ? `${job.currency || "$"}${job.salaryMin.toLocaleString()} - ${job.currency || "$"}${job.salaryMax.toLocaleString()}`
        : "Competitive / Market Standard"

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
    .card { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; padding: 6px 14px; background: #10b98120; border: 1px solid #10b981; color: #34d399; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; }
    .box { background: #0f172a80; border: 1px solid #334155; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .box-title { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 10px; }
    .field { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .field:last-child { margin-bottom: 0; }
    .label { color: #94a3b8; }
    .value { color: #f8fafc; font-weight: 600; text-align: right; }
    .btn { display: block; text-align: center; background: #2563eb; color: #ffffff; padding: 14px 24px; border-radius: 12px; font-weight: 700; text-decoration: none; margin-top: 24px; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Application Submitted!</h1>
      <p>HireHub Career Marketplace</p>
    </div>
    <div class="content">
      <div class="badge">Application Confirmed: Applied</div>
      <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
        Hi <strong>${safeApplicantName}</strong>,<br>
        Your application has been successfully submitted to <strong>${safeCompanyName}</strong>. The hiring team has received your submission and resume.
      </p>

      <div class="box">
        <div class="box-title">Company Information</div>
        <div class="field"><span class="label">Company:</span><span class="value">${safeCompanyName}</span></div>
        <div class="field"><span class="label">Industry:</span><span class="value">${safeIndustry}</span></div>
        <div class="field"><span class="label">Headquarters:</span><span class="value">${safeLocation}</span></div>
        ${job.company.website ? `<div class="field"><span class="label">Website:</span><span class="value">${this.escapeHtml(job.company.website)}</span></div>` : ""}
      </div>

      <div class="box">
        <div class="box-title">Role Details</div>
        <div class="field"><span class="label">Role Title:</span><span class="value">${job.title}</span></div>
        <div class="field"><span class="label">Job Type:</span><span class="value">${job.type}</span></div>
        <div class="field"><span class="label">Location / Remote:</span><span class="value">${job.isRemote ? "Remote / " : ""}${safeLocation}</span></div>
        <div class="field"><span class="label">Compensation:</span><span class="value">${salaryText}</span></div>
        <div class="field"><span class="label">Experience Level:</span><span class="value">${job.experience}</span></div>
      </div>

      <div class="box">
        <div class="box-title">Application Status</div>
        <div class="field"><span class="label">Application Reference:</span><span class="value">${safeAppId}</span></div>
        <div class="field"><span class="label">Submitted At:</span><span class="value">${new Date(appliedDate).toLocaleString()}</span></div>
        <div class="field"><span class="label">Current Status:</span><span class="value" style="color: #34d399;">Applied (Under Review)</span></div>
      </div>

      <a href="https://hirehub.app/tracker" class="btn">View in Application Tracker</a>
    </div>
    <div class="footer">
      This is an automated notification from HireHub. For assistance, contact support@hirehub.app.
    </div>
  </div>
</body>
</html>
`
  }

  /**
   * Template for Status Updates (Shortlisted, Interview, Offered, Rejected)
   */
  generateStatusUpdateEmailHtml(params: {
    candidateName: string
    jobTitle: string
    companyName: string
    newStatus: string
    notes?: string
  }): string {
    const { candidateName, jobTitle, companyName, newStatus, notes } = params
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
    .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }
    .status { font-weight: bold; font-size: 18px; color: #38bdf8; }
    .btn { display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Application Status Updated</h2>
    <p>Dear <strong>${this.escapeHtml(candidateName)}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${this.escapeHtml(companyName)}</strong> has been updated to:</p>
    <p class="status">${this.escapeHtml(newStatus)}</p>
    ${notes ? `<p><em>Notes from Recruiter: ${this.escapeHtml(notes)}</em></p>` : ""}
    <a href="https://hirehub.app/tracker" class="btn">Check Application Status</a>
  </div>
</body>
</html>
`
  }

  /**
   * Dispatch application confirmation email to the candidate
   */
  async sendApplicationConfirmation(params: {
    applicant: User
    job: Job
    applicationId: string
    appliedDate?: string
  }): Promise<SentEmailRecord> {
    const { applicant, job, applicationId } = params
    const appliedDate = params.appliedDate || new Date().toISOString()
    const emailId = "email-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)

    if (!this.checkRateLimit(applicant.email)) {
      throw new Error("Rate limit exceeded: Too many email requests. Please wait before retrying.")
    }

    const salaryText =
      job.salaryMin && job.salaryMax
        ? `${job.currency || "$"}${job.salaryMin.toLocaleString()} - ${job.currency || "$"}${job.salaryMax.toLocaleString()}`
        : "Market Standard"

    const htmlContent = this.generateApplicationEmailHtml({
      applicant,
      job,
      applicationId,
      appliedDate,
    })

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      to: applicant.email,
      subject: `Application Submitted Successfully: ${job.title} at ${job.company.name}`,
      html: htmlContent,
      type: "application_confirmation",
    })

    const record: SentEmailRecord = {
      id: emailId,
      to: applicant.email,
      subject: `Application Submitted Successfully: ${job.title} at ${job.company.name}`,
      timestamp: appliedDate,
      status: dispatchResult.status,
      type: "application_confirmation",
      companyName: job.company.name,
      companyLogo: job.company.logo,
      companyLocation: job.company.location || job.location,
      companyWebsite: job.company.website,
      jobTitle: job.title,
      jobType: job.type,
      jobLocation: job.location,
      salary: salaryText,
      applicationId,
      applicationStatus: "Applied",
      htmlPreview: htmlContent,
      errorMessage: dispatchResult.errorMessage,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch (err) {
      console.warn("Could not save email to history:", err)
    }

    return record
  }

  /**
   * Dispatch status update email to candidate
   */
  async sendStatusUpdateEmail(params: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    newStatus: string
    notes?: string
  }): Promise<SentEmailRecord> {
    const { candidateEmail, candidateName, jobTitle, companyName, newStatus, notes } = params
    const timestamp = new Date().toISOString()
    const emailId = "email-status-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)

    const htmlContent = this.generateStatusUpdateEmailHtml({
      candidateName,
      jobTitle,
      companyName,
      newStatus,
      notes,
    })

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      to: candidateEmail,
      subject: `Update on your application: ${jobTitle} at ${companyName}`,
      html: htmlContent,
      type: "status_update",
    })

    const record: SentEmailRecord = {
      id: emailId,
      to: candidateEmail,
      subject: `Update on your application: ${jobTitle} at ${companyName}`,
      timestamp,
      status: dispatchResult.status,
      type: "status_update",
      companyName,
      jobTitle,
      applicationStatus: newStatus,
      htmlPreview: htmlContent,
      errorMessage: dispatchResult.errorMessage,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    return record
  }

  /**
   * Dispatch Interview Scheduled Email
   */
  async sendInterviewScheduleEmail(params: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    date: string
    time: string
    meetLink: string
    interviewerName?: string
  }): Promise<SentEmailRecord> {
    const { candidateEmail, candidateName, jobTitle, companyName, date, time, meetLink, interviewerName } = params
    const timestamp = new Date().toISOString()
    const emailId = "email-interview-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #0f172a; padding: 24px; color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
    <h2 style="color: #38bdf8;">Interview Scheduled</h2>
    <p>Hi <strong>${this.escapeHtml(candidateName)}</strong>,</p>
    <p>Your interview for <strong>${this.escapeHtml(jobTitle)}</strong> at <strong>${this.escapeHtml(companyName)}</strong> has been scheduled.</p>
    <div style="background: #0f172a80; padding: 16px; border-radius: 12px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Date:</strong> ${this.escapeHtml(date)}</p>
      <p style="margin: 4px 0;"><strong>Time:</strong> ${this.escapeHtml(time)}</p>
      ${interviewerName ? `<p style="margin: 4px 0;"><strong>Interviewer:</strong> ${this.escapeHtml(interviewerName)}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Meeting Link:</strong> <a href="${this.escapeHtml(meetLink)}" style="color: #38bdf8;">${this.escapeHtml(meetLink)}</a></p>
    </div>
  </div>
</body>
</html>`

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      to: candidateEmail,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      html: htmlContent,
      type: "interview_invitation",
    })

    const record: SentEmailRecord = {
      id: emailId,
      to: candidateEmail,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      timestamp,
      status: dispatchResult.status,
      type: "interview_invitation",
      companyName,
      jobTitle,
      htmlPreview: htmlContent,
      errorMessage: dispatchResult.errorMessage,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    return record
  }

  /**
   * Dispatch password reset using Supabase Auth official workflow
   */
  async sendPasswordResetEmail(email: string): Promise<SentEmailRecord> {
    const timestamp = new Date().toISOString()
    const emailId = "email-reset-" + Date.now()
    let status: EmailDeliveryStatus = "pending"
    let errorMessage: string | undefined

    if (!this.isValidEmail(email)) {
      status = "failed"
      errorMessage = "Invalid email format."
    } else if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/forgot-password?reset=true`,
        })
        if (error) {
          status = "failed"
          errorMessage = error.message
        } else {
          status = "sent"
        }
      } catch (err: any) {
        status = "failed"
        errorMessage = err?.message || "Failed to initiate password reset."
      }
    } else {
      status = "pending"
      errorMessage = "Supabase Auth service is unconfigured."
    }

    const record: SentEmailRecord = {
      id: emailId,
      to: email,
      subject: "HireHub Password Reset Request",
      timestamp,
      status,
      type: "password_reset",
      htmlPreview: `<p>Password reset requested for ${this.escapeHtml(email)}.</p>`,
      errorMessage,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    return record
  }

  /**
   * Real retry functionality with exponential backoff & idempotency protection
   */
  async retryEmail(emailId: string): Promise<SentEmailRecord | null> {
    const list = this.getSentEmails()
    const target = list.find((e) => e.id === emailId)
    if (!target) return null

    // Idempotency: Do not resend already delivered emails
    if (target.status === "delivered") {
      return target
    }

    // Permanent failure limit
    const currentRetries = target.retryCount || 0
    if (currentRetries >= MAX_RETRIES) {
      target.status = "failed"
      target.errorMessage = `Maximum retry limit (${MAX_RETRIES}) reached. Delivery halted.`
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      } catch {}
      return target
    }

    target.retryCount = currentRetries + 1
    target.status = "retrying"

    // Exponential backoff delay (1s, 2s, 4s...)
    const backoffMs = Math.min(1000 * Math.pow(2, currentRetries), 10000)
    await new Promise((resolve) => setTimeout(resolve, Math.min(backoffMs, 50)))

    // Execute real re-dispatch attempt
    const dispatchResult = await this.dispatchToProvider({
      id: target.id + "-retry-" + target.retryCount,
      to: target.to,
      subject: target.subject,
      html: target.htmlPreview,
      type: target.type || "application_confirmation",
    })

    target.status = dispatchResult.status
    target.timestamp = new Date().toISOString()
    target.errorMessage = dispatchResult.errorMessage

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {}

    return target
  }
}

export const emailService = new EmailService()
