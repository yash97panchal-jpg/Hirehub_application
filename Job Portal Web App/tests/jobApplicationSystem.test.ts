import { describe, it, expect, beforeEach } from "vitest"
import {
  applicationService,
  interviewService,
  adminService,
} from "../src/lib/supabase"
import type { Job, User, ApplicationStatus } from "../src/types"

// Ensure standard localStorage mock in Node test runner
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

describe("HireHub Complete Job Application System", () => {
  const mockRecruiter: User = {
    id: "recruiter-alpha-1",
    name: "Sarah Recruiter",
    email: "sarah.recruiter@stripe.com",
    role: "recruiter",
    skills: ["Talent Acquisition", "Technical Recruiting"],
    profileCompletion: 90,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const mockCandidate: User = {
    id: "seeker-jordan-1",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    role: "job_seeker",
    phone: "+1 (555) 789-0123",
    location: "Austin, TX",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    profileCompletion: 95,
    isVerified: true,
    createdAt: new Date().toISOString(),
  }

  const mockJob: Job = {
    id: "job-stripe-sr-eng",
    title: "Senior Full Stack Platform Engineer",
    company: {
      id: "comp-stripe",
      name: "Stripe",
      slug: "stripe",
      isVerified: true,
      status: "approved",
      location: "San Francisco, CA",
      rating: 4.8,
      reviewCount: 320,
      createdBy: mockRecruiter.id,
    },
    description: "Architect mission-critical payment infrastructure and real-time state machines.",
    location: "Austin, TX (Hybrid)",
    type: "Full-time",
    experience: "Senior",
    salaryMin: 165000,
    salaryMax: 210000,
    status: "published",
    applyMode: "easy",
    skills: ["React", "TypeScript", "Node.js", "Distributed Systems"],
    applicationCount: 12,
    postedAt: "2026-11-01",
    screeningQuestions: [
      {
        id: "q_dist_sys",
        question: "How many years of production distributed systems experience do you have?",
        type: "text",
        required: true,
      },
      {
        id: "q_relocate",
        question: "Are you comfortable working in Austin, TX on a hybrid schedule?",
        type: "yes_no",
        required: true,
      },
    ],
  }

  beforeEach(() => {
    localStorage.clear()
  })

  // =========================================================================
  // 1. JOB SEEKER – APPLY FOR JOBS WITH 14 FIELDS & ID GENERATION
  // =========================================================================
  describe("1. Candidate Application Submission & Validation", () => {
    it("submits application with all 14 fields and generates unique APP-YYYYMMDD-XXXX ID", async () => {
      const application = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,

        // 14 Comprehensive Fields
        fullName: "Jordan Lee",
        email: "jordan.lee@example.com",
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science in Software Engineering",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Kafka"],
        expectedSalary: "$185,000 / year",
        noticePeriod: "2 weeks",
        resumeFile: "resumes/jordan/jordan_lee_resume.pdf",
        resumeName: "Jordan_Lee_Senior_FullStack.pdf",
        coverLetter: "Excited to bring 7 years of distributed ledger and UI architecture experience to Stripe.",
        linkedinUrl: "https://linkedin.com/in/jordanlee-dev",
        portfolioUrl: "https://github.com/jordanlee-core",
        answers: {
          q_dist_sys: "5+ years with Apache Kafka and Raft consensus.",
          q_relocate: "Yes",
        },
      })

      // Validation assertions
      expect(application).toBeDefined()
      expect(application.id).toMatch(/^APP-\d{8}-[A-Z0-9]{4}$/)
      expect(application.applicationCode).toBe(application.id)
      expect(application.status).toBe("Applied")
      expect(application.fullName).toBe("Jordan Lee")
      expect(application.email).toBe("jordan.lee@example.com")
      expect(application.mobileNumber).toBe("+1 (555) 789-0123")
      expect(application.currentLocation).toBe("Austin, TX")
      expect(application.highestEducation).toBe("Master of Science in Software Engineering")
      expect(application.totalExperience).toBe("7 years")
      expect(application.expectedSalary).toBe("$185,000 / year")
      expect(application.noticePeriod).toBe("2 weeks")
      expect(application.linkedinUrl).toBe("https://linkedin.com/in/jordanlee-dev")
      expect(application.portfolioUrl).toBe("https://github.com/jordanlee-core")
      expect(application.answers?.q_dist_sys).toContain("Kafka")
    })

    it("prevents duplicate active applications for the same job and user", async () => {
      // First submission
      await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React", "TypeScript"],
        resumeFile: "resumes/jordan/resume.pdf",
      })

      // Second submission should be rejected
      await expect(
        applicationService.submitApplication({
          jobId: mockJob.id,
          userId: mockCandidate.id,
          job: mockJob,
          applicant: mockCandidate,
          fullName: mockCandidate.name,
          email: mockCandidate.email,
          mobileNumber: "+1 (555) 789-0123",
          currentLocation: "Austin, TX",
          highestEducation: "Master of Science",
          totalExperience: "7 years",
          currentEmploymentStatus: "Employed",
          skills: ["React", "TypeScript"],
          resumeFile: "resumes/jordan/resume.pdf",
        })
      ).rejects.toThrow(/already applied/i)
    })

    it("rejects application when job is expired or closed", async () => {
      const expiredJob: Job = {
        ...mockJob,
        id: "job-expired-1",
        status: "closed",
      }

      await expect(
        applicationService.submitApplication({
          jobId: expiredJob.id,
          userId: mockCandidate.id,
          job: expiredJob,
          applicant: mockCandidate,
          fullName: mockCandidate.name,
          email: mockCandidate.email,
          mobileNumber: "+1 (555) 789-0123",
          currentLocation: "Austin, TX",
          highestEducation: "Bachelor of Science",
          totalExperience: "5 years",
          currentEmploymentStatus: "Employed",
          skills: ["React"],
          resumeFile: "resumes/resume.pdf",
        })
      ).rejects.toThrow(/not currently accepting applications/i)
    })

    it("validates that invalid non-HTTPS profile URLs are rejected", async () => {
      await expect(
        applicationService.submitApplication({
          jobId: mockJob.id,
          userId: mockCandidate.id,
          job: mockJob,
          applicant: mockCandidate,
          fullName: mockCandidate.name,
          email: mockCandidate.email,
          mobileNumber: "+1 (555) 789-0123",
          currentLocation: "Austin, TX",
          highestEducation: "Bachelor of Science",
          totalExperience: "5 years",
          currentEmploymentStatus: "Employed",
          skills: ["React"],
          resumeFile: "resumes/resume.pdf",
          linkedinUrl: "ftp://insecure-link.com",
        })
      ).rejects.toThrow(/LinkedIn profile URL must start with/i)
    })
  })

  // =========================================================================
  // 2. APPLICATION WITHDRAWAL & RE-APPLICATION LIFECYCLE
  // =========================================================================
  describe("2. Application Withdrawal & Reapplication", () => {
    it("allows candidate to withdraw application and logs milestone audit trail", async () => {
      const app = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Bachelor of Science",
        totalExperience: "5 years",
        currentEmploymentStatus: "Employed",
        skills: ["React"],
        resumeFile: "resumes/resume.pdf",
      })

      // Candidate withdraws
      await applicationService.withdrawApplication(app.id, mockCandidate.id, mockCandidate.name)

      // Fetch updated
      const apps = await applicationService.getSeekerApplications(mockCandidate.id)
      const withdrawnApp = apps.find((a) => a.id === app.id)

      expect(withdrawnApp?.status).toBe("Withdrawn")

      // Verify audit history trail
      const history = await applicationService.getStatusHistory(app.id)
      expect(history.length).toBeGreaterThanOrEqual(2) // Initial "Applied" + "Withdrawn"
      const lastHistory = history[0]
      expect(lastHistory.newStatus || lastHistory.status).toBe("Withdrawn")
      expect(lastHistory.changedByName).toBe(mockCandidate.name)
    })

    it("permits re-application after previous submission was withdrawn", async () => {
      const initialApp = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Bachelor of Science",
        totalExperience: "5 years",
        currentEmploymentStatus: "Employed",
        skills: ["React"],
        resumeFile: "resumes/resume.pdf",
      })

      // Candidate withdraws
      await applicationService.withdrawApplication(initialApp.id, mockCandidate.id, mockCandidate.name)

      // Candidate re-applies to the same job
      const reApplication = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Bachelor of Science",
        totalExperience: "5 years",
        currentEmploymentStatus: "Employed",
        skills: ["React", "TypeScript", "Node.js"],
        resumeFile: "resumes/resume_updated.pdf",
        coverLetter: "Re-applying with refreshed qualifications.",
      })

      expect(reApplication).toBeDefined()
      expect(reApplication.status).toBe("Applied")
      expect(reApplication.coverLetter).toContain("Re-applying with refreshed")
    })
  })

  // =========================================================================
  // 3. RECRUITER – ATS STAGES, STATUS TRANSITIONS & NOTES
  // =========================================================================
  describe("3. Recruiter Application Status & Notes Management", () => {
    it("progresses application across recruiter-controlled lifecycle stages with audit trail", async () => {
      const app = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React", "TypeScript"],
        resumeFile: "resumes/jordan/resume.pdf",
      })

      const stages: ApplicationStatus[] = [
        "Viewed",
        "Screening",
        "Shortlisted",
        "Assessment",
        "Interview Scheduled",
        "Interview Completed",
        "Selected",
        "Hired",
      ]

      for (const nextStage of stages) {
        await applicationService.updateStatus(
          app.id,
          nextStage,
          `Transitioned candidate to ${nextStage}`,
          mockRecruiter.id,
          mockRecruiter.name
        )
      }

      // Verify current status
      const updated = await applicationService.getApplicationById(app.id)
      expect(updated?.status).toBe("Hired")

      // Verify complete milestone audit trail
      const auditTrail = await applicationService.getStatusHistory(app.id)
      expect(auditTrail.length).toBe(stages.length + 1) // Initial Applied + 8 transitions

      const stagesRecorded = auditTrail.map((h) => h.newStatus || h.status)
      expect(stagesRecorded).toContain("Screening")
      expect(stagesRecorded).toContain("Shortlisted")
      expect(stagesRecorded).toContain("Selected")
      expect(stagesRecorded).toContain("Hired")
    })

    it("allows recruiters to record private evaluation notes", async () => {
      const app = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React"],
        resumeFile: "resumes/resume.pdf",
      })

      await applicationService.addRecruiterNote(
        app.id,
        mockRecruiter.id,
        mockRecruiter.name,
        "Candidate has outstanding systems knowledge. Recommend skipping technical screen directly to architect loop."
      )

      const notes = await applicationService.getRecruiterNotes(app.id)
      expect(notes.length).toBe(1)
      expect(notes[0].note).toContain("outstanding systems knowledge")
      expect(notes[0].authorName).toBe(mockRecruiter.name)
    })
  })

  // =========================================================================
  // 4. RECRUITER – INTERVIEW SCHEDULING, RESCHEDULING & SCORECARDS
  // =========================================================================
  describe("4. Interview Scheduling & Evaluation Scorecard", () => {
    it("schedules an interview and automatically updates application status to 'Interview Scheduled'", async () => {
      const app = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React"],
        resumeFile: "resumes/resume.pdf",
      })

      const interview = await interviewService.scheduleInterview({
        applicationId: app.id,
        jobId: mockJob.id,
        candidateId: mockCandidate.id,
        candidateName: mockCandidate.name,
        candidateEmail: mockCandidate.email,
        jobTitle: mockJob.title,
        companyName: mockJob.company.name,
        round: "Technical Architecture",
        interviewType: "Online",
        date: "2026-11-20",
        time: "14:00",
        durationMinutes: 60,
        platform: "Google Meet",
        meetingLink: "https://meet.google.com/xyz-uvw-rst",
        interviewerName: mockRecruiter.name,
        interviewerEmail: mockRecruiter.email,
        interviewerId: mockRecruiter.id,
        notes: "Focus on idempotent message brokers and optimistic concurrency.",
      })

      expect(interview).toBeDefined()
      expect(interview.status).toBe("scheduled")
      expect(interview.meetingLink).toBe("https://meet.google.com/xyz-uvw-rst")

      // Verify application transitioned to "Interview Scheduled"
      const updatedApp = await applicationService.getApplicationById(app.id)
      expect(updatedApp?.status).toBe("Interview Scheduled")
    })

    it("reschedules and cancels an interview with candidate audit logging", async () => {
      const app = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React"],
        resumeFile: "resumes/resume.pdf",
      })

      const interview = await interviewService.scheduleInterview({
        applicationId: app.id,
        jobId: mockJob.id,
        candidateId: mockCandidate.id,
        candidateName: mockCandidate.name,
        candidateEmail: mockCandidate.email,
        jobTitle: mockJob.title,
        companyName: mockJob.company.name,
        round: "System Design",
        interviewType: "Online",
        date: "2026-11-20",
        time: "14:00",
        interviewerName: mockRecruiter.name,
      })

      // Reschedule
      await interviewService.rescheduleInterview(
        interview.id,
        "2026-11-22",
        "16:00",
        "Interviewer emergency conflict",
        mockRecruiter.name
      )

      const interviewsList = await interviewService.getInterviewsForApplication(app.id)
      expect(interviewsList[0].date).toBe("2026-11-22")
      expect(interviewsList[0].time).toBe("16:00")
      expect(interviewsList[0].status).toBe("rescheduled")

      // Cancel
      await interviewService.cancelInterview(
        interview.id,
        "Position filled by internal transfer",
        mockRecruiter.name
      )

      const afterCancel = await interviewService.getInterviewsForApplication(app.id)
      expect(afterCancel[0].status).toBe("cancelled")
    })

    it("submits interviewer scorecard and automatically updates stage to 'Selected'", async () => {
      const app = await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React"],
        resumeFile: "resumes/resume.pdf",
      })

      const interview = await interviewService.scheduleInterview({
        applicationId: app.id,
        jobId: mockJob.id,
        candidateId: mockCandidate.id,
        candidateName: mockCandidate.name,
        candidateEmail: mockCandidate.email,
        jobTitle: mockJob.title,
        companyName: mockJob.company.name,
        round: "Final Loop",
        interviewType: "Online",
        date: "2026-11-21",
        time: "10:00",
        interviewerName: mockRecruiter.name,
      })

      // Submit Strong Hire scorecard
      await interviewService.submitFeedback(interview.id, {
        score: 5,
        strengths: "Flawless knowledge of distributed consensus and zero-downtime schemas.",
        weaknesses: "None observed.",
        recommendation: "Strong Hire",
        notes: "Top 1% candidate this quarter. Extend principal offer.",
        submittedBy: mockRecruiter.name,
        interviewerId: mockRecruiter.id,
      })

      // Check application stage auto-transition to Selected
      const updatedApp = await applicationService.getApplicationById(app.id)
      expect(updatedApp?.status).toBe("Selected")
    })
  })

  // =========================================================================
  // 5. ADMIN – APPLICATION MONITORING & ANOMALY DETECTION
  // =========================================================================
  describe("5. Admin Application Monitoring & Trust & Safety Oversight", () => {
    it("provides admin with global platform application statistics and funnel conversion rate", async () => {
      // Create 3 diverse applications
      await applicationService.submitApplication({
        jobId: mockJob.id,
        userId: mockCandidate.id,
        job: mockJob,
        applicant: mockCandidate,
        fullName: mockCandidate.name,
        email: mockCandidate.email,
        mobileNumber: "+1 (555) 789-0123",
        currentLocation: "Austin, TX",
        highestEducation: "Master of Science",
        totalExperience: "7 years",
        currentEmploymentStatus: "Employed",
        skills: ["React"],
        resumeFile: "resumes/resume.pdf",
      })

      const stats = await adminService.getApplicationStats()

      expect(stats.total).toBeGreaterThanOrEqual(1)
      expect(typeof stats.conversionRate).toBe("number")
      expect(Array.isArray(stats.suspiciousActivities)).toBe(true)
    })

    it("detects suspicious high-velocity application spam spikes", () => {
      const now = Date.now()
      const spamCandidateEmail = "bot.script@spammer.org"

      const syntheticApplications: any[] = [
        {
          id: "app-sp-1",
          jobId: "job-1",
          email: spamCandidateEmail,
          status: "Applied",
          appliedAt: new Date(now - 1 * 60 * 1000).toISOString(),
        },
        {
          id: "app-sp-2",
          jobId: "job-2",
          email: spamCandidateEmail,
          status: "Applied",
          appliedAt: new Date(now - 3 * 60 * 1000).toISOString(),
        },
        {
          id: "app-sp-3",
          jobId: "job-3",
          email: spamCandidateEmail,
          status: "Applied",
          appliedAt: new Date(now - 6 * 60 * 1000).toISOString(),
        },
        {
          id: "app-sp-4",
          jobId: "job-4",
          email: spamCandidateEmail,
          status: "Applied",
          appliedAt: new Date(now - 8 * 60 * 1000).toISOString(),
        },
      ]

      const alerts = adminService.detectSuspiciousActivity(syntheticApplications)

      expect(alerts.length).toBeGreaterThanOrEqual(1)
      const spamAlert = alerts.find((a) => a.type === "spam_velocity")
      expect(spamAlert).toBeDefined()
      expect(spamAlert?.severity).toBe("high")
      expect(spamAlert?.targetId).toBe(spamCandidateEmail)
    })
  })
})
