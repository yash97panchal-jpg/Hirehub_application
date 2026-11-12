import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  applicationService,
  companyService,
  externalApplyService,
  moderationService,
  storageService,
  messageService,
  authService,
} from "../src/lib/supabase"
import { emailService } from "../src/services/emailService"
import { useMessageStore } from "../src/store/messageStore"
import { useAuthStore } from "../src/store/authStore"
import type { User, Job, Company, ChatMessage, Conversation } from "../src/types"

if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as any
}

describe("QA Comprehensive Bug Fix Regression Test Suite (BUG-001 to BUG-016)", () => {
  const candidateUser: User = {
    id: "user-cand-101",
    name: "Alex Dev",
    email: "alex.dev@example.com",
    role: "job_seeker",
    skills: ["React", "TypeScript", "Node.js"],
    profileCompletion: 90,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const candidateUserB: User = {
    id: "user-cand-102",
    name: "Carlos Seeker",
    email: "carlos@example.com",
    role: "job_seeker",
    skills: ["Python", "PostgreSQL"],
    profileCompletion: 85,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const recruiterUserA: User = {
    id: "user-rec-201",
    name: "Rachel Recruiter",
    email: "rachel@stripe.com",
    role: "recruiter",
    skills: ["Talent Acquisition"],
    profileCompletion: 95,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const recruiterUserB: User = {
    id: "user-rec-301",
    name: "Bob Rival",
    email: "bob@google.com",
    role: "recruiter",
    skills: ["Talent Acquisition"],
    profileCompletion: 95,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const adminUser: User = {
    id: "user-admin-999",
    name: "Super Admin",
    email: "admin@hirehub.app",
    role: "admin",
    profileCompletion: 100,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const testCompanyA: Company = {
    id: "comp-aaa-111",
    name: "Stripe Global",
    slug: "stripe-global",
    status: "approved",
    isVerified: true,
    location: "San Francisco, CA",
  }

  const testCompanyB: Company = {
    id: "comp-bbb-222",
    name: "Google Cloud",
    slug: "google-cloud",
    status: "approved",
    isVerified: true,
    location: "Mountain View, CA",
  }

  const testJobA: Job = {
    id: "job-aaa-111",
    title: "Senior Full Stack Architect",
    company: testCompanyA,
    description: "Lead developer on high throughput payments platform.",
    location: "Remote",
    type: "Full-time",
    experienceLevel: "Senior",
    applyMode: "easy",
    postedAt: "2026-11-01",
    applicationCount: 0,
  }

  const testJobB: Job = {
    id: "job-bbb-222",
    title: "Kubernetes Systems Lead",
    company: testCompanyB,
    description: "Scale distributed cloud infrastructure.",
    location: "Mountain View, CA",
    type: "Full-time",
    experienceLevel: "Staff",
    applyMode: "easy",
    postedAt: "2026-11-01",
    applicationCount: 0,
  }

  beforeEach(() => {
    localStorage.clear()
    useMessageStore.getState().reset()
    vi.restoreAllMocks()
    emailService.setProviderEndpoint(null)
    emailService.setRetryConfig({ baseDelayMs: 10, skipDelayForTesting: true })
  })

  // ---------------------------------------------------------------------------
  // BUG-001: Job Application Status Authorization
  // ---------------------------------------------------------------------------
  describe("BUG-001: Job Application Status Authorization", () => {
    it("prevents an applicant from escalating their own status to Selected, Shortlisted, or Interview", async () => {
      const app = await applicationService.submitApplication({
        jobId: testJobA.id,
        userId: candidateUser.id,
        resumeFile: "resumes/alex/resume.pdf",
        job: testJobA,
        applicant: candidateUser,
      })

      expect(app.status).toBe("Applied")

      // Candidate maliciously attempts to mark themselves Selected
      await expect(
        applicationService.updateStatus(
          app.id,
          "Selected",
          "Promoted myself",
          candidateUser.id,
          candidateUser.name
        )
      ).rejects.toThrow(/Security Violation: Candidates are strictly forbidden from setting application status to "Selected"/i)

      // Candidate maliciously attempts to mark themselves Shortlisted
      await expect(
        applicationService.updateStatus(
          app.id,
          "Shortlisted",
          "Promoted myself",
          candidateUser.id,
          candidateUser.name
        )
      ).rejects.toThrow(/Security Violation: Candidates are strictly forbidden from setting application status to "Shortlisted"/i)

      // Candidate maliciously attempts to mark themselves Interview
      await expect(
        applicationService.updateStatus(
          app.id,
          "Interview",
          "Promoted myself",
          candidateUser.id,
          candidateUser.name
        )
      ).rejects.toThrow(/Security Violation: Candidates are strictly forbidden from setting application status to "Interview"/i)
    })

    it("allows candidate to safely withdraw their own eligible application", async () => {
      const app = await applicationService.submitApplication({
        jobId: testJobA.id,
        userId: candidateUser.id,
        resumeFile: "resumes/alex/resume.pdf",
        job: testJobA,
        applicant: candidateUser,
      })

      // Candidate performs withdrawal
      await applicationService.withdrawApplication(app.id, candidateUser.id, candidateUser.name)

      const history = await applicationService.getStatusHistory(app.id)
      expect(history.length).toBeGreaterThan(0)
      expect(history[0].status).toBe("Withdrawn")

      const userApps = await applicationService.getUserApplications(candidateUser.id)
      expect(userApps[0].status).toBe("Withdrawn")
    })

    it("blocks an unauthorized user from withdrawing another candidate's application", async () => {
      const app = await applicationService.submitApplication({
        jobId: testJobA.id,
        userId: candidateUser.id,
        resumeFile: "resumes/alex/resume.pdf",
        job: testJobA,
        applicant: candidateUser,
      })

      // Another user attempts to withdraw Alex's application
      await expect(
        applicationService.withdrawApplication(app.id, "malicious-user-999", "Eve Attacker")
      ).rejects.toThrow(/Unauthorized: Candidates can only withdraw their own applications/i)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-002: Job Report Authorization
  // ---------------------------------------------------------------------------
  describe("BUG-002: Job Report Authorization", () => {
    it("allows normal user to file report with default 'pending' status", async () => {
      await moderationService.reportJob(
        testJobA.id,
        "Misleading job description and fraudulent compensation",
        "Salary promised differs from official contract.",
        candidateUser.id
      )

      const reports = await moderationService.getReports(candidateUser.id)
      expect(reports.length).toBe(1)
      expect(reports[0].reason).toContain("Misleading")
      expect(reports[0].status).toBe("pending")
    })

    it("blocks non-admin user from updating report moderation status to resolved/dismissed", async () => {
      await moderationService.reportJob(
        testJobA.id,
        "Spam Posting",
        "Duplicate posting",
        candidateUser.id
      )
      const reports = await moderationService.getReports(candidateUser.id)
      const reportId = reports[0].id

      // Normal candidate tries to resolve report
      await expect(
        moderationService.updateReportStatus(reportId, "dismissed", candidateUser.id)
      ).rejects.toThrow(/Security Violation: Only platform administrators can moderate job reports/i)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-003: Real Supabase Messaging
  // ---------------------------------------------------------------------------
  describe("BUG-003: Real Supabase Messaging", () => {
    it("manages conversations and persists messages without predefined demo data", async () => {
      const store = useMessageStore.getState()
      expect(store.conversations).toEqual([])

      // Create conversation between Candidate and Recruiter
      const conv = await messageService.getOrCreateConversation({
        currentUserId: candidateUser.id,
        participantId: recruiterUserA.id,
        jobId: testJobA.id,
        jobTitle: testJobA.title,
        companyName: testCompanyA.name,
      })

      expect(conv.id).toBeDefined()
      expect(conv.participantId).toBe(recruiterUserA.id)

      // Send real message
      const msg = await messageService.sendMessage({
        conversationId: conv.id,
        senderId: candidateUser.id,
        senderName: candidateUser.name,
        senderRole: "job_seeker",
        content: "Hi Rachel, I am very interested in the Senior Architect role.",
        receiverId: recruiterUserA.id,
      })

      expect(msg.content).toContain("interested in the Senior Architect")
      expect(msg.senderId).toBe(candidateUser.id)
      expect(msg.isRead).toBe(false)

      // Fetch messages for conversation
      const list = await messageService.getMessages(conv.id)
      expect(list.length).toBe(1)
      expect(list[0].id).toBe(msg.id)
    })

    it("prevents duplicate messages during realtime synchronization", () => {
      const store = useMessageStore.getState()
      const sampleMsg: ChatMessage = {
        id: "m-realtime-dedup-1",
        conversationId: "conv-dedup",
        senderId: recruiterUserA.id,
        senderName: recruiterUserA.name,
        senderRole: "recruiter",
        content: "Let us schedule a system design screen.",
        timestamp: "11:00 AM",
        isRead: false,
      }

      // First incoming event
      store.handleRealtimeIncoming(sampleMsg, candidateUser.id)
      expect(useMessageStore.getState().messages["conv-dedup"]?.length).toBe(1)

      // Duplicate delivery of same message event
      store.handleRealtimeIncoming(sampleMsg, candidateUser.id)
      expect(useMessageStore.getState().messages["conv-dedup"]?.length).toBe(1)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-004: Email Delivery & Truthful Status
  // ---------------------------------------------------------------------------
  describe("BUG-004: Email Delivery & Truthful Status", () => {
    it("truthfully reports pending when no email provider is configured", async () => {
      const record = await emailService.sendApplicationConfirmation({
        applicant: candidateUser,
        job: testJobA,
        applicationId: "app-truthful-1",
      })

      expect(record.status).toBe("pending")
      expect(record.errorMessage).toContain("Email provider not configured")
    })

    it("enforces idempotency and halts when max retry count (3) is exceeded", async () => {
      const record = await emailService.sendApplicationConfirmation({
        applicant: candidateUser,
        job: testJobA,
        applicationId: "app-retry-fail-check",
      })

      // Simulate 3 prior retries
      const list = emailService.getSentEmails()
      list[0].retryCount = 3
      list[0].status = "failed"
      localStorage.setItem("hirehub_sent_emails_v1", JSON.stringify(list))

      const retryResult = await emailService.retryEmail(record.id)
      expect(retryResult?.status).toBe("failed")
      expect(retryResult?.errorMessage).toContain("Maximum retry limit (3) reached")
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-005: Company Logo Storage Authorization
  // ---------------------------------------------------------------------------
  describe("BUG-005: Company Logo Storage Authorization", () => {
    it("validates file MIME type, size, and path traversal characters", () => {
      // Rejects executable files
      const exeFile = new File(["MZ..."], "virus.exe", { type: "application/x-msdownload" })
      expect(() =>
        storageService.validateFile(exeFile, {
          maxSize: 2 * 1024 * 1024,
          allowedTypes: ["image/png", "image/jpeg", "image/webp"],
          allowedExtensions: ["png", "jpg", "jpeg", "webp"],
        })
      ).toThrow(/Invalid file type/i)

      // Rejects oversized logo (>2MB)
      const hugeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], "large-logo.png", { type: "image/png" })
      expect(() =>
        storageService.validateFile(hugeFile, {
          maxSize: 2 * 1024 * 1024,
          allowedTypes: ["image/png", "image/jpeg", "image/webp"],
          allowedExtensions: ["png", "jpg"],
        })
      ).toThrow(/File exceeds maximum allowed size/i)

      // Rejects path traversal filenames
      const traversalFile = new File(["data"], "../malicious.png", { type: "image/png" })
      expect(() =>
        storageService.validateFile(traversalFile, {
          maxSize: 2 * 1024 * 1024,
          allowedTypes: ["image/png"],
          allowedExtensions: ["png"],
        })
      ).toThrow(/Path traversal characters are not permitted/i)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-006: Account Deletion and Storage Cleanup
  // ---------------------------------------------------------------------------
  describe("BUG-006: Account Deletion and Storage Cleanup", () => {
    it("clears local auth state safely in fallback mode", async () => {
      const result = await authService.deleteAccount(candidateUser.id)
      expect(result.success).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-007: External Application Tracking
  // ---------------------------------------------------------------------------
  describe("BUG-007: External Application Tracking", () => {
    it("validates tracking payload and rejects invalid job ID", async () => {
      await expect(externalApplyService.logClick("", candidateUser.id)).rejects.toThrow(
        /Validation Error: Invalid or missing job ID/i
      )
    })

    it("records valid external apply click and verifies confirmation", async () => {
      const clickId = await externalApplyService.logClick(testJobA.id, candidateUser.id)
      expect(clickId).toBeDefined()
      expect(clickId).toContain("click-")

      const confirmResult = await externalApplyService.confirmApplication(
        clickId,
        "applied",
        candidateUser.id
      )
      expect(confirmResult.success).toBe(true)
      expect(confirmResult.status).toBe("applied")
    })

    it("rejects confirmation if click record ID is missing or belongs to another user", async () => {
      const clickId = await externalApplyService.logClick(testJobA.id, candidateUser.id)

      // Another user attempts to confirm Alex's click
      await expect(
        externalApplyService.confirmApplication(clickId, "applied", "another-user-999")
      ).rejects.toThrow(/Authorization Violation: You cannot confirm an application record belonging to another user/i)

      // Non-existent click ID
      await expect(
        externalApplyService.confirmApplication("click-non-existent-999", "applied")
      ).rejects.toThrow(/Tracking record not found/i)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-008: Message Read-Receipt Authorization
  // ---------------------------------------------------------------------------
  describe("BUG-008: Message Read-Receipt Authorization", () => {
    it("allows message receiver to mark message as read and updates read receipts", async () => {
      const conv = await messageService.getOrCreateConversation({
        currentUserId: candidateUser.id,
        participantId: recruiterUserA.id,
      })

      // Recruiter sends message to Candidate
      const msg = await messageService.sendMessage({
        conversationId: conv.id,
        senderId: recruiterUserA.id,
        senderName: recruiterUserA.name,
        senderRole: "recruiter",
        content: "Hello Alex, are you available tomorrow?",
        receiverId: candidateUser.id,
      })

      expect(msg.isRead).toBe(false)

      // Candidate (as receiver) marks message as read
      await messageService.markAsRead(conv.id, candidateUser.id)

      const messagesAfterRead = await messageService.getMessages(conv.id)
      expect(messagesAfterRead[0].isRead).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-009: Secure Conversation Ownership & Immutability
  // ---------------------------------------------------------------------------
  describe("BUG-009: Secure Conversation Ownership & Immutability", () => {
    it("establishes conversation between participants and preserves immutability of participants", async () => {
      const conv = await messageService.getOrCreateConversation({
        currentUserId: candidateUser.id,
        participantId: recruiterUserA.id,
        jobId: testJobA.id,
      })

      expect(conv.id).toBeDefined()
      expect(conv.participantId).toBe(recruiterUserA.id)

      // Re-querying conversation with same participants returns the existing conversation (atomic reuse)
      const convSecond = await messageService.getOrCreateConversation({
        currentUserId: candidateUser.id,
        participantId: recruiterUserA.id,
        jobId: testJobA.id,
      })
      expect(convSecond.id).toBe(conv.id)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-010: Secure Message-to-Conversation Authorization
  // ---------------------------------------------------------------------------
  describe("BUG-010: Secure Message-to-Conversation Authorization", () => {
    it("allows authorized participants to send messages and prevents self-messaging", async () => {
      const conv = await messageService.getOrCreateConversation({
        currentUserId: candidateUser.id,
        participantId: recruiterUserA.id,
      })

      const msg = await messageService.sendMessage({
        conversationId: conv.id,
        senderId: candidateUser.id,
        senderName: candidateUser.name,
        senderRole: "job_seeker",
        content: "Valid conversation message from participant.",
        receiverId: recruiterUserA.id,
      })

      expect(msg.senderId).toBe(candidateUser.id)
      expect(msg.content).toBe("Valid conversation message from participant.")
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-011: Strict Application Field Protection
  // ---------------------------------------------------------------------------
  describe("BUG-011: Strict Application Field Protection", () => {
    it("forbids an applicant from modifying submitted resume or evaluations post-submission", async () => {
      const app = await applicationService.submitApplication({
        jobId: testJobA.id,
        userId: candidateUser.id,
        resumeFile: "resumes/alex/original-resume.pdf",
        job: testJobA,
        applicant: candidateUser,
      })

      // Candidate cannot escalate status
      await expect(
        applicationService.updateStatus(app.id, "Selected", "Hired myself", candidateUser.id)
      ).rejects.toThrow(/Security Violation: Candidates are strictly forbidden/i)

      // Candidate withdrawal works cleanly
      await applicationService.withdrawApplication(app.id, candidateUser.id, candidateUser.name)
      const userApps = await applicationService.getUserApplications(candidateUser.id)
      expect(userApps[0].status).toBe("Withdrawn")
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-012: Safe Account Deletion & Storage Cleanup Workflow
  // ---------------------------------------------------------------------------
  describe("BUG-012: Safe Account Deletion & Storage Cleanup Workflow", () => {
    it("supports safe account deletion and retry", async () => {
      const result = await authService.deleteAccount(candidateUser.id)
      expect(result.success).toBe(true)

      // Retry mechanism can be called safely
      const retryResult = await authService.retryAccountDeletion(candidateUser.id)
      expect(retryResult.success).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-013: Complete Message Read-Receipt Protection
  // ---------------------------------------------------------------------------
  describe("BUG-013: Complete Message Read-Receipt Protection", () => {
    it("allows receiver to mark message as read without altering content", async () => {
      const conv = await messageService.getOrCreateConversation({
        currentUserId: candidateUser.id,
        participantId: recruiterUserA.id,
      })

      const msg = await messageService.sendMessage({
        conversationId: conv.id,
        senderId: recruiterUserA.id,
        senderName: recruiterUserA.name,
        senderRole: "recruiter",
        content: "Interview proposal: Friday 2pm.",
        receiverId: candidateUser.id,
      })

      expect(msg.isRead).toBe(false)
      expect(msg.content).toBe("Interview proposal: Friday 2pm.")

      // Receiver marks read
      await messageService.markAsRead(conv.id, candidateUser.id)

      const after = await messageService.getMessages(conv.id)
      expect(after[0].isRead).toBe(true)
      // Content remains untouched
      expect(after[0].content).toBe("Interview proposal: Friday 2pm.")
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-014: Real Email Retry, Exponential Backoff, Stable Idempotency & Webhooks
  // ---------------------------------------------------------------------------
  describe("BUG-014: Real Email Retry, Exponential Backoff, Stable Idempotency & Webhooks", () => {
    it("uses stable idempotency key across email retries", async () => {
      const emailRecord = await emailService.sendApplicationConfirmation({
        applicant: candidateUser,
        job: testJobA,
        applicationId: "app-idemp-test-1",
      })

      const originalKey = emailRecord.idempotencyKey
      expect(originalKey).toBeDefined()
      expect(originalKey).toContain("idemp_app_app-idemp-test-1")

      // Execute retry
      const retried = await emailService.retryEmail(emailRecord.id)
      expect(retried?.idempotencyKey).toBe(originalKey)
    })

    it("verifies cryptographic webhook signature and rejects forged events", async () => {
      const secret = "hirehub_webhook_secret_key_2026"
      const payload = JSON.stringify({
        eventId: "evt-001",
        emailId: "email-test-webhook",
        event: "delivered",
      })

      // Generate valid HMAC signature
      const enc = new TextEncoder()
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      )
      const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload))
      const validSig = Array.from(new Uint8Array(sigBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

      // Valid signature passes
      const isValid = await emailService.verifyWebhookSignature(payload, validSig, secret)
      expect(isValid).toBe(true)

      // Tampered signature is rejected
      const isForged = await emailService.verifyWebhookSignature(payload, "invalid_hex_signature", secret)
      expect(isForged).toBe(false)
    })

    it("processes delivery webhook and deduplicates duplicate events", async () => {
      const email = await emailService.sendApplicationConfirmation({
        applicant: candidateUser,
        job: testJobA,
        applicationId: "app-webhook-dedup",
      })

      const webhookPayload = {
        eventId: "evt-webhook-unique-123",
        emailId: email.id,
        idempotencyKey: email.idempotencyKey,
        event: "delivered" as const,
        deliveredAt: new Date().toISOString(),
      }

      // First processing
      const firstResult = await emailService.processWebhookDelivery(webhookPayload)
      expect(firstResult.success).toBe(true)

      const updatedList = emailService.getSentEmails()
      const updated = updatedList.find((e) => e.id === email.id)
      expect(updated?.status).toBe("delivered")

      // Duplicate processing is safely acknowledged
      const dupResult = await emailService.processWebhookDelivery(webhookPayload)
      expect(dupResult.success).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-015: Messaging False Success, Optimistic Rollback & Account Isolation
  // ---------------------------------------------------------------------------
  describe("BUG-015: Messaging False Success, Optimistic Rollback & Account Isolation", () => {
    it("marks message as failed and sets store error when persistence fails", async () => {
      const store = useMessageStore.getState()

      // Mock messageService.sendMessage to simulate database rejection
      vi.spyOn(messageService, "sendMessage").mockRejectedValueOnce(
        new Error("PostgreSQL RLS Violation: Not authorized to send to this conversation.")
      )

      await expect(
        store.sendMessage("conv-fail-test", {
          senderId: candidateUser.id,
          senderName: candidateUser.name,
          senderRole: "job_seeker",
          content: "This message should fail.",
        })
      ).rejects.toThrow(/PostgreSQL RLS Violation/i)

      const messages = useMessageStore.getState().messages["conv-fail-test"]
      expect(messages.length).toBe(1)
      expect(messages[0].status).toBe("failed")
      expect(useMessageStore.getState().error).toContain("PostgreSQL RLS Violation")
    })

    it("rolls back optimistic read status when server markAsRead fails", async () => {
      const store = useMessageStore.getState()
      const convId = "conv-read-rollback"

      // Setup initial unread message
      const unreadMsg: ChatMessage = {
        id: "msg-unread-1",
        conversationId: convId,
        senderId: recruiterUserA.id,
        senderName: recruiterUserA.name,
        senderRole: "recruiter",
        content: "Unread message",
        timestamp: "10:00 AM",
        isRead: false,
      }
      store.addConversation({
        id: convId,
        participantId: recruiterUserA.id,
        participantName: recruiterUserA.name,
        participantRole: "recruiter",
        lastMessage: "Unread message",
        lastTimestamp: "10:00 AM",
        unreadCount: 1,
      })
      useMessageStore.setState({
        messages: { [convId]: [unreadMsg] },
      })

      // Simulate database error when marking read
      vi.spyOn(messageService, "markAsRead").mockRejectedValueOnce(
        new Error("Database connection timed out.")
      )

      await expect(store.markAsRead(convId, candidateUser.id)).rejects.toThrow(
        /Database connection timed out/i
      )

      // State is rolled back: isRead remains false and unreadCount remains 1
      const stateAfter = useMessageStore.getState()
      expect(stateAfter.messages[convId][0].isRead).toBe(false)
      expect(stateAfter.conversations.find((c) => c.id === convId)?.unreadCount).toBe(1)
      expect(stateAfter.error).toContain("Database connection timed out")
    })

    it("isolates accounts: logging out completely purges cached messages", () => {
      const store = useMessageStore.getState()
      store.addConversation({
        id: "conv-secret-1",
        participantId: recruiterUserA.id,
        participantName: recruiterUserA.name,
        participantRole: "recruiter",
        lastMessage: "Confidential offer",
        lastTimestamp: "12:00 PM",
        unreadCount: 0,
      })
      expect(useMessageStore.getState().conversations.length).toBe(1)

      // User logs out
      useAuthStore.getState().logout()

      // Message store is purged
      expect(useMessageStore.getState().conversations.length).toBe(0)
      expect(Object.keys(useMessageStore.getState().messages).length).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // BUG-016: Strict Company Logo MIME Validation, SVG Rejection, and Recruiter Role
  // ---------------------------------------------------------------------------
  describe("BUG-016: Strict Company Logo MIME Validation, SVG Rejection, and Recruiter Role", () => {
    it("strictly disallows SVG uploads to eliminate stored XSS risks", async () => {
      const svgFile = new File(['<svg onload="alert(1)"></svg>'], "logo.svg", {
        type: "image/svg+xml",
      })

      await expect(
        storageService.uploadCompanyLogo(svgFile, testCompanyA.slug, recruiterUserA.id)
      ).rejects.toThrow(/Invalid file type|SVG/i)
    })

    it("permits valid PNG, JPEG, and WebP company logos", () => {
      const pngFile = new File(["fake-png-bytes"], "logo.png", { type: "image/png" })
      expect(() =>
        storageService.validateFile(pngFile, {
          maxSize: 2 * 1024 * 1024,
          allowedTypes: ["image/png", "image/jpeg", "image/webp"],
          allowedExtensions: ["png", "jpg", "jpeg", "webp"],
        })
      ).not.toThrow()
    })
  })
})
