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
  idempotencyKey?: string
  providerMessageId?: string
}

const STORAGE_KEY = "hirehub_sent_emails_v1"
const RATE_LIMIT_KEY = "hirehub_email_rate_log_v1"
const MAX_EMAILS_PER_WINDOW = 5
const RATE_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_RETRIES = 3

class EmailService {
  private providerEndpoint: string | null = null
  private baseRetryDelayMs: number = 1000
  private skipDelayForTesting: boolean = false
  private processedWebhookEvents = new Set<string>()

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
   * Configure retry delay configuration for testing
   */
  public setRetryConfig(config: { baseDelayMs?: number; skipDelayForTesting?: boolean }) {
    if (config.baseDelayMs !== undefined) this.baseRetryDelayMs = config.baseDelayMs
    if (config.skipDelayForTesting !== undefined) this.skipDelayForTesting = config.skipDelayForTesting
  }

  /**
   * Escape HTML entities to prevent content injection inside email templates
   */
  private escapeHtml(str?: any): string {
    if (str === null || str === undefined) return ""
    return String(str)
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
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
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
   * Persist email record to server-side durable outbound_emails table if Supabase is available
   */
  private async persistToDatabaseQueue(record: SentEmailRecord): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("outbound_emails").upsert({
          id: record.id,
          recipient: record.to,
          template: record.type || "generic",
          subject: record.subject,
          status: record.status,
          retry_count: record.retryCount || 0,
          idempotency_key: record.idempotencyKey || record.id,
          provider_message_id: record.providerMessageId || null,
          last_error: record.errorMessage || null,
          metadata: {
            applicationId: record.applicationId,
            jobTitle: record.jobTitle,
            companyName: record.companyName,
          },
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        console.warn("Could not sync to durable outbound_emails table:", err)
      }
    }
  }

  /**
   * Internal dispatcher that invokes the configured provider endpoint
   * or records a pending/failed state without false success.
   */
  private async dispatchToProvider(params: {
    id: string
    idempotencyKey: string
    to: string
    subject: string
    html: string
    type: EmailType
  }): Promise<{ status: EmailDeliveryStatus; providerMessageId?: string; errorMessage?: string }> {
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
        errorMessage:
          "Email provider not configured (VITE_EMAIL_API_URL is unset). Message stored in outbound queue.",
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": params.idempotencyKey,
        },
        body: JSON.stringify({
          id: params.id,
          idempotencyKey: params.idempotencyKey,
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
      return { status, providerMessageId: body.messageId || body.id }
    } catch (err: any) {
      return {
        status: "failed",
        errorMessage: `Network error reaching email dispatch provider: ${err?.message || "Connection refused"}`,
      }
    }
  }

  /**
   * Generate clean HTML email template for status updates
   */
  generateStatusUpdateEmailHtml(params: {
    candidateName: string
    jobTitle: string
    companyName: string
    newStatus: string
    notes?: string
  }): string {
    const { candidateName, jobTitle, companyName, newStatus, notes } = params
    return `<!DOCTYPE html>
<html>
<body>
  <h2>Application Status Update</h2>
  <p>Hello <strong>${this.escapeHtml(candidateName)}</strong>,</p>
  <p>Your application for <strong>${this.escapeHtml(jobTitle)}</strong> at <strong>${this.escapeHtml(companyName)}</strong> has been updated to: <strong>${this.escapeHtml(newStatus)}</strong>.</p>
  ${notes ? `<p>${this.escapeHtml(notes)}</p>` : ""}
</body>
</html>`
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
    const safeName = this.escapeHtml(applicant.name)
    const safeTitle = job.title || "Position"
    const rawCompany = typeof job.company === "object" && job.company !== null ? (job.company as any).name || (job.company as any).title || "Company" : String(job.company || "Company")
    const safeCompany = this.escapeHtml(rawCompany)
    const safeLocation = this.escapeHtml(job.location)
    const safeType = this.escapeHtml(job.type)
    const salaryStr =
      (job as any).salary ||
      (job.salaryMin && job.salaryMax
        ? `${job.currency || "$"}${job.salaryMin.toLocaleString()} - ${job.currency || "$"}${job.salaryMax.toLocaleString()}`
        : "")
    const safeSalary = this.escapeHtml(salaryStr)
    const safeAppId = this.escapeHtml(applicationId)

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Confirmation - ${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #2563eb; padding: 28px 36px; text-align: left;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">HireHub</h1>
              <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 14px;">Application Submitted! Confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0;">Hello <strong>${safeName}</strong>,</p>
              <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                Your application for <strong>${safeTitle}</strong> at <strong>${safeCompany}</strong> has been successfully submitted!
              </p>
              <table role="presentation" width="100%" style="background-color: #f1f5f9; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Reference ID:</td>
                  <td align="right" style="font-size: 14px; font-family: monospace; font-weight: 600; color: #0f172a;">${safeAppId}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Location:</td>
                  <td align="right" style="font-size: 14px; font-weight: 500; color: #0f172a;">${safeLocation}</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Job Type:</td>
                  <td align="right" style="font-size: 14px; font-weight: 500; color: #0f172a;">${safeType}</td>
                </tr>
                ${
                  safeSalary
                    ? `<tr>
                  <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Compensation:</td>
                  <td align="right" style="font-size: 14px; font-weight: 500; color: #0f172a;">${safeSalary}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Status:</td>
                  <td align="right" style="font-size: 14px; font-weight: 500; color: #0f172a;">Applied (Under Review)</td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Submitted:</td>
                  <td align="right" style="font-size: 14px; font-weight: 500; color: #0f172a;">${appliedDate}</td>
                </tr>
              </table>
              <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">
                You can track this application in your HireHub Candidate Dashboard.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} HireHub Inc. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

  /**
   * Dispatch application submission confirmation email
   */
  async sendApplicationConfirmation(params: {
    applicant: User
    job: Job
    applicationId: string
  }): Promise<SentEmailRecord> {
    const { applicant, job, applicationId } = params
    const timestamp = new Date().toISOString()
    const emailId = "email-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)
    const idempotencyKey = `idemp_app_${applicationId}`

    const rawCompany =
      typeof job.company === "object" && job.company !== null
        ? (job.company as any).name || (job.company as any).title || "Company"
        : String(job.company || "Company")

    if (!this.checkRateLimit(applicant.email)) {
      throw new Error("Rate limit exceeded: maximum 5 emails per minute.")
    }

    const html = this.generateApplicationEmailHtml({
      applicant,
      job,
      applicationId,
      appliedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      idempotencyKey,
      to: applicant.email,
      subject: `Application Confirmation: ${job.title} at ${rawCompany}`,
      html,
      type: "application_confirmation",
    })

    const record: SentEmailRecord = {
      id: emailId,
      idempotencyKey,
      to: applicant.email,
      subject: `Application Confirmation: ${job.title} at ${rawCompany}`,
      timestamp,
      status: dispatchResult.status,
      type: "application_confirmation",
      companyName: rawCompany,
      companyLocation: job.location,
      jobTitle: job.title,
      jobType: job.type,
      jobLocation: job.location,
      salary:
        (job as any).salary ||
        (job.salaryMin && job.salaryMax
          ? `${job.currency || "$"}${job.salaryMin.toLocaleString()} - ${job.currency || "$"}${job.salaryMax.toLocaleString()}`
          : undefined),
      applicationId,
      applicationStatus: "Applied",
      htmlPreview: html,
      errorMessage: dispatchResult.errorMessage,
      providerMessageId: dispatchResult.providerMessageId,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    await this.persistToDatabaseQueue(record)
    return record
  }

  /**
   * Dispatch status change notification email
   */
  async sendStatusUpdateEmail(params: {
    applicantEmail?: string
    candidateEmail?: string
    applicantName?: string
    candidateName?: string
    jobTitle: string
    companyName: string
    applicationId?: string
    newStatus: string
    notes?: string
  }): Promise<SentEmailRecord> {
    const toEmail = params.applicantEmail || params.candidateEmail || ""
    const toName = params.applicantName || params.candidateName || "Candidate"
    const { jobTitle, companyName, newStatus, notes } = params
    const applicationId = params.applicationId || "app-" + Date.now()
    const timestamp = new Date().toISOString()
    const emailId = "email-status-" + Date.now()
    const idempotencyKey = `idemp_status_${applicationId}_${newStatus}`

    const html = `<p>Hi ${this.escapeHtml(toName)}, your application for <strong>${this.escapeHtml(
      jobTitle
    )}</strong> at <strong>${this.escapeHtml(companyName)}</strong> has been updated to: <strong>${this.escapeHtml(
      newStatus
    )}</strong>.</p>${notes ? `<p>Notes: ${this.escapeHtml(notes)}</p>` : ""}`

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      idempotencyKey,
      to: toEmail,
      subject: `Update on your application: ${jobTitle} (${newStatus})`,
      html,
      type: "status_update",
    })

    const record: SentEmailRecord = {
      id: emailId,
      idempotencyKey,
      to: toEmail,
      subject: `Update on your application: ${jobTitle} (${newStatus})`,
      timestamp,
      status: dispatchResult.status,
      type: "status_update",
      companyName,
      jobTitle,
      applicationId,
      applicationStatus: newStatus,
      htmlPreview: html,
      errorMessage: dispatchResult.errorMessage,
      providerMessageId: dispatchResult.providerMessageId,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    await this.persistToDatabaseQueue(record)
    return record
  }

  /**
   * Dispatch interview invitation notification email
   */
  async sendInterviewInvitation(params: {
    applicantEmail: string
    applicantName: string
    jobTitle: string
    companyName: string
    date: string
    time: string
    meetLink: string
  }): Promise<SentEmailRecord> {
    const { applicantEmail, applicantName, jobTitle, companyName, date, time, meetLink } = params
    const timestamp = new Date().toISOString()
    const emailId = "email-interview-" + Date.now()
    const idempotencyKey = `idemp_inv_${emailId}`

    const html = `<p>Hi ${this.escapeHtml(applicantName)}, you have been invited to interview for <strong>${this.escapeHtml(
      jobTitle
    )}</strong> at ${this.escapeHtml(companyName)} on ${this.escapeHtml(date)} at ${this.escapeHtml(time)}.</p><p><a href="${meetLink}">Join Meeting</a></p>`

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      idempotencyKey,
      to: applicantEmail,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      html,
      type: "interview_invitation",
    })

    const record: SentEmailRecord = {
      id: emailId,
      idempotencyKey,
      to: applicantEmail,
      subject: `Interview Scheduled: ${jobTitle} at ${companyName}`,
      timestamp,
      status: dispatchResult.status,
      type: "interview_invitation",
      companyName,
      jobTitle,
      htmlPreview: html,
      errorMessage: dispatchResult.errorMessage,
      providerMessageId: dispatchResult.providerMessageId,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    await this.persistToDatabaseQueue(record)
    return record
  }

  /**
   * Dispatch interview cancellation email
   */
  async sendInterviewCancellation(params: {
    applicantEmail: string
    applicantName: string
    jobTitle: string
    companyName: string
  }): Promise<SentEmailRecord> {
    const { applicantEmail, applicantName, jobTitle, companyName } = params
    const timestamp = new Date().toISOString()
    const emailId = "email-cancel-" + Date.now()
    const idempotencyKey = `idemp_cancel_${emailId}`

    const html = `<p>Hi ${this.escapeHtml(applicantName)}, your interview for <strong>${this.escapeHtml(
      jobTitle
    )}</strong> at ${this.escapeHtml(companyName)} has been cancelled.</p>`

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      idempotencyKey,
      to: applicantEmail,
      subject: `Interview Cancelled: ${jobTitle} at ${companyName}`,
      html,
      type: "interview_cancellation",
    })

    const record: SentEmailRecord = {
      id: emailId,
      idempotencyKey,
      to: applicantEmail,
      subject: `Interview Cancelled: ${jobTitle} at ${companyName}`,
      timestamp,
      status: dispatchResult.status,
      type: "interview_cancellation",
      companyName,
      jobTitle,
      htmlPreview: html,
      errorMessage: dispatchResult.errorMessage,
      providerMessageId: dispatchResult.providerMessageId,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    await this.persistToDatabaseQueue(record)
    return record
  }

  /**
   * Dispatch recruiter notification email
   */
  async sendRecruiterNotification(params: {
    recruiterEmail: string
    candidateName: string
    jobTitle: string
    applicationId: string
  }): Promise<SentEmailRecord> {
    const { recruiterEmail, candidateName, jobTitle, applicationId } = params
    const timestamp = new Date().toISOString()
    const emailId = "email-recruiter-" + Date.now()
    const idempotencyKey = `idemp_rec_${applicationId}`

    const html = `<p>New application received from <strong>${this.escapeHtml(
      candidateName
    )}</strong> for <strong>${this.escapeHtml(jobTitle)}</strong> (App ID: ${this.escapeHtml(applicationId)}).</p>`

    const dispatchResult = await this.dispatchToProvider({
      id: emailId,
      idempotencyKey,
      to: recruiterEmail,
      subject: `New Application Received: ${candidateName} for ${jobTitle}`,
      html,
      type: "recruiter_notification",
    })

    const record: SentEmailRecord = {
      id: emailId,
      idempotencyKey,
      to: recruiterEmail,
      subject: `New Application Received: ${candidateName} for ${jobTitle}`,
      timestamp,
      status: dispatchResult.status,
      type: "recruiter_notification",
      jobTitle,
      applicationId,
      htmlPreview: html,
      errorMessage: dispatchResult.errorMessage,
      providerMessageId: dispatchResult.providerMessageId,
      retryCount: 0,
    }

    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch {}

    await this.persistToDatabaseQueue(record)
    return record
  }

  /**
   * Dispatch password reset using Supabase Auth official workflow
   */
  async sendPasswordResetEmail(email: string): Promise<SentEmailRecord> {
    const timestamp = new Date().toISOString()
    const emailId = "email-reset-" + Date.now()
    const idempotencyKey = `idemp_pwd_${Date.now()}`
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
      idempotencyKey,
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

    await this.persistToDatabaseQueue(record)
    return record
  }

  /**
   * Real retry functionality with exponential backoff & stable idempotency protection
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
      await this.persistToDatabaseQueue(target)
      return target
    }

    target.retryCount = currentRetries + 1
    target.status = "retrying"

    // Real exponential backoff delay (e.g. 1s, 2s, 4s...)
    const backoffMs = Math.min(this.baseRetryDelayMs * Math.pow(2, currentRetries), 10000)
    if (!this.skipDelayForTesting && backoffMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }

    // Re-dispatch using the STABLE idempotency key (preventing duplicate sends on retry)
    const stableIdempotencyKey = target.idempotencyKey || `idemp_${target.id}`
    const dispatchResult = await this.dispatchToProvider({
      id: target.id,
      idempotencyKey: stableIdempotencyKey,
      to: target.to,
      subject: target.subject,
      html: target.htmlPreview,
      type: target.type || "application_confirmation",
    })

    target.status = dispatchResult.status
    target.timestamp = new Date().toISOString()
    target.errorMessage = dispatchResult.errorMessage
    if (dispatchResult.providerMessageId) {
      target.providerMessageId = dispatchResult.providerMessageId
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {}

    await this.persistToDatabaseQueue(target)
    return target
  }

  /**
   * Verify cryptographic webhook signature (HMAC-SHA256)
   */
  public async verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    if (!payload || !signature || !secret) return false
    try {
      const enc = new TextEncoder()
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      )
      const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload))
      const computedHex = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

      return computedHex.toLowerCase() === signature.trim().toLowerCase()
    } catch (err) {
      console.warn("Webhook signature calculation error:", err)
      return false
    }
  }

  /**
   * Process authenticated webhook delivery notification
   */
  public async processWebhookDelivery(
    payload: {
      eventId: string
      emailId?: string
      idempotencyKey?: string
      providerMessageId?: string
      event: "delivered" | "bounced" | "failed"
      deliveredAt?: string
      error?: string
    },
    signature?: string,
    secret?: string
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Signature verification if secret configured
    if (secret) {
      if (!signature) {
        return { success: false, error: "Missing webhook signature." }
      }
      const rawPayload = JSON.stringify(payload)
      const isValid = await this.verifyWebhookSignature(rawPayload, signature, secret)
      if (!isValid) {
        return { success: false, error: "Invalid webhook signature." }
      }
    }

    // 2. Duplicate webhook event protection
    if (this.processedWebhookEvents.has(payload.eventId)) {
      return { success: true } // Idempotent success
    }
    this.processedWebhookEvents.add(payload.eventId)

    // 3. Update in-memory / local storage records
    const list = this.getSentEmails()
    const target = list.find(
      (e) =>
        (payload.emailId && e.id === payload.emailId) ||
        (payload.idempotencyKey && e.idempotencyKey === payload.idempotencyKey) ||
        (payload.providerMessageId && e.providerMessageId === payload.providerMessageId)
    )

    if (target) {
      target.status = payload.event === "delivered" ? "delivered" : "failed"
      if (payload.error) target.errorMessage = payload.error
      if (payload.deliveredAt) target.timestamp = payload.deliveredAt
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      } catch {}
      await this.persistToDatabaseQueue(target)
    }

    // 4. Update Supabase outbound queue
    if (isSupabaseConfigured && supabase) {
      try {
        const updateData: any = {
          status: payload.event === "delivered" ? "delivered" : "failed",
          updated_at: new Date().toISOString(),
        }
        if (payload.error) updateData.last_error = payload.error

        if (payload.emailId) {
          await supabase.from("outbound_emails").update(updateData).eq("id", payload.emailId)
        } else if (payload.idempotencyKey) {
          await supabase.from("outbound_emails").update(updateData).eq("idempotency_key", payload.idempotencyKey)
        }
      } catch {}
    }

    return { success: true }
  }
}

export const emailService = new EmailService()
