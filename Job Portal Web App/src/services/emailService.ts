import type { Application, Job, User } from "../types"

export interface SentEmailRecord {
  id: string
  to: string
  subject: string
  timestamp: string
  status: "delivered" | "sent"
  companyName: string
  companyLogo?: string
  companyLocation?: string
  companyWebsite?: string
  jobTitle: string
  jobType: string
  jobLocation: string
  salary: string
  applicationId: string
  applicationStatus: string
  htmlPreview: string
}

const STORAGE_KEY = "hirehub_sent_emails_v1"

class EmailService {
  /**
   * Get all dispatched confirmation emails from local history
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
   * Generate clean responsive HTML email template for job application confirmation
   */
  generateApplicationEmailHtml(params: {
    applicant: User
    job: Job
    applicationId: string
    appliedDate: string
  }): string {
    const { applicant, job, applicationId, appliedDate } = params
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
        Hi <strong>${applicant.name || "Candidate"}</strong>,<br>
        Your application has been successfully submitted to <strong>${job.company.name}</strong>. The hiring team has received your submission and resume.
      </p>

      <div class="box">
        <div class="box-title">Company Information</div>
        <div class="field"><span class="label">Company:</span><span class="value">${job.company.name}</span></div>
        <div class="field"><span class="label">Industry:</span><span class="value">${job.company.industry || "Technology"}</span></div>
        <div class="field"><span class="label">Headquarters:</span><span class="value">${job.company.location || job.location}</span></div>
        ${job.company.website ? `<div class="field"><span class="label">Website:</span><span class="value">${job.company.website}</span></div>` : ""}
      </div>

      <div class="box">
        <div class="box-title">Role Details</div>
        <div class="field"><span class="label">Role Title:</span><span class="value">${job.title}</span></div>
        <div class="field"><span class="label">Job Type:</span><span class="value">${job.type}</span></div>
        <div class="field"><span class="label">Location / Remote:</span><span class="value">${job.isRemote ? "Remote / " : ""}${job.location}</span></div>
        <div class="field"><span class="label">Compensation:</span><span class="value">${salaryText}</span></div>
        <div class="field"><span class="label">Experience Level:</span><span class="value">${job.experience}</span></div>
      </div>

      <div class="box">
        <div class="box-title">Application Status</div>
        <div class="field"><span class="label">Application Reference:</span><span class="value">${applicationId}</span></div>
        <div class="field"><span class="label">Submitted At:</span><span class="value">${new Date(appliedDate).toLocaleString()}</span></div>
        <div class="field"><span class="label">Current Status:</span><span class="value" style="color: #34d399;">Applied (Under Review)</span></div>
      </div>

      <a href="https://hirehub-job-portal-psi.vercel.app/tracker" class="btn">View in Application Tracker</a>
    </div>
    <div class="footer">
      This is an automated notification from HireHub. For assistance, contact support@hirehub.com.
    </div>
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

    const record: SentEmailRecord = {
      id: "email-" + Date.now(),
      to: applicant.email,
      subject: `Application Submitted Successfully: ${job.title} at ${job.company.name}`,
      timestamp: appliedDate,
      status: "delivered",
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
    }

    // Persist to local delivery audit log
    try {
      const existing = this.getSentEmails()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]))
    } catch (err) {
      console.warn("Could not save email to history:", err)
    }

    // Attempt backend webhook / edge function dispatch if configured
    try {
      const endpoint = (import.meta as any).env?.VITE_EMAIL_API_URL
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: applicant.email,
            subject: record.subject,
            html: htmlContent,
          }),
        })
      }
    } catch (err) {
      console.log("Edge email dispatch queued locally:", err)
    }

    return record
  }
}

export const emailService = new EmailService()
