import { describe, it, expect, beforeEach } from "vitest"
import { emailService } from "../src/services/emailService"
import { mockJobs, mockCompanies } from "../src/data/mockData"
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

describe("Email Service & Application Confirmation", () => {
  beforeEach(() => {
    localStorage.clear()
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

  it("dispatches confirmation email and persists sent record", async () => {
    const job = mockJobs[0]
    const record = await emailService.sendApplicationConfirmation({
      applicant: dummyApplicant,
      job,
      applicationId: "app-test-888",
    })

    expect(record.status).toBe("delivered")
    expect(record.to).toBe("alex.morgan@example.com")
    expect(record.companyName).toBe(job.company.name)
    expect(record.jobTitle).toBe(job.title)
    expect(record.applicationId).toBe("app-test-888")

    const sentHistory = emailService.getSentEmails()
    expect(sentHistory.length).toBeGreaterThan(0)
    expect(sentHistory[0].applicationId).toBe("app-test-888")
  })
})
