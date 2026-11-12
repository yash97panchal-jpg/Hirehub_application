import { describe, it, expect, beforeEach, vi } from "vitest"
import { emailService } from "../src/services/emailService"
import { mockJobs } from "../src/data/mockData"
import type { User } from "../src/types"

const mockStorage: Record<string, string> = {}
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val },
  removeItem: (key: string) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
  length: 0,
  key: () => null,
} as any

describe("Email Service & Application Confirmation (BUG-004)", () => {
  beforeEach(() => {
    localStorage.clear()
    emailService.setProviderEndpoint(null)
    vi.restoreAllMocks()
  })

  const dummyApplicant: User = {
    id: "seeker-test-1",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "job_seeker",
    skills: ["React", "TypeScript"],
    profileCompletion: 100,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  it("generates HTML with company details, role details, and status", () => {
    const job = mockJobs[0]
    const html = emailService.generateApplicationEmailHtml({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-999",
      appliedDate: "2026-11-04T10:00:00Z",
    })

    expect(html).toContain("Application Submitted!")
    expect(html).toContain("Alex Morgan")
    expect(html).toContain(job.company.name)
    expect(html).toContain(job.title)
    expect(html).toContain("app-test-999")
    expect(html).toContain("Applied (Under Review)")
  })

  it("accurately reports pending status when no email provider is configured (no false delivered status)", async () => {
    const job = mockJobs[0]
    const record = await emailService.sendApplicationConfirmation({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-888",
    })

    // Must NOT report 'delivered' without a configured provider
    expect(record.status).toBe("pending")
    expect(record.errorMessage).toContain("Email provider not configured")
    expect(record.to).toBe("alex.morgan@example.com")
    expect(record.companyName).toBe(job.company.name)
    expect(record.jobTitle).toBe(job.title)
    expect(record.applicationId).toBe("app-test-888")

    const sentHistory = emailService.getSentEmails()
    expect(sentHistory.length).toBeGreaterThan(0)
    expect(sentHistory[0].applicationId).toBe("app-test-888")
  })

  it("reports 'sent' when provider accepts dispatch and 'delivered' when confirmed", async () => {
    const job = mockJobs[0]
    emailService.setProviderEndpoint("https://api.hirehub.app/send-email")

    // Mock fetch for provider acceptance
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ sent: true, delivered: false }),
    } as any)

    const recordSent = await emailService.sendApplicationConfirmation({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-sent-1",
    })
    expect(recordSent.status).toBe("sent")

    // Mock fetch for confirmed delivery
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ sent: true, delivered: true }),
    } as any)

    const recordDelivered = await emailService.sendApplicationConfirmation({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-deliv-1",
    })
    expect(recordDelivered.status).toBe("delivered")
  })

  it("handles provider failure and marks status as failed with error details", async () => {
    const job = mockJobs[0]
    emailService.setProviderEndpoint("https://api.hirehub.app/send-email")

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "Service Unavailable",
    } as any)

    const record = await emailService.sendApplicationConfirmation({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-fail-1",
    })

    expect(record.status).toBe("failed")
    expect(record.errorMessage).toContain("503")
  })

  it("prevents duplicate delivery on retry if email is already marked delivered", async () => {
    const job = mockJobs[0]
    const record = await emailService.sendApplicationConfirmation({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-dup-1",
    })

    // Simulate record marked delivered
    const list = emailService.getSentEmails()
    list[0].status = "delivered"
    localStorage.setItem("hirehub_sent_emails_v1", JSON.stringify(list))

    const retried = await emailService.retryEmail(record.id)
    expect(retried?.status).toBe("delivered")
    expect(retried?.retryCount || 0).toBe(0) // No resend dispatched
  })

  it("enforces max retry limit (3 retries) and records permanent failure", async () => {
    const job = mockJobs[0]
    const record = await emailService.sendApplicationConfirmation({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-retry-max",
    })

    // Simulate 3 prior retries
    const list = emailService.getSentEmails()
    list[0].retryCount = 3
    list[0].status = "failed"
    localStorage.setItem("hirehub_sent_emails_v1", JSON.stringify(list))

    const result = await emailService.retryEmail(record.id)
    expect(result?.status).toBe("failed")
    expect(result?.errorMessage).toContain("Maximum retry limit (3) reached")
  })
})
