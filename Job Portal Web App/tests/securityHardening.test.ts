import { describe, it, expect, beforeEach } from "vitest"
import { storageService } from "../src/lib/supabase"
import { emailService } from "../src/services/emailService"

const mockStorage: Record<string, string> = {}
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val },
  removeItem: (key: string) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
  length: 0,
  key: () => null,
} as any

describe("Security Hardening & Validation Test Suite", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("File Upload Security Validation", () => {
    it("rejects resume files that exceed 5 MB limit", () => {
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "oversized-resume.pdf", {
        type: "application/pdf",
      })

      expect(() => {
        storageService.validateFile(largeFile, {
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ["application/pdf"],
          allowedExtensions: ["pdf"],
        })
      }).toThrow(/File exceeds maximum allowed size/i)
    })

    it("rejects malicious executable files and scripts", () => {
      const maliciousFile = new File(["malicious payload"], "exploit.exe", {
        type: "application/x-msdownload",
      })

      expect(() => {
        storageService.validateFile(maliciousFile, {
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ["application/pdf"],
          allowedExtensions: ["pdf"],
        })
      }).toThrow(/Invalid file type/i)
    })

    it("detects and blocks path traversal in filenames", () => {
      const traversalFile = new File(["safe content"], "../../../etc/passwd.pdf", {
        type: "application/pdf",
      })

      expect(() => {
        storageService.validateFile(traversalFile, {
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ["application/pdf"],
          allowedExtensions: ["pdf"],
        })
      }).toThrow(/Path traversal characters are not permitted/i)
    })

    it("accepts valid PDF resumes within size limits", () => {
      const validPdf = new File(["%PDF-1.4 sample content"], "john-doe-resume.pdf", {
        type: "application/pdf",
      })

      expect(() => {
        storageService.validateFile(validPdf, {
          maxSize: 5 * 1024 * 1024,
          allowedTypes: ["application/pdf"],
          allowedExtensions: ["pdf", "docx"],
        })
      }).not.toThrow()
    })

    it("accepts valid image avatars within 2 MB limits", () => {
      const validAvatar = new File(["image-bytes"], "avatar.png", {
        type: "image/png",
      })

      expect(() => {
        storageService.validateFile(validAvatar, {
          maxSize: 2 * 1024 * 1024,
          allowedTypes: ["image/png", "image/jpeg", "image/webp"],
          allowedExtensions: ["png", "jpg", "jpeg", "webp"],
        })
      }).not.toThrow()
    })
  })

  describe("Email Delivery Architecture & Rate Limiting", () => {
    it("generates status update email correctly", () => {
      const html = emailService.generateStatusUpdateEmailHtml({
        candidateName: "Jane Smith",
        jobTitle: "Staff Cloud Architect",
        companyName: "Google",
        newStatus: "Interview",
        notes: "Technical round scheduled for Thursday 2 PM EST.",
      })

      expect(html).toContain("Jane Smith")
      expect(html).toContain("Staff Cloud Architect")
      expect(html).toContain("Google")
      expect(html).toContain("Interview")
      expect(html).toContain("Technical round scheduled")
    })

    it("enforces client rate limiting when email threshold is exceeded", async () => {
      const dummyUser = {
        id: "u-flood",
        name: "Test User",
        email: "flood@example.com",
        role: "job_seeker" as const,
        skills: [],
        profileCompletion: 50,
        isVerified: true,
        createdAt: new Date().toISOString(),
      }
      const dummyJob = {
        id: "job-1",
        title: "Software Engineer",
        company: { name: "Acme", slug: "acme" },
        location: "Remote",
        type: "Full-time",
        experience: "1-3 yrs",
        status: "published" as const,
      } as any

      // Dispatch 5 allowed requests
      for (let i = 0; i < 5; i++) {
        await emailService.sendApplicationConfirmation({
          applicant: dummyUser,
          job: dummyJob,
          applicationId: `app-flood-${i}`,
        })
      }

      // The 6th request within the window must trigger rate limit error
      await expect(
        emailService.sendApplicationConfirmation({
          applicant: dummyUser,
          job: dummyJob,
          applicationId: "app-flood-exceed",
        })
      ).rejects.toThrow(/Rate limit exceeded/i)
    })
  })
})
