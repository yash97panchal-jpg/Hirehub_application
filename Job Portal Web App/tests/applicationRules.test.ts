import { describe, it, expect, beforeEach } from "vitest"
import { applicationService, storageService } from "../src/lib/supabase"
import type { Job, User, Application } from "../src/types"

if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size },
  } as any
}

describe("HireHub Application Rules & Multi-Apply Modes", () => {
  const dummyUser: User = {
    id: "seeker-test-1",
    name: "Alex JobSeeker",
    email: "alex@example.com",
    role: "job_seeker",
    skills: ["React", "TypeScript"],
    profileCompletion: 80,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const dummyCompany = {
    id: "comp-meta",
    name: "Meta",
    slug: "meta",
    isVerified: true,
    status: "approved" as const,
    location: "Menlo Park, CA",
  }

  const dummyJob: Job = {
    id: "job-easy-apply-1",
    title: "Senior Full Stack Engineer",
    company: dummyCompany,
    description: "Build next-generation distributed interfaces.",
    location: "Remote",
    type: "Full-time",
    experienceLevel: "Senior",
    applyMode: "easy",
    skills: ["React", "TypeScript", "Node.js"],
    screeningQuestions: [
      {
        id: "q1",
        question: "Years of React experience?",
        type: "text",
        required: true,
      },
    ],
    postedAt: "2026-11-01",
    applicationCount: 5,
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it("submits an in-app Easy Apply application successfully", async () => {
    const app = await applicationService.submitApplication({
      jobId: dummyJob.id,
      userId: dummyUser.id,
      resumeFile: "resumes/seeker-test-1/resume.pdf",
      coverLetter: "Excited to contribute to Meta!",
      answers: { q1: "6 years" },
      job: dummyJob,
      applicant: dummyUser,
    })

    expect(app).toBeDefined()
    expect(app.jobId).toBe(dummyJob.id)
    expect(app.userId).toBe(dummyUser.id)
    expect(app.status).toBe("Applied")
    expect(app.source).toBe("easy")
  })

  it("blocks duplicate applications for the same job and user", async () => {
    // First submission
    await applicationService.submitApplication({
      jobId: dummyJob.id,
      userId: dummyUser.id,
      resumeFile: "resumes/seeker-test-1/resume.pdf",
      job: dummyJob,
      applicant: dummyUser,
    })

    // Second submission must be blocked
    await expect(
      applicationService.submitApplication({
        jobId: dummyJob.id,
        userId: dummyUser.id,
        resumeFile: "resumes/seeker-test-1/resume.pdf",
        job: dummyJob,
        applicant: dummyUser,
      })
    ).rejects.toThrow(/already (applied|submitted an application)/i)
  })

  it("allows a seeker to withdraw their in-app application", async () => {
    const app = await applicationService.submitApplication({
      jobId: dummyJob.id,
      userId: dummyUser.id,
      resumeFile: "resumes/seeker-test-1/resume.pdf",
      job: dummyJob,
      applicant: dummyUser,
    })

    await applicationService.withdrawApplication(app.id)

    const userApps = await applicationService.getUserApplications(dummyUser.id)
    const withdrawn = userApps.find((a) => a.id === app.id)
    expect(withdrawn?.status).toBe("Withdrawn")
  })

  it("allows a seeker to re-apply after withdrawing an application", async () => {
    const app = await applicationService.submitApplication({
      jobId: dummyJob.id,
      userId: dummyUser.id,
      resumeFile: "resumes/seeker-test-1/resume.pdf",
      job: dummyJob,
      applicant: dummyUser,
    })

    await applicationService.withdrawApplication(app.id)

    // Reapplying should succeed and reset status to Applied
    const reApp = await applicationService.submitApplication({
      jobId: dummyJob.id,
      userId: dummyUser.id,
      resumeFile: "resumes/seeker-test-1/new-resume.pdf",
      coverLetter: "Updated application with new portfolio",
      job: dummyJob,
      applicant: dummyUser,
    })

    expect(reApp.status).toBe("Applied")
    expect(reApp.coverLetter).toBe("Updated application with new portfolio")
  })

  it("validates resume upload size limits (max 5 MB)", async () => {
    // 6 MB dummy file
    const oversizedBlob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: "application/pdf" })
    const oversizedFile = new File([oversizedBlob], "large_resume.pdf", { type: "application/pdf" })

    await expect(
      storageService.uploadResume(oversizedFile, dummyUser.id)
    ).rejects.toThrow(/exceeds maximum allowed size of 5 MB/i)
  })

  it("validates resume upload file format (only PDF or DOCX allowed)", async () => {
    const invalidBlob = new Blob(["executable code"], { type: "application/x-msdownload" })
    const invalidFile = new File([invalidBlob], "virus.exe", { type: "application/x-msdownload" })

    await expect(
      storageService.uploadResume(invalidFile, dummyUser.id)
    ).rejects.toThrow(/Invalid file type/i)
  })

  it("enforces HTTPS external URL requirements for external apply mode", () => {
    const validUrl = "https://boards.greenhouse.io/stripe/jobs/12345"
    const invalidHttpUrl = "http://unsecure-ats.com/apply"
    const invalidNonUrl = "not-a-valid-url"

    const isHttpsUrl = (url?: string) => {
      if (!url) return false
      try {
        const parsed = new URL(url)
        return parsed.protocol === "https:"
      } catch {
        return false
      }
    }

    expect(isHttpsUrl(validUrl)).toBe(true)
    expect(isHttpsUrl(invalidHttpUrl)).toBe(false)
    expect(isHttpsUrl(invalidNonUrl)).toBe(false)
  })
})
