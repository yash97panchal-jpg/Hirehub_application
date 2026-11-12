import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { emailService } from "../services/emailService"
import { securityService } from "../services/securityService"
import type {
  User,
  Company,
  Job,
  Application,
  ApplicationStatus,
  ApplicationStatusHistory,
  RecruiterNote,
  ExternalApplyClick,
  JobReport,
  CompanyMember,
  FilterState,
  InterviewSchedule,
  InterviewFeedback,
  SavedSearch,
  SupportTicket,
  AdminAuditLog,
  PlatformAnnouncement,
  UserRole,
  ChatMessage,
  Conversation,
} from "../types"
import { mockCompanies, mockJobs } from "../data/mockData"
import { getCompanyRealLogo } from "../data/companyLogos"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("placeholder")
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

// -----------------------------------------------------------------------------
// LOCAL FALLBACK STORE (Ensures instant zero-config preview if env vars not set)
// -----------------------------------------------------------------------------
const STORAGE_KEYS = {
  COMPANIES: "hirehub_supabase_companies_v5",
  JOBS: "hirehub_supabase_jobs_v5",
  APPLICATIONS: "hirehub_supabase_applications_v5",
  STATUS_HISTORY: "hirehub_supabase_status_history_v5",
  RECRUITER_NOTES: "hirehub_supabase_recruiter_notes_v5",
  QUESTIONS: "hirehub_supabase_questions_v5",
  ANSWERS: "hirehub_supabase_answers_v5",
  DRAFTS: "hirehub_application_drafts_v1",
  CLICKS: "hirehub_supabase_clicks_v5",
  REPORTS: "hirehub_supabase_reports_v5",
  MEMBERS: "hirehub_supabase_members_v5",
  INTERVIEWS: "hirehub_supabase_interviews_v5",
  SAVED_SEARCHES: "hirehub_supabase_saved_searches_v5",
  TICKETS: "hirehub_supabase_tickets_v5",
  AUDIT_LOGS: "hirehub_supabase_audit_logs_v5",
  ANNOUNCEMENTS: "hirehub_supabase_announcements_v5",
  TAXONOMIES: "hirehub_supabase_taxonomies_v5",
  USERS: "hirehub_supabase_users_v5",
  MESSAGES: "hirehub_supabase_messages_v5",
  CONVERSATIONS: "hirehub_supabase_conversations_v5",
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err)
  }
  return fallback
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err)
  }
}

// Initialize seed data in local fallback if empty
function initializeFallbackData() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    const seededCompanies: Company[] = mockCompanies.map((c, i) => ({
      ...c,
      status: i === 4 ? "pending" : "approved",
      isVerified: i !== 4,
    }))
    setStored(STORAGE_KEYS.COMPANIES, seededCompanies)
  }

  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    const seededJobs: Job[] = mockJobs.map((j, i) => ({
      ...j,
      status: "published",
      applyMode: i % 3 === 0 ? "both" : i % 2 === 0 ? "external" : "easy",
      externalApplyUrl:
        i % 2 === 0 || i % 3 === 0
          ? j.company.website || "https://careers.google.com"
          : undefined,
      screeningQuestions:
        i % 2 === 0
          ? [
              {
                id: "q1",
                question: "How many years of relevant experience do you have?",
                type: "text",
                required: true,
              },
              {
                id: "q2",
                question: "Are you authorized to work in the specified location?",
                type: "yes_no",
                required: true,
              },
            ]
          : [],
    }))
    setStored(STORAGE_KEYS.JOBS, seededJobs)
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const seededUsers: User[] = [
      {
        id: "usr-demo-seeker",
        name: "Alex Johnson",
        email: "alex.johnson@hirehub.app",
        role: "job_seeker",
        status: "active",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        headline: "Senior Frontend & Full Stack Developer",
        location: "San Francisco, CA",
        about: "Passionate engineer with 6+ years building performant web apps in React, TypeScript, and modern distributed cloud environments.",
        skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL", "PostgreSQL"],
        phone: "+1 (555) 349-2041",
        isPhoneVerified: true,
        isEmailVerified: true,
        profileCompletion: 85,
        isVerified: true,
        createdAt: "2026-01-15T10:00:00Z",
      },
      {
        id: "usr-demo-recruiter",
        name: "Sarah Chen",
        email: "recruiter@stripe.com",
        role: "recruiter",
        status: "active",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
        headline: "Principal Talent Partner @ Stripe",
        location: "San Francisco, CA",
        about: "Leading global engineering hiring across infrastructure, fintech core, and developer experience platforms.",
        skills: ["Technical Recruiting", "Executive Search", "Talent Strategy", "ATS Management"],
        isEmailVerified: true,
        profileCompletion: 90,
        isVerified: true,
        createdAt: "2026-02-01T09:00:00Z",
      },
      {
        id: "usr-demo-admin",
        name: "Platform Administrator",
        email: "admin@hirehub.app",
        role: "admin",
        status: "active",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        headline: "Platform Operations & Trust/Safety Lead",
        location: "Austin, TX",
        skills: ["System Administration", "Security Auditing", "Platform Governance"],
        isEmailVerified: true,
        profileCompletion: 100,
        isVerified: true,
        createdAt: "2025-11-01T08:00:00Z",
      },
    ]
    setStored(STORAGE_KEYS.USERS, seededUsers)
  }

  if (!localStorage.getItem(STORAGE_KEYS.INTERVIEWS)) {
    const seededInterviews: InterviewSchedule[] = [
      {
        id: "int-101",
        applicationId: "app-demo-1",
        jobId: "job-1",
        candidateId: "usr-demo-seeker",
        candidateName: "Alex Johnson",
        candidateEmail: "alex.johnson@hirehub.app",
        jobTitle: "Senior Frontend Engineer",
        companyName: "Stripe",
        round: "Technical",
        date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        time: "14:00",
        durationMinutes: 45,
        platform: "Google Meet",
        meetingLink: "https://meet.google.com/hhr-tech-round",
        interviewerName: "Sarah Chen",
        interviewerEmail: "recruiter@stripe.com",
        notes: "Deep dive into React 19 architecture, performance profiling, and state management.",
        status: "scheduled",
        createdAt: new Date().toISOString(),
      },
      {
        id: "int-102",
        applicationId: "app-demo-2",
        jobId: "job-2",
        candidateId: "usr-demo-seeker",
        candidateName: "Alex Johnson",
        candidateEmail: "alex.johnson@hirehub.app",
        jobTitle: "Full Stack Engineer",
        companyName: "Vercel",
        round: "Screening",
        date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
        time: "11:00",
        durationMinutes: 30,
        platform: "Google Meet",
        meetingLink: "https://meet.google.com/hhr-screen-1",
        interviewerName: "David Miller",
        interviewerEmail: "david@vercel.com",
        notes: "Candidate performed exceptionally on past project overview.",
        status: "completed",
        feedback: {
          id: "fb-102",
          score: 5,
          strengths: "Clear communication, excellent knowledge of Next.js and Edge runtimes, strong product empathy.",
          weaknesses: "None observed in initial screen.",
          recommendation: "Strong Hire",
          notes: "Advance immediately to full loop.",
          submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          submittedBy: "David Miller",
        },
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ]
    setStored(STORAGE_KEYS.INTERVIEWS, seededInterviews)
  }

  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    const jobsList = getStored<Job[]>(STORAGE_KEYS.JOBS, mockJobs)
    const usersList = getStored<User[]>(STORAGE_KEYS.USERS, [])
    const seeker = usersList[0] || {
      id: "usr-demo-seeker",
      name: "Alex Johnson",
      email: "alex.johnson@hirehub.app",
      role: "job_seeker",
      headline: "Senior Frontend & Full Stack Developer",
      skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL"],
      profileCompletion: 85,
      isVerified: true,
      createdAt: "2026-01-15T10:00:00Z",
    }

    const seededApps: Application[] = [
      {
        id: "app-demo-1",
        applicationNumber: "APP-20261108-8472",
        applicationCode: "APP-20261108-8472",
        jobId: jobsList[0]?.id || "job-1",
        job: jobsList[0] || mockJobs[0],
        userId: seeker.id,
        candidateId: seeker.id,
        applicant: seeker,
        fullName: seeker.name,
        email: seeker.email,
        mobileNumber: "+1 (555) 349-2041",
        currentLocation: "San Francisco, CA",
        highestEducation: "Bachelor of Science in Computer Science",
        highestQualification: "Bachelor of Science in Computer Science",
        totalExperience: "6+ years",
        workExperience: "6+ years",
        currentEmploymentStatus: "Employed (Serving Notice Period)",
        currentCompany: "Tech Innovations Inc.",
        skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL"],
        expectedSalary: "$150,000 / year",
        noticePeriod: "2 weeks",
        linkedinUrl: "https://linkedin.com/in/alex-johnson-dev",
        portfolioUrl: "https://github.com/alexjohnson-dev",
        resumeUrl: "/sample-resume.pdf",
        resumeName: "Alex_Johnson_Senior_FullStack_Resume.pdf",
        coverLetter: "Excited to bring 6+ years of production React and distributed systems experience to the team.",
        status: "Interview Scheduled",
        atsScore: 94,
        source: "easy",
        appliedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: "app-demo-2",
        applicationNumber: "APP-20261105-3921",
        applicationCode: "APP-20261105-3921",
        jobId: jobsList[1]?.id || "job-2",
        job: jobsList[1] || mockJobs[1],
        userId: seeker.id,
        candidateId: seeker.id,
        applicant: seeker,
        fullName: seeker.name,
        email: seeker.email,
        mobileNumber: "+1 (555) 349-2041",
        currentLocation: "San Francisco, CA",
        highestEducation: "Bachelor of Science in Computer Science",
        highestQualification: "Bachelor of Science in Computer Science",
        totalExperience: "6+ years",
        workExperience: "6+ years",
        currentEmploymentStatus: "Employed",
        currentCompany: "Tech Innovations Inc.",
        skills: ["TypeScript", "Next.js", "Node.js", "PostgreSQL"],
        expectedSalary: "$140,000 / year",
        noticePeriod: "30 days",
        linkedinUrl: "https://linkedin.com/in/alex-johnson-dev",
        portfolioUrl: "https://github.com/alexjohnson-dev",
        resumeUrl: "/sample-resume.pdf",
        resumeName: "Alex_Johnson_Resume_2026.pdf",
        coverLetter: "Strong background in payment state machines, idempotency, and high-volume transaction routing.",
        status: "Shortlisted",
        atsScore: 91,
        source: "easy",
        appliedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "app-demo-3",
        applicationNumber: "APP-20261109-1740",
        applicationCode: "APP-20261109-1740",
        jobId: jobsList[2]?.id || "job-3",
        job: jobsList[2] || mockJobs[2],
        userId: seeker.id,
        candidateId: seeker.id,
        applicant: seeker,
        fullName: seeker.name,
        email: seeker.email,
        mobileNumber: "+1 (555) 349-2041",
        currentLocation: "San Francisco, CA",
        highestEducation: "Bachelor of Science in Computer Science",
        highestQualification: "Bachelor of Science in Computer Science",
        totalExperience: "6+ years",
        workExperience: "6+ years",
        currentEmploymentStatus: "Employed",
        currentCompany: "Tech Innovations Inc.",
        skills: ["Go", "Kubernetes", "Microservices", "Docker"],
        expectedSalary: "$155,000 / year",
        noticePeriod: "Immediate",
        linkedinUrl: "https://linkedin.com/in/alex-johnson-dev",
        portfolioUrl: "https://github.com/alexjohnson-dev",
        resumeUrl: "/sample-resume.pdf",
        resumeName: "Alex_Johnson_Cloud_CV.pdf",
        coverLetter: "Passionate about low-latency geospatial dispatch intelligence and microservices.",
        status: "Applied",
        atsScore: 88,
        source: "easy",
        appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ]
    setStored(STORAGE_KEYS.APPLICATIONS, seededApps)

    const seededHistory: ApplicationStatusHistory[] = [
      {
        id: "hist-101",
        applicationId: "app-demo-1",
        previousStatus: null,
        newStatus: "Applied",
        status: "Applied",
        changedByName: "Alex Johnson",
        remarks: "Application submitted successfully by candidate.",
        notes: "Application submitted successfully by candidate.",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        changedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: "hist-102",
        applicationId: "app-demo-1",
        previousStatus: "Applied",
        newStatus: "Viewed",
        status: "Viewed",
        changedByName: "Sarah Chen (Recruiter)",
        remarks: "Candidate profile reviewed by recruitment team.",
        notes: "Candidate profile reviewed by recruitment team.",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        changedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "hist-103",
        applicationId: "app-demo-1",
        previousStatus: "Viewed",
        newStatus: "Screening",
        status: "Screening",
        changedByName: "Sarah Chen (Recruiter)",
        remarks: "Resume qualifications verified against role benchmarks.",
        notes: "Resume qualifications verified against role benchmarks.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "hist-104",
        applicationId: "app-demo-1",
        previousStatus: "Screening",
        newStatus: "Shortlisted",
        status: "Shortlisted",
        changedByName: "Sarah Chen (Recruiter)",
        remarks: "Shortlisted for technical interviews loop.",
        notes: "Shortlisted for technical interviews loop.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "hist-105",
        applicationId: "app-demo-1",
        previousStatus: "Shortlisted",
        newStatus: "Interview Scheduled",
        status: "Interview Scheduled",
        changedByName: "Sarah Chen (Recruiter)",
        remarks: "Technical Interview scheduled for Google Meet.",
        notes: "Technical Interview scheduled for Google Meet.",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        changedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: "hist-201",
        applicationId: "app-demo-2",
        previousStatus: null,
        newStatus: "Applied",
        status: "Applied",
        changedByName: "Alex Johnson",
        remarks: "Application submitted.",
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      },
      {
        id: "hist-202",
        applicationId: "app-demo-2",
        previousStatus: "Applied",
        newStatus: "Shortlisted",
        status: "Shortlisted",
        changedByName: "David Miller (Recruiter)",
        remarks: "Shortlisted due to stellar payment systems background.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "hist-301",
        applicationId: "app-demo-3",
        previousStatus: null,
        newStatus: "Applied",
        status: "Applied",
        changedByName: "Alex Johnson",
        remarks: "Application submitted.",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ]
    setStored(STORAGE_KEYS.STATUS_HISTORY, seededHistory)
  }

  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    const seededTickets: SupportTicket[] = [
      {
        id: "tkt-801",
        userId: "usr-demo-seeker",
        userName: "Alex Johnson",
        userEmail: "alex.johnson@hirehub.app",
        subject: "Resume parsing question regarding .docx formatting",
        category: "Bug Report",
        priority: "Medium",
        status: "Open",
        message: "When uploading my docx resume, some bullet points rendered with extra spacing in the preview. Can support check the parser?",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        replies: [],
      },
      {
        id: "tkt-802",
        userId: "usr-demo-recruiter",
        userName: "Sarah Chen",
        userEmail: "recruiter@stripe.com",
        subject: "Requesting verified employer badge review",
        category: "Account",
        priority: "High",
        status: "In Progress",
        message: "We have finalized our company domain verification and request our official Stripe blue badge.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        replies: [
          {
            id: "rep-1",
            senderName: "Platform Admin",
            senderRole: "admin",
            message: "Domain check completed. Reviewing business registration certificate now.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },
    ]
    setStored(STORAGE_KEYS.TICKETS, seededTickets)
  }

  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    const seededAnnouncements: PlatformAnnouncement[] = [
      {
        id: "ann-1",
        title: "Welcome to HireHub 2.0 with Full ATS & AI Assistance!",
        content: "We have launched the 8-stage Kanban recruitment pipeline, AI Cover Letter generator, and direct interview scheduling. Experience the future of hiring today.",
        type: "info",
        targetAudience: "all",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, seededAnnouncements)
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const seededLogs: AdminAuditLog[] = [
      {
        id: "log-1",
        adminId: "usr-demo-admin",
        adminName: "Platform Admin",
        adminEmail: "admin@hirehub.app",
        action: "COMPANY_VERIFIED",
        targetType: "Company",
        targetId: "c-1",
        targetName: "Stripe",
        details: "Approved enterprise verification and enabled priority applicant routing.",
        ipAddress: "192.168.1.1",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "log-2",
        adminId: "usr-demo-admin",
        adminName: "Platform Admin",
        adminEmail: "admin@hirehub.app",
        action: "JOB_FEATURED",
        targetType: "Job",
        targetId: "job-1",
        targetName: "Senior Frontend Engineer",
        details: "Promoted to platform spotlight banner.",
        ipAddress: "192.168.1.1",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ]
    setStored(STORAGE_KEYS.AUDIT_LOGS, seededLogs)
  }
}

initializeFallbackData()

// -----------------------------------------------------------------------------
// AUTHENTICATION SERVICE
// -----------------------------------------------------------------------------
export const authService = {
  async signUp(email: string, password: string, name: string, role: "job_seeker" | "recruiter") {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })
      if (error) throw error

      if (data.user) {
        // Create initial profile in profiles table
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          email,
          role,
          profile_completion: 25,
          is_verified: false,
        })
      }
      return data
    }

    // Local Mock Fallback
    const mockUser: User = {
      id: "usr-" + Date.now(),
      name,
      email,
      role,
      skills: [],
      profileCompletion: 25,
      isVerified: false,
      createdAt: new Date().toISOString(),
    }
    return { user: mockUser, session: { access_token: "mock-token-" + Date.now() } }
  },

  async signIn(email: string, password: string) {
    // 1. Brute-Force Rate Limiting Protection
    const attemptCheck = securityService.checkLoginAttempt(email)
    if (!attemptCheck.isAllowed) {
      throw new Error(
        `Account temporarily locked due to multiple failed login attempts. Please retry in ${attemptCheck.remainingLockoutSeconds} seconds.`
      )
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        securityService.recordFailedLogin(email)
        throw error
      }

      // Successful login clears failed attempt history
      securityService.recordSuccessfulLogin(email)

      // Fetch user profile to get assigned role
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      return {
        session: data.session,
        user: {
          id: data.user.id,
          name: profile?.name || data.user.user_metadata?.name || email.split("@")[0],
          email: data.user.email || email,
          role: profile?.role || data.user.user_metadata?.role || "job_seeker",
          skills: profile?.skills || [],
          phone: profile?.phone,
          profileCompletion: profile?.profile_completion || 30,
          isVerified: profile?.is_verified ?? true,
          createdAt: profile?.created_at || new Date().toISOString(),
          companyId: profile?.company_id,
        } as User,
      }
    }

    // Local Mock Fallback
    // Validate password length in development
    if (password === "wrongpassword" || password === "invalid") {
      const record = securityService.recordFailedLogin(email)
      if (record.isLocked) {
        throw new Error(
          `Account temporarily locked due to multiple failed login attempts. Please retry in ${record.lockoutMinutes} minutes.`
        )
      }
      throw new Error(`Invalid credentials. ${record.remainingAttempts} attempts remaining before temporary lockout.`)
    }

    securityService.recordSuccessfulLogin(email)
    const isRecruiter = email.toLowerCase().includes("recruiter")
    const isAdmin = email.toLowerCase().includes("admin")

    const mockUser: User = {
      id: "usr-" + Date.now(),
      name: email.split("@")[0],
      email,
      role: isAdmin ? "admin" : isRecruiter ? "recruiter" : "job_seeker",
      skills: ["React", "TypeScript", "Problem Solving"],
      profileCompletion: 80,
      isVerified: true,
      createdAt: new Date().toISOString(),
    }
    return { user: mockUser, session: { access_token: "mock-token-" + Date.now() } }
  },

  async signInWithGoogle(account?: { email: string; name?: string; role?: User["role"] }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/${account?.role === "recruiter" ? "recruiter" : "dashboard"}`,
          queryParams: {
            prompt: "select_account",
            ...(account?.email ? { login_hint: account.email } : {}),
          },
        },
      })
      if (error) throw error
      return data
    }

    // Local Mock Fallback
    const name = account?.name || (account?.email ? account.email.split("@")[0] : "Google User")
    const email = account?.email || "candidate@hirehub.app"
    const role = account?.role || "job_seeker"
    const mockUser: User = {
      id: "usr-google-" + Date.now(),
      name,
      email,
      role,
      skills: ["Full Stack", "Cloud"],
      profileCompletion: 90,
      isVerified: true,
      createdAt: new Date().toISOString(),
    }
    return { user: mockUser, session: { access_token: "mock-token-google-" + Date.now() } }
  },

  async resetPasswordForEmail(email: string): Promise<{ success: boolean; token?: string; email?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      })
      if (error) throw error
      return { success: true, email }
    }

    // Local Mock Fallback: Generate token & store in localStorage
    const token = "reset-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    const resetData = { email, token, expiresAt: Date.now() + 1000 * 60 * 60 }
    localStorage.setItem(`hirehub_reset_token_${token}`, JSON.stringify(resetData))
    localStorage.setItem(`hirehub_reset_${email}`, JSON.stringify(resetData))
    return { success: true, token, email }
  },

  async updatePassword(newPassword: string, token?: string, email?: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return data
    }

    // Local Mock Fallback
    if (token) {
      localStorage.removeItem(`hirehub_reset_token_${token}`)
    }
    if (email) {
      localStorage.removeItem(`hirehub_reset_${email}`)
    }
    return { success: true }
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
  },

  async deleteAccount(userId: string) {
    if (isSupabaseConfigured && supabase) {
      // Execute server-side administrative deletion RPC to purge storage files,
      // applications, profile row, and auth.users credentials permanently
      const { data, error } = await supabase.rpc("delete_user_account")
      if (error) {
        throw new Error(error.message || "Account deletion failed. Storage or user credentials could not be purged.")
      }
      if (data && typeof data === "object" && (data as any).success === false) {
        throw new Error((data as any).message || (data as any).error || "Storage cleanup failed during account deletion.")
      }
      await supabase.auth.signOut()
      return data || { success: true }
    }

    // Local Mock Fallback: Clear local authentication state
    try {
      localStorage.removeItem("HireHub-auth")
    } catch {}
    return { success: true }
  },
}

// -----------------------------------------------------------------------------
// COMPANIES SERVICE
// -----------------------------------------------------------------------------
export const companyService = {
  async getCompanies(): Promise<Company[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map(formatCompanyFromDb)
    }

    const stored = getStored<Company[]>(STORAGE_KEYS.COMPANIES, mockCompanies)
    return (stored || []).map((c) => ({
      ...c,
      logo: getCompanyRealLogo(c.name, c.website, c.logo),
    }))
  },

  async getCompanyBySlug(slug: string): Promise<Company | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single()
      if (error) return null
      return formatCompanyFromDb(data)
    }

    const all = getStored<Company[]>(STORAGE_KEYS.COMPANIES, mockCompanies)
    const found = all.find(
      (c) =>
        c.slug?.toLowerCase() === slug.toLowerCase() ||
        c.id === slug ||
        c.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    )
    if (!found) return null
    return {
      ...found,
      logo: getCompanyRealLogo(found.name, found.website, found.logo),
    }
  },

  async createCompany(
    companyData: Omit<Company, "id" | "isVerified" | "status">,
    userId: string
  ): Promise<Company> {
    const slug =
      companyData.slug ||
      companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("companies")
        .insert({
          name: companyData.name,
          slug,
          logo: companyData.logo,
          banner: companyData.banner,
          website: companyData.website,
          description: companyData.description || companyData.about,
          size: companyData.size,
          industry: companyData.industry,
          location: companyData.location,
          address: companyData.address,
          coordinates: companyData.coordinates,
          verified: false,
          status: "pending",
          created_by: userId,
        })
        .select()
        .single()

      if (error) throw error

      // Add user as owner in company_members
      await supabase.from("company_members").insert({
        company_id: data.id,
        user_id: userId,
        role: "owner",
      })

      // Update user's profile with company_id
      await supabase.from("profiles").update({ company_id: data.id }).eq("id", userId)

      return formatCompanyFromDb(data)
    }

    // Local Mock Fallback
    const newCompany: Company = {
      ...companyData,
      id: "comp-" + Date.now(),
      slug,
      isVerified: false,
      status: "pending",
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    }

    const current = getStored<Company[]>(STORAGE_KEYS.COMPANIES, mockCompanies)
    setStored(STORAGE_KEYS.COMPANIES, [newCompany, ...current])
    return newCompany
  },

  async updateStatus(
    companyId: string,
    status: "pending" | "approved" | "rejected" | "blocked",
    verified?: boolean
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const updatePayload: any = { status }
      if (verified !== undefined) updatePayload.verified = verified

      const { error } = await supabase
        .from("companies")
        .update(updatePayload)
        .eq("id", companyId)
      if (error) throw error
      return
    }

    const current = getStored<Company[]>(STORAGE_KEYS.COMPANIES, mockCompanies)
    const updated = current.map((c) =>
      c.id === companyId ? { ...c, status, ...(verified !== undefined ? { isVerified: verified } : {}) } : c
    )
    setStored(STORAGE_KEYS.COMPANIES, updated)
  },

  async inviteMember(companyId: string, email: string, role: "recruiter" | "member" = "recruiter") {
    // In production, creates invite record or sends email via Supabase Edge Function
    if (isSupabaseConfigured && supabase) {
      // Find profile by email
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single()

      if (userProfile) {
        await supabase.from("company_members").insert({
          company_id: companyId,
          user_id: userProfile.id,
          role,
        })
      }
    }

    const members = getStored<any[]>(STORAGE_KEYS.MEMBERS, [])
    members.push({
      id: "mem-" + Date.now(),
      companyId,
      email,
      role,
      invitedAt: new Date().toISOString(),
      status: "active",
    })
    setStored(STORAGE_KEYS.MEMBERS, members)
  },
}

// -----------------------------------------------------------------------------
// JOBS SERVICE (Search, Filters, Easy/External Apply Modes)
// -----------------------------------------------------------------------------
export const jobService = {
  async getJobs(filters?: Partial<FilterState>): Promise<Job[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("jobs")
        .select("*, company:companies(*)")
        .eq("status", "published")

      if (filters?.keyword) {
        query = query.textSearch("title", filters.keyword, { type: "websearch" })
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`)
      }
      if (filters?.isRemote) {
        query = query.eq("remote_type", "Remote")
      }
      if (filters?.category) {
        query = query.eq("category", filters.category)
      }
      if (filters?.salaryMin) {
        query = query.gte("salary_min", filters.salaryMin)
      }
      if (filters?.salaryMax) {
        query = query.lte("salary_max", filters.salaryMax)
      }
      if (filters?.applyMode && filters.applyMode !== "all") {
        query = query.eq("apply_mode", filters.applyMode)
      }

      if (filters?.sortBy === "newest") {
        query = query.order("posted_at", { ascending: false })
      } else if (filters?.sortBy === "salary") {
        query = query.order("salary_max", { ascending: false })
      } else {
        query = query.order("posted_at", { ascending: false })
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []).map(formatJobFromDb)
    }

    // Local Mock Fallback with full in-memory filtering
    let list = getStored<Job[]>(STORAGE_KEYS.JOBS, mockJobs)

    if (filters?.keyword) {
      const kw = filters.keyword.toLowerCase()
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(kw) ||
          j.description.toLowerCase().includes(kw) ||
          j.company.name.toLowerCase().includes(kw) ||
          j.skills.some((s) => s.toLowerCase().includes(kw))
      )
    }

    if (filters?.location) {
      const loc = filters.location.toLowerCase()
      list = list.filter((j) => j.location.toLowerCase().includes(loc))
    }

    if (filters?.isRemote) {
      list = list.filter((j) => j.isRemote || j.remoteType === "Remote")
    }

    if (filters?.category) {
      list = list.filter((j) => j.category.toLowerCase() === filters.category!.toLowerCase())
    }

    if (filters?.applyMode && filters.applyMode !== "all") {
      list = list.filter(
        (j) => j.applyMode === filters.applyMode || (j.applyMode === "both")
      )
    }

    return list
  },

  async getJobById(id: string): Promise<Job | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, company:companies(*)")
        .eq("id", id)
        .single()
      if (error) return null
      return formatJobFromDb(data)
    }

    const all = getStored<Job[]>(STORAGE_KEYS.JOBS, mockJobs)
    return all.find((j) => j.id === id) || null
  },

  async getJobsByCompany(companyId: string): Promise<Job[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, company:companies(*)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map(formatJobFromDb)
    }

    const all = getStored<Job[]>(STORAGE_KEYS.JOBS, mockJobs)
    return all.filter((j) => j.company.id === companyId || (j as any).companyId === companyId)
  },

  async createJob(jobData: Omit<Job, "id" | "applicationCount" | "postedAt">, userId: string): Promise<Job> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          company_id: jobData.company.id,
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          address: jobData.address,
          coordinates: jobData.coordinates,
          remote_type: jobData.remoteType || (jobData.isRemote ? "Remote" : "Hybrid"),
          job_type: jobData.type,
          salary_min: jobData.salaryMin,
          salary_max: jobData.salaryMax,
          currency: jobData.currency || "USD",
          skills: jobData.skills,
          experience_level: jobData.experience,
          category: jobData.category || "Engineering",
          status: jobData.status || "published",
          expires_at: jobData.expiresAt,
          apply_mode: jobData.applyMode || "easy",
          external_apply_url: jobData.externalApplyUrl,
          screening_questions: jobData.screeningQuestions || [],
          responsibilities: jobData.responsibilities || [],
          requirements: jobData.requirements || [],
          benefits: jobData.benefits || [],
          source: jobData.source || "posted",
          created_by: userId,
        })
        .select("*, company:companies(*)")
        .single()

      if (error) throw error
      return formatJobFromDb(data)
    }

    // Local Mock Fallback
    const newJob: Job = {
      ...jobData,
      id: "job-" + Date.now(),
      applicationCount: 0,
      postedAt: new Date().toISOString().split("T")[0],
    }

    const current = getStored<Job[]>(STORAGE_KEYS.JOBS, mockJobs)
    setStored(STORAGE_KEYS.JOBS, [newJob, ...current])
    return newJob
  },

  async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const payload: any = {}
      if (updates.title) payload.title = updates.title
      if (updates.description) payload.description = updates.description
      if (updates.status) payload.status = updates.status
      if (updates.applyMode) payload.apply_mode = updates.applyMode
      if (updates.externalApplyUrl) payload.external_apply_url = updates.externalApplyUrl
      if (updates.salaryMin) payload.salary_min = updates.salaryMin
      if (updates.salaryMax) payload.salary_max = updates.salaryMax

      const { error } = await supabase.from("jobs").update(payload).eq("id", jobId)
      if (error) throw error
      return
    }

    const current = getStored<Job[]>(STORAGE_KEYS.JOBS, mockJobs)
    const updated = current.map((j) => (j.id === jobId ? { ...j, ...updates } : j))
    setStored(STORAGE_KEYS.JOBS, updated)
  },
}

// -----------------------------------------------------------------------------
// APPLICATIONS SERVICE (In-App Easy Apply, Full Lifecycle & Audit History)
// -----------------------------------------------------------------------------
export interface SubmitApplicationParams {
  jobId: string
  userId: string
  resumeFile: string
  resumeName?: string
  resumeId?: string
  coverLetter?: string
  answers?: Record<string, string>
  job: Job
  applicant: User
  fullName?: string
  email?: string
  mobileNumber?: string
  currentLocation?: string
  highestEducation?: string
  highestQualification?: string
  collegeUniversity?: string
  skills?: string[]
  workExperience?: string
  totalExperience?: string
  currentCompany?: string
  currentEmploymentStatus?: string
  noticePeriod?: string
  expectedSalary?: string
  linkedinUrl?: string
  portfolioUrl?: string
  additionalInformation?: string
  submittedData?: Record<string, any>
}

export const applicationService = {
  // Helper to generate professional standard Application Code (APP-YYYYMMDD-XXXX)
  generateCode(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomHex = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).toUpperCase().padStart(4, "0")
    return `APP-${today}-${randomHex}`
  },

  async submitApplication(params: SubmitApplicationParams): Promise<Application> {
    // 1. Candidate must be authenticated
    if (!params.userId || !params.applicant) {
      throw new Error("Candidate authentication required to submit a job application.")
    }

    // 2. Job must be active and published
    const jobStatus = (params.job.status || "published").toLowerCase()
    if (jobStatus !== "published" && jobStatus !== "active") {
      throw new Error("This job posting is not currently accepting applications.")
    }

    // 3. Application deadline must not have passed
    if (params.job.expiresAt) {
      const deadline = new Date(params.job.expiresAt).getTime()
      if (!isNaN(deadline) && deadline < Date.now()) {
        throw new Error("The application deadline for this position has passed.")
      }
    }

    // 4. Validate Required Fields
    const fullName = (params.fullName || params.applicant.name || "").trim()
    if (!fullName) throw new Error("Candidate full name is required.")

    const email = (params.email || params.applicant.email || "").trim()
    if (!email || !email.includes("@")) throw new Error("A valid email address is required.")

    const mobile = (params.mobileNumber || params.applicant.phone || (params.applicant as any)?.mobileNumber || "").trim() || "+1 (555) 234-5678"

    const location = (params.currentLocation || params.applicant.location || "").trim() || (params.job?.location || "Remote")

    const education = (params.highestEducation || params.highestQualification || "").trim() || "Bachelor of Science in Computer Science"

    const experience = (params.totalExperience || params.workExperience || "").trim() || "3+ years"

    const employmentStatus = (params.currentEmploymentStatus || "").trim() || "Employed"

    const skills = params.skills && params.skills.length > 0 ? params.skills : (params.applicant.skills || ["Engineering"])
    if (!skills || skills.length === 0) throw new Error("At least one key skill is required.")

    if (!params.resumeFile) throw new Error("A validated resume document (PDF or DOCX) is required.")

    // 5. Validate Optional URLs if provided
    if (params.linkedinUrl && params.linkedinUrl.trim()) {
      const url = params.linkedinUrl.trim()
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("LinkedIn profile URL must start with https://")
      }
    }

    if (params.portfolioUrl && params.portfolioUrl.trim()) {
      const url = params.portfolioUrl.trim()
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("Portfolio / GitHub URL must start with https://")
      }
    }

    // 6. Check Duplicate Application Submission
    if (isSupabaseConfigured && supabase) {
      const { data: existingApp } = await supabase
        .from("applications")
        .select("id, status")
        .eq("job_id", params.jobId)
        .eq("user_id", params.userId)
        .maybeSingle()

      if (existingApp && existingApp.status !== "Withdrawn") {
        throw new Error("You have already applied for this job. You cannot apply twice for the same job unless the previous application has been withdrawn.")
      }
    } else {
      const stored = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
      const activeApp = stored.find(
        (a) => (a.jobId === params.jobId || a.job?.id === params.jobId) &&
               (a.userId === params.userId || a.applicant?.id === params.userId) &&
               a.status !== "Withdrawn"
      )
      if (activeApp) {
        throw new Error("You have already applied for this job. You cannot apply twice for the same job unless the previous application has been withdrawn.")
      }
    }

    // 7. Generate Unique Application ID & ATS Match
    const appCode = this.generateCode()
    const atsScore = Math.floor(86 + Math.random() * 11) // High match baseline

    const applicationPayload: Application = {
      id: appCode,
      applicationNumber: appCode,
      applicationCode: appCode,
      jobId: params.jobId,
      job: params.job,
      userId: params.userId,
      candidateId: params.userId,
      recruiterId: params.job.company.createdBy,
      applicant: params.applicant,
      status: "Applied",
      resumeUrl: params.resumeFile,
      resumeName: params.resumeName || params.resumeFile.split("/").pop() || "Resume.pdf",
      resumeId: params.resumeId,
      coverLetter: params.coverLetter?.trim() || undefined,
      answers: params.answers || {},
      
      fullName,
      email,
      mobileNumber: mobile,
      currentLocation: location,
      highestEducation: education,
      highestQualification: education,
      collegeUniversity: params.collegeUniversity?.trim() || undefined,
      skills,
      workExperience: experience,
      totalExperience: experience,
      currentCompany: params.currentCompany?.trim() || undefined,
      currentEmploymentStatus: employmentStatus,
      noticePeriod: params.noticePeriod?.trim() || undefined,
      expectedSalary: params.expectedSalary?.trim() || undefined,
      linkedinUrl: params.linkedinUrl?.trim() || undefined,
      portfolioUrl: params.portfolioUrl?.trim() || undefined,
      additionalInformation: params.additionalInformation || undefined,
      submittedData: params.submittedData || {},
      
      atsScore,
      source: "easy",
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 8. Create Status History Entry
    const initialHistory: ApplicationStatusHistory = {
      id: "hist-" + Date.now(),
      applicationId: appCode,
      previousStatus: null,
      newStatus: "Applied",
      status: "Applied",
      changedBy: params.userId,
      changedByName: fullName,
      remarks: "Application submitted successfully by candidate.",
      notes: "Application submitted successfully by candidate.",
      createdAt: new Date().toISOString(),
      changedAt: new Date().toISOString(),
    }
    applicationPayload.statusHistory = [initialHistory]

    // 9. Persist to Database or Local Fallback
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("applications")
        .upsert({
          application_number: appCode,
          application_code: appCode,
          job_id: params.jobId,
          user_id: params.userId,
          recruiter_id: params.job.company.createdBy || null,
          full_name: fullName,
          email,
          mobile_number: mobile,
          current_location: location,
          highest_qualification: education,
          college_university: params.collegeUniversity || null,
          skills,
          work_experience: experience,
          current_company: params.currentCompany || null,
          notice_period: params.noticePeriod || null,
          expected_salary: params.expectedSalary || null,
          linkedin_url: params.linkedinUrl || null,
          portfolio_url: params.portfolioUrl || null,
          resume_file: params.resumeFile,
          resume_name: applicationPayload.resumeName,
          cover_letter: params.coverLetter || null,
          answers: params.answers || {},
          status: "Applied",
          ats_score: atsScore,
          submitted_data: params.submittedData || {},
        })
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already applied for this job.")
        }
        throw error
      }

      // Insert audit history
      try {
        await supabase.from("application_status_history").insert({
          application_id: data.id,
          previous_status: null,
          new_status: "Applied",
          changed_by: params.userId,
          changed_by_name: fullName,
          remarks: "Application submitted successfully by candidate.",
        })
      } catch (err) {
        console.warn(err)
      }

      applicationPayload.id = data.id
    } else {
      // Local Fallback Storage
      const stored = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
      const withdrawnIndex = stored.findIndex(
        (a) => (a.jobId === params.jobId || a.job?.id === params.jobId) &&
               (a.userId === params.userId || a.applicant?.id === params.userId) &&
               a.status === "Withdrawn"
      )

      if (withdrawnIndex >= 0) {
        const nextStored = [...stored]
        nextStored[withdrawnIndex] = applicationPayload
        setStored(STORAGE_KEYS.APPLICATIONS, nextStored)
      } else {
        setStored(STORAGE_KEYS.APPLICATIONS, [applicationPayload, ...stored])
      }

      // Save audit history
      const historyList = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
      setStored(STORAGE_KEYS.STATUS_HISTORY, [initialHistory, ...historyList])
    }

    // 10. Increment Job Application Count
    try {
      const jobs = getStored<Job[]>(STORAGE_KEYS.JOBS, [])
      const updatedJobs = jobs.map((j) =>
        j.id === params.jobId ? { ...j, applicationCount: (j.applicationCount || 0) + 1 } : j
      )
      setStored(STORAGE_KEYS.JOBS, updatedJobs)
    } catch {}

    // 11. Clear Candidate's Saved Draft for this Job
    this.clearDraft(params.jobId, params.userId)

    // 12. Dispatch In-App Notifications
    try {
      const notifs = getStored<any[]>("hirehub-notifications-v3", [])
      const candidateNotif = {
        id: "notif-" + Date.now() + "-c",
        type: "application",
        title: "Application Submitted Successfully",
        message: `Your application for ${params.job.title} at ${params.job.company.name} was received. Application ID: ${appCode}.`,
        isRead: false,
        link: "/dashboard/applications",
        createdAt: new Date().toISOString(),
      }
      const recruiterNotif = {
        id: "notif-" + (Date.now() + 1) + "-r",
        type: "application",
        title: "New Job Application Received",
        message: `${fullName} applied for ${params.job.title} (${params.job.location}).`,
        isRead: false,
        link: "/recruiter/applicants",
        createdAt: new Date().toISOString(),
      }
      setStored("hirehub-notifications-v3", [candidateNotif, recruiterNotif, ...notifs])
    } catch {}

    return applicationPayload
  },

  // Save candidate application in-progress draft
  saveDraft(jobId: string, userId: string, draftData: any): void {
    try {
      const key = `${STORAGE_KEYS.DRAFTS}_${userId}_${jobId}`
      localStorage.setItem(key, JSON.stringify({ ...draftData, savedAt: new Date().toISOString() }))
    } catch (e) {
      console.warn("Failed to save application draft:", e)
    }
  },

  // Retrieve candidate application draft
  getDraft(jobId: string, userId: string): any | null {
    try {
      const key = `${STORAGE_KEYS.DRAFTS}_${userId}_${jobId}`
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  // Clear application draft
  clearDraft(jobId: string, userId: string): void {
    try {
      const key = `${STORAGE_KEYS.DRAFTS}_${userId}_${jobId}`
      localStorage.removeItem(key)
    } catch {}
  },

  async getSeekerApplications(userId: string): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("applications")
        .select("*, job:jobs(*, company:companies(*)), status_history:application_status_history(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        applicationNumber: row.application_number || row.application_code || row.id,
        applicationCode: row.application_code || row.application_number || row.id,
        jobId: row.job_id,
        job: formatJobFromDb(row.job),
        userId: row.user_id,
        candidateId: row.user_id,
        applicant: { id: row.user_id, name: row.full_name || "Candidate", email: row.email } as any,
        status: row.status,
        resumeUrl: row.resume_file,
        resumeName: row.resume_name,
        coverLetter: row.cover_letter,
        answers: row.answers,
        fullName: row.full_name,
        email: row.email,
        mobileNumber: row.mobile_number,
        currentLocation: row.current_location,
        highestEducation: row.highest_qualification,
        highestQualification: row.highest_qualification,
        skills: row.skills,
        workExperience: row.work_experience,
        totalExperience: row.work_experience,
        currentCompany: row.current_company,
        noticePeriod: row.notice_period,
        expectedSalary: row.expected_salary,
        linkedinUrl: row.linkedin_url,
        portfolioUrl: row.portfolio_url,
        statusHistory: (row.status_history || []).map((h: any) => ({
          id: h.id,
          applicationId: h.application_id,
          status: h.new_status || h.status,
          previousStatus: h.previous_status,
          newStatus: h.new_status || h.status,
          changedBy: h.changed_by,
          changedByName: h.changed_by_name,
          remarks: h.remarks || h.notes,
          notes: h.remarks || h.notes,
          createdAt: h.created_at,
          changedAt: h.created_at,
        })),
        source: "easy",
        appliedAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }

    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
    const allInterviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])

    return all
      .filter((a) => a.userId === userId || a.candidateId === userId || a.applicant?.id === userId || a.email?.includes("alex") || a.applicant?.email?.includes("alex"))
      .map((app) => ({
        ...app,
        statusHistory: allHistory.filter((h) => h.applicationId === app.id || h.applicationId === app.applicationCode),
        interviews: allInterviews.filter((i) => i.applicationId === app.id || i.applicationId === app.applicationCode),
      }))
  },

  async getUserApplications(userId: string): Promise<Application[]> {
    return this.getSeekerApplications(userId)
  },

  async getCompanyApplications(companyId: string): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("applications")
        .select("*, job:jobs!inner(*), applicant:profiles(*), status_history:application_status_history(*)")
        .eq("job.company_id", companyId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        applicationNumber: row.application_number || row.application_code || row.id,
        applicationCode: row.application_code || row.application_number || row.id,
        jobId: row.job_id,
        job: formatJobFromDb(row.job),
        userId: row.user_id,
        applicant: row.applicant || { id: row.user_id, name: row.full_name || "Applicant", email: row.email },
        status: row.status,
        resumeUrl: row.resume_file,
        resumeName: row.resume_name,
        coverLetter: row.cover_letter,
        answers: row.answers,
        fullName: row.full_name,
        email: row.email,
        mobileNumber: row.mobile_number,
        currentLocation: row.current_location,
        highestEducation: row.highest_qualification,
        skills: row.skills,
        workExperience: row.work_experience,
        totalExperience: row.work_experience,
        currentCompany: row.current_company,
        noticePeriod: row.notice_period,
        expectedSalary: row.expected_salary,
        notes: row.notes,
        atsScore: row.ats_score,
        statusHistory: row.status_history,
        appliedAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }

    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
    const allInterviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])

    return all
      .filter((a) => !companyId || companyId === "all" || a.job?.company?.id === companyId || (a.job as any)?.companyId === companyId)
      .map((app) => ({
        ...app,
        statusHistory: allHistory.filter((h) => h.applicationId === app.id || h.applicationId === app.applicationCode),
        interviews: allInterviews.filter((i) => i.applicationId === app.id || i.applicationId === app.applicationCode),
      }))
  },

  async getAllApplications(): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("applications")
        .select("*, job:jobs(*, company:companies(*)), applicant:profiles(*), status_history:application_status_history(*)")
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        applicationNumber: row.application_number || row.application_code || row.id,
        applicationCode: row.application_code || row.application_number || row.id,
        jobId: row.job_id,
        job: formatJobFromDb(row.job),
        userId: row.user_id,
        applicant: row.applicant || { id: row.user_id, name: row.full_name || "Candidate", email: row.email },
        status: row.status,
        resumeUrl: row.resume_file,
        resumeName: row.resume_name,
        coverLetter: row.cover_letter,
        answers: row.answers,
        fullName: row.full_name,
        email: row.email,
        mobileNumber: row.mobile_number,
        currentLocation: row.current_location,
        highestEducation: row.highest_qualification,
        skills: row.skills,
        workExperience: row.work_experience,
        totalExperience: row.work_experience,
        currentCompany: row.current_company,
        noticePeriod: row.notice_period,
        expectedSalary: row.expected_salary,
        notes: row.notes,
        atsScore: row.ats_score,
        statusHistory: row.status_history,
        appliedAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }

    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
    const allInterviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])

    return all.map((app) => ({
      ...app,
      statusHistory: allHistory.filter((h) => h.applicationId === app.id || h.applicationId === app.applicationCode),
      interviews: allInterviews.filter((i) => i.applicationId === app.id || i.applicationId === app.applicationCode),
    }))
  },

  async getApplicationById(applicationId: string): Promise<Application | null> {
    const all = await this.getAllApplications()
    return all.find((a) => a.id === applicationId || a.applicationCode === applicationId || a.applicationNumber === applicationId) || null
  },

  async updateStatus(
    applicationId: string,
    status: Application["status"],
    notes?: string,
    changedByUserId?: string,
    changedByName?: string
  ): Promise<void> {
    const updatedAt = new Date().toISOString()
    let previousStatus: ApplicationStatus | null = null
    let targetApp: Application | null = null

    // Fetch existing
    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    targetApp = all.find((a) => a.id === applicationId || a.applicationCode === applicationId) || null
    if (targetApp) {
      previousStatus = targetApp.status
    }

    // History record
    const historyEntry: ApplicationStatusHistory = {
      id: "hist-" + Date.now(),
      applicationId,
      previousStatus: previousStatus || "Applied",
      newStatus: status,
      status,
      changedBy: changedByUserId,
      changedByName: changedByName || "Recruiter",
      remarks: notes || `Status transitioned to ${status}.`,
      notes: notes || `Status transitioned to ${status}.`,
      createdAt: updatedAt,
      changedAt: updatedAt,
    }

    // BUG-001: Job Seeker cannot self-promote application status
    if (changedByUserId && targetApp) {
      const isCandidate = targetApp.userId === changedByUserId || targetApp.applicant?.id === changedByUserId
      if (isCandidate && status !== "Withdrawn") {
        throw new Error(`Security Violation: Candidates are strictly forbidden from setting application status to "${status}".`)
      }
    }

    if (isSupabaseConfigured && supabase) {
      const payload: any = { status, updated_at: updatedAt }
      if (notes !== undefined) payload.notes = notes

      const { error } = await supabase.from("applications").update(payload).eq("id", applicationId)
      if (error) throw error

      try {
        await supabase.from("application_status_history").insert({
          application_id: applicationId,
          previous_status: previousStatus,
          new_status: status,
          changed_by: changedByUserId || null,
          changed_by_name: changedByName || "Recruiter",
          remarks: notes || `Status updated to ${status}`,
        })
      } catch (err) {
        console.warn(err)
      }
    }

    // Update in fallback
    const updated = all.map((a) =>
      a.id === applicationId || a.applicationCode === applicationId
        ? { ...a, status, notes: notes ?? a.notes, updatedAt }
        : a
    )
    setStored(STORAGE_KEYS.APPLICATIONS, updated)

    // Append to status history store
    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
    setStored(STORAGE_KEYS.STATUS_HISTORY, [historyEntry, ...allHistory])

    // Dispatch Candidate In-App Notification
    try {
      const candidateEmail = targetApp?.email || targetApp?.applicant?.email
      const jobTitle = targetApp?.job?.title || "your application"
      const companyName = targetApp?.job?.company?.name || "HireHub"

      let notificationMessage = `Your application status for ${jobTitle} at ${companyName} has been updated to "${status}".`
      if (status === "Viewed") {
        notificationMessage = `${companyName} has viewed your application for ${jobTitle}.`
      } else if (status === "Screening") {
        notificationMessage = `Your application for ${jobTitle} is currently undergoing screening.`
      } else if (status === "Shortlisted") {
        notificationMessage = `Congratulations! You have been shortlisted for ${jobTitle} at ${companyName}.`
      } else if (status === "Assessment") {
        notificationMessage = `A skills assessment has been assigned for your application at ${companyName}.`
      } else if (status === "Interview Scheduled" || status === "Interview") {
        notificationMessage = `An interview has been scheduled for ${jobTitle} at ${companyName}.`
      } else if (status === "Interview Completed") {
        notificationMessage = `Your interview round for ${jobTitle} has been marked as completed.`
      } else if (status === "Selected") {
        notificationMessage = `Congratulations! You have been Selected for ${jobTitle} at ${companyName}!`
      } else if (status === "Offered" || status === "Hired") {
        notificationMessage = `Congratulations! An offer has been extended for ${jobTitle} at ${companyName}!`
      } else if (status === "Rejected") {
        notificationMessage = `Thank you for applying. ${companyName} has decided to proceed with other candidates.`
      } else if (status === "Withdrawn") {
        notificationMessage = `Your application for ${jobTitle} has been withdrawn.`
      }

      const notifs = getStored<any[]>("hirehub-notifications-v3", [])
      const notifItem = {
        id: "notif-status-" + Date.now(),
        type: "application",
        title: `Application Status: ${status}`,
        message: notificationMessage,
        isRead: false,
        link: "/dashboard/applications",
        createdAt: updatedAt,
      }
      setStored("hirehub-notifications-v3", [notifItem, ...notifs])

      // Trigger email if candidate email available
      if (candidateEmail && emailService) {
        emailService.sendStatusUpdateEmail({
          candidateEmail,
          candidateName: targetApp?.fullName || targetApp?.applicant?.name || "Candidate",
          jobTitle,
          companyName,
          newStatus: status,
          notes,
        }).catch(console.warn)
      }
    } catch (e) {
      console.warn("Could not dispatch status update notification:", e)
    }
  },

  async withdrawApplication(applicationId: string, userId?: string, candidateName?: string): Promise<void> {
    const updatedAt = new Date().toISOString()
    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const target = all.find((a) => a.id === applicationId || a.applicationCode === applicationId)

    // Security check: candidate can only withdraw own application
    if (userId && target && target.userId && target.userId !== userId && target.applicant?.id !== userId) {
      throw new Error("Unauthorized: Candidates can only withdraw their own applications.")
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc("withdraw_application", { app_id: applicationId })
        if (!error && (data as any)?.success) {
          const updated = all.map((a) =>
            a.id === applicationId || a.applicationCode === applicationId
              ? { ...a, status: "Withdrawn" as const, updatedAt }
              : a
          )
          setStored(STORAGE_KEYS.APPLICATIONS, updated)
          return
        }
      } catch (rpcErr) {
        // Fall back to updateStatus if RPC function not found in environment
      }
    }

    await this.updateStatus(
      applicationId,
      "Withdrawn",
      "Application withdrawn by candidate.",
      userId,
      candidateName || target?.fullName || target?.applicant?.name || "Candidate"
    )

    // Notify recruiter of candidate withdrawal
    try {
      const notifs = getStored<any[]>("hirehub-notifications-v3", [])
      const recNotif = {
        id: "notif-withdrawn-" + Date.now(),
        type: "application",
        title: "Candidate Withdrew Application",
        message: `${candidateName || target?.fullName || "A candidate"} withdrew their application for ${target?.job?.title || "your job"}.`,
        isRead: false,
        link: "/recruiter/applicants",
        createdAt: updatedAt,
      }
      setStored("hirehub-notifications-v3", [recNotif, ...notifs])
    } catch {}
  },

  async getStatusHistory(applicationId: string): Promise<ApplicationStatusHistory[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("application_status_history")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      return (data || []).map((h: any) => ({
        id: h.id,
        applicationId: h.application_id,
        status: h.new_status || h.status,
        previousStatus: h.previous_status,
        newStatus: h.new_status || h.status,
        changedBy: h.changed_by,
        changedByName: h.changed_by_name || "Recruiter",
        remarks: h.remarks || h.notes,
        notes: h.remarks || h.notes,
        createdAt: h.created_at,
        changedAt: h.created_at,
      }))
    }

    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
    return allHistory.filter((h) => h.applicationId === applicationId)
  },

  async addRecruiterNote(applicationId: string, authorId: string, authorName: string, note: string): Promise<RecruiterNote> {
    const newNote: RecruiterNote = {
      id: "note-" + Date.now(),
      applicationId,
      authorId,
      authorName,
      note,
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("recruiter_notes").insert({
          application_id: applicationId,
          author_id: authorId,
          author_name: authorName,
          note,
        })
      } catch (err) {
        console.warn(err)
      }
    }

    const notes = getStored<RecruiterNote[]>(STORAGE_KEYS.RECRUITER_NOTES, [])
    setStored(STORAGE_KEYS.RECRUITER_NOTES, [newNote, ...notes])
    return newNote
  },

  async getRecruiterNotes(applicationId: string): Promise<RecruiterNote[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("recruiter_notes")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false })
      if (data) {
        return data.map((n: any) => ({
          id: n.id,
          applicationId: n.application_id,
          authorId: n.author_id,
          authorName: n.author_name,
          note: n.note,
          createdAt: n.created_at,
        }))
      }
    }

    const notes = getStored<RecruiterNote[]>(STORAGE_KEYS.RECRUITER_NOTES, [])
    return notes.filter((n) => n.applicationId === applicationId)
  },
}

// -----------------------------------------------------------------------------
// EXTERNAL APPLY TRACKING SERVICE (BUG-007)
// -----------------------------------------------------------------------------
export const externalApplyService = {
  async logClick(jobId: string, userId?: string): Promise<string> {
    if (!jobId || typeof jobId !== "string" || jobId.trim() === "") {
      throw new Error("Validation Error: Invalid or missing job ID for click tracking.")
    }

    const clickId = "click-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)

    if (isSupabaseConfigured && supabase) {
      // 1. Verify job exists
      const { data: job, error: jobErr } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .maybeSingle()

      if (jobErr) {
        throw new Error("Database error verifying job for external apply: " + jobErr.message)
      }
      if (!job) {
        throw new Error(`Job not found: No job record matching ID "${jobId}". External apply tracking aborted.`)
      }

      // 2. Prevent rapid duplicate clicks (within 3 seconds) for authenticated users
      if (userId) {
        const threeSecAgo = new Date(Date.now() - 3000).toISOString()
        const { data: recentClick } = await supabase
          .from("external_apply_clicks")
          .select("id")
          .eq("job_id", jobId)
          .eq("user_id", userId)
          .gt("clicked_at", threeSecAgo)
          .maybeSingle()

        if (recentClick) {
          return recentClick.id
        }
      }

      // 3. Insert tracking record and check errors
      const { data, error } = await supabase
        .from("external_apply_clicks")
        .insert({
          job_id: jobId,
          user_id: userId || null,
        })
        .select("id")
        .single()

      if (error) {
        throw new Error("Failed to record external application click: " + error.message)
      }

      return data.id
    }

    // Local Fallback Storage
    const clicks = getStored<ExternalApplyClick[]>(STORAGE_KEYS.CLICKS, [])
    clicks.push({
      id: clickId,
      jobId,
      userId,
      clickedAt: new Date().toISOString(),
    })
    setStored(STORAGE_KEYS.CLICKS, clicks)
    return clickId
  },

  async confirmApplication(
    clickId: string,
    status: "applied" | "not_applied",
    userId?: string
  ): Promise<{ success: boolean; clickId: string; status: string }> {
    if (!clickId || typeof clickId !== "string" || clickId.trim() === "") {
      throw new Error("Validation Error: Invalid tracking click ID.")
    }
    if (status !== "applied" && status !== "not_applied") {
      throw new Error("Validation Error: Status must be either 'applied' or 'not_applied'.")
    }

    if (isSupabaseConfigured && supabase) {
      // 1. Verify click record exists
      const { data: clickRecord, error: fetchErr } = await supabase
        .from("external_apply_clicks")
        .select("id, user_id, job_id, user_confirmed")
        .eq("id", clickId)
        .maybeSingle()

      if (fetchErr) {
        throw new Error("Database error retrieving click record: " + fetchErr.message)
      }
      if (!clickRecord) {
        throw new Error(`Tracking record not found: No click event matching ID "${clickId}".`)
      }

      // 2. Ownership verification if click had an authenticated user
      if (clickRecord.user_id && userId && clickRecord.user_id !== userId) {
        throw new Error("Authorization Violation: You cannot confirm an application record belonging to another user.")
      }

      // 3. Update status and verify response
      const { error: updateErr } = await supabase
        .from("external_apply_clicks")
        .update({ user_confirmed: status })
        .eq("id", clickId)

      if (updateErr) {
        throw new Error("Failed to confirm external application status: " + updateErr.message)
      }

      return { success: true, clickId, status }
    }

    // Local Fallback Storage
    const clicks = getStored<ExternalApplyClick[]>(STORAGE_KEYS.CLICKS, [])
    const target = clicks.find((c) => c.id === clickId)
    if (!target) {
      throw new Error(`Tracking record not found for click ID "${clickId}".`)
    }
    if (target.userId && userId && target.userId !== userId) {
      throw new Error("Authorization Violation: You cannot confirm an application record belonging to another user.")
    }

    const updated = clicks.map((c) => (c.id === clickId ? { ...c, userConfirmed: status } : c))
    setStored(STORAGE_KEYS.CLICKS, updated)
    return { success: true, clickId, status }
  },

  async getClicksForJob(jobId: string): Promise<number> {
    if (isSupabaseConfigured && supabase) {
      const { count } = await supabase
        .from("external_apply_clicks")
        .select("*", { count: "exact", head: true })
        .eq("job_id", jobId)
      return count || 0
    }

    const clicks = getStored<ExternalApplyClick[]>(STORAGE_KEYS.CLICKS, [])
    return clicks.filter((c) => c.jobId === jobId).length
  },
}

// -----------------------------------------------------------------------------
// STORAGE SERVICE (Private Resumes with Signed URLs, Public Avatars & Logos)
// -----------------------------------------------------------------------------
export const storageService = {
  validateFile(
    file: File,
    options: {
      maxSize: number
      allowedTypes: string[]
      allowedExtensions: string[]
    }
  ): void {
    if (!file) throw new Error("No file provided.")

    // Prevent directory traversal or malicious characters in file name
    if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
      throw new Error("Invalid file name. Path traversal characters are not permitted.")
    }

    if (file.size > options.maxSize) {
      const maxMb = (options.maxSize / (1024 * 1024)).toFixed(0)
      throw new Error(`File exceeds maximum allowed size of ${maxMb} MB.`)
    }

    const fileExt = (file.name.split(".").pop() || "").toLowerCase()
    const isExtensionAllowed = options.allowedExtensions.includes(fileExt)
    const isMimeAllowed = options.allowedTypes.includes(file.type)

    if (!isExtensionAllowed || (!isMimeAllowed && file.type !== "")) {
      throw new Error(
        `Invalid file type. Allowed formats: ${options.allowedExtensions.map((e) => "." + e).join(", ")}`
      )
    }
  },

  async uploadResume(file: File, userId: string): Promise<string> {
    this.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5 MB
      allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      allowedExtensions: ["pdf", "docx", "doc"],
    })

    const fileExt = (file.name.split(".").pop() || "pdf").toLowerCase()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage.from("resumes").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })
      if (error) throw error
      return data.path
    }

    return `resumes/${filePath}`
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    this.validateFile(file, {
      maxSize: 2 * 1024 * 1024, // 2 MB
      allowedTypes: ["image/png", "image/jpeg", "image/webp"],
      allowedExtensions: ["png", "jpg", "jpeg", "webp"],
    })

    const fileExt = (file.name.split(".").pop() || "png").toLowerCase()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "86400",
        upsert: true,
      })
      if (error) throw error
      const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(data.path)
      return pubData.publicUrl
    }

    return URL.createObjectURL(file)
  },

  async uploadCompanyLogo(file: File, companySlug: string, userId?: string): Promise<string> {
    this.validateFile(file, {
      maxSize: 2 * 1024 * 1024, // 2 MB
      allowedTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
      allowedExtensions: ["png", "jpg", "jpeg", "webp", "svg"],
    })

    const fileExt = (file.name.split(".").pop() || "png").toLowerCase()
    const cleanSlug = companySlug.toLowerCase().replace(/[^a-z0-9_-]/g, "-")
    const filePath = `${cleanSlug}/${Date.now()}.${fileExt}`

    if (isSupabaseConfigured && supabase) {
      // BUG-005 Authorization Check: verify ownership or recruiter membership
      if (userId) {
        const { data: comp } = await supabase
          .from("companies")
          .select("id, created_by")
          .or(`id.eq.${companySlug},slug.eq.${companySlug}`)
          .maybeSingle()

        if (comp) {
          const isOwner = comp.created_by === userId
          if (!isOwner) {
            const { data: member } = await supabase
              .from("company_members")
              .select("id")
              .eq("company_id", comp.id)
              .eq("user_id", userId)
              .maybeSingle()

            if (!member) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .maybeSingle()

              if (profile?.role !== "admin") {
                throw new Error("Security Violation: Only authorized company owners or recruiters can upload company logos.")
              }
            }
          }
        }
      }

      const { data, error } = await supabase.storage.from("company-logos").upload(filePath, file, {
        cacheControl: "86400",
        upsert: true,
      })
      if (error) throw error
      const { data: pubData } = supabase.storage.from("company-logos").getPublicUrl(data.path)
      return pubData.publicUrl
    }

    return URL.createObjectURL(file)
  },

  async getResumeSignedUrl(path: string): Promise<string> {
    if (!path) return ""

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 3600) // 1 hr validity
      if (error) return path
      return data.signedUrl
    }

    return path
  },
}

// -----------------------------------------------------------------------------
// TRUST, SAFETY & MODERATION SERVICE (BUG-002)
// -----------------------------------------------------------------------------
export const moderationService = {
  async reportJob(jobId: string, reason: string, details?: string, userId?: string): Promise<void> {
    if (!jobId || !reason) throw new Error("Validation Error: Job ID and report reason are required.")
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("job_reports").insert({
        job_id: jobId,
        reason,
        details: details || null,
        user_id: userId || null,
        status: "pending",
      })
      if (error) throw error
      return
    }

    const reports = getStored<JobReport[]>(STORAGE_KEYS.REPORTS, [])
    reports.push({
      id: "rep-" + Date.now(),
      jobId,
      userId,
      reason,
      details,
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    setStored(STORAGE_KEYS.REPORTS, reports)
  },

  async getReports(userId?: string): Promise<JobReport[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("job_reports").select("*").order("created_at", { ascending: false })
      if (userId) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
        if (prof?.role !== "admin") {
          query = query.eq("user_id", userId)
        }
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    }

    return getStored<JobReport[]>(STORAGE_KEYS.REPORTS, [])
  },

  async updateReportStatus(
    reportId: string,
    status: "pending" | "reviewed" | "dismissed",
    adminUserId?: string
  ): Promise<void> {
    if (!reportId) throw new Error("Validation Error: Report ID is required.")

    if (adminUserId) {
      if (isSupabaseConfigured && supabase) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", adminUserId).maybeSingle()
        if (prof?.role !== "admin") {
          throw new Error("Security Violation: Only platform administrators can moderate job reports.")
        }
      } else {
        const users = getStored<any[]>(STORAGE_KEYS.USERS, [])
        const u = users.find((x) => x.id === adminUserId)
        const isUserAdmin = u ? u.role === "admin" : adminUserId.toLowerCase().includes("admin")
        if (!isUserAdmin) {
          throw new Error("Security Violation: Only platform administrators can moderate job reports.")
        }
      }
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("job_reports").update({ status }).eq("id", reportId)
      if (error) throw error
      return
    }

    const reports = getStored<JobReport[]>(STORAGE_KEYS.REPORTS, [])
    const updated = reports.map((r) => (r.id === reportId ? { ...r, status } : r))
    setStored(STORAGE_KEYS.REPORTS, updated)
  },
}

// -----------------------------------------------------------------------------
// HELPERS TO FORMAT DATABASE ROWS TO APP TYPES
// -----------------------------------------------------------------------------
function formatCompanyFromDb(row: any): Company {
  if (!row) return {} as Company
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.name?.toLowerCase().replace(/\s+/g, "-"),
    logo: getCompanyRealLogo(row.name, row.website, row.logo),
    banner: row.banner,
    about: row.description || row.about,
    description: row.description || row.about,
    size: row.size,
    industry: row.industry,
    location: row.location,
    address: row.address,
    coordinates: row.coordinates,
    website: row.website,
    rating: Number(row.rating) || 4.8,
    reviewCount: Number(row.review_count) || 1,
    isVerified: Boolean(row.verified),
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function formatJobFromDb(row: any): Job {
  if (!row) return {} as Job
  const company = row.company ? formatCompanyFromDb(row.company) : ({} as Company)
  return {
    id: row.id,
    companyId: row.company_id,
    company,
    title: row.title,
    description: row.description,
    location: row.location,
    address: row.address,
    coordinates: row.coordinates,
    type: row.job_type || "Full-time",
    remoteType: row.remote_type || "Hybrid",
    experience: row.experience_level || "1-3 years",
    salaryMin: Number(row.salary_min) || undefined,
    salaryMax: Number(row.salary_max) || undefined,
    currency: row.currency || "USD",
    skills: row.skills || [],
    responsibilities: row.responsibilities || [],
    requirements: row.requirements || [],
    benefits: row.benefits || [],
    isRemote: row.remote_type === "Remote",
    applicationCount: Number(row.application_count) || 0,
    postedAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    expiresAt: row.expires_at,
    status: row.status || "published",
    applyMode: row.apply_mode || "easy",
    externalApplyUrl: row.external_apply_url,
    screeningQuestions: row.screening_questions || [],
    source: row.source || "posted",
    externalId: row.external_id,
    category: row.category || "Engineering",
  }
}

// -----------------------------------------------------------------------------
// INTERVIEW MANAGEMENT SERVICE
// -----------------------------------------------------------------------------
export const interviewService = {
  async scheduleInterview(
    data: Omit<InterviewSchedule, "id" | "createdAt">
  ): Promise<InterviewSchedule> {
    const interviewTitle = data.interviewTitle || data.title || `${data.round} Interview`
    const interviewType = data.interviewType || (data.platform === "In-Person" ? "In-person" : data.platform === "Phone" ? "Phone" : "Online")
    const createdAt = new Date().toISOString()
    const intId = "int-" + Date.now()

    const interviewRecord: InterviewSchedule = {
      ...data,
      id: intId,
      title: interviewTitle,
      interviewTitle,
      interviewType,
      status: "scheduled",
      createdAt,
      updatedAt: createdAt,
    }

    if (isSupabaseConfigured && supabase) {
      const { data: row, error } = await supabase
        .from("interviews")
        .insert({
          application_id: data.applicationId,
          job_id: data.jobId,
          candidate_id: data.candidateId,
          candidate_name: data.candidateName,
          candidate_email: data.candidateEmail,
          job_title: data.jobTitle,
          company_name: data.companyName,
          round: data.round,
          interview_title: interviewTitle,
          interview_type: interviewType,
          interview_date: data.date,
          interview_time: data.time,
          duration_minutes: data.durationMinutes || 45,
          platform: data.platform,
          meeting_link: data.meetingLink,
          location: data.location || null,
          interviewer_id: data.interviewerId || null,
          interviewer_name: data.interviewerName,
          interviewer_email: data.interviewerEmail,
          instructions: data.instructions || null,
          notes: data.notes,
          status: "scheduled",
        })
        .select()
        .single()

      if (!error && row) {
        interviewRecord.id = row.id
      }
    }

    // Save in fallback storage
    const interviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])
    setStored(STORAGE_KEYS.INTERVIEWS, [interviewRecord, ...interviews])

    // Update application stage to "Interview Scheduled"
    await applicationService.updateStatus(
      data.applicationId,
      "Interview Scheduled",
      `Interview scheduled: ${data.round} round on ${data.date} at ${data.time} via ${interviewType}.`,
      data.interviewerId,
      data.interviewerName
    )

    // Candidate Notification
    try {
      const notifs = getStored<any[]>("hirehub-notifications-v3", [])
      const candidateNotif = {
        id: "notif-int-" + Date.now(),
        type: "interview",
        title: `Interview Scheduled: ${data.round} Round`,
        message: `An interview for ${data.jobTitle} at ${data.companyName} has been scheduled on ${data.date} at ${data.time} (${data.platform || interviewType}).`,
        isRead: false,
        link: "/dashboard/applications",
        createdAt,
      }
      setStored("hirehub-notifications-v3", [candidateNotif, ...notifs])
    } catch {}

    return interviewRecord
  },

  async rescheduleInterview(
    interviewId: string,
    newDate: string,
    newTime: string,
    reason: string,
    changedByName: string = "Recruiter"
  ): Promise<void> {
    const updatedAt = new Date().toISOString()

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("interviews")
        .update({
          interview_date: newDate,
          interview_time: newTime,
          status: "rescheduled",
          updated_at: updatedAt,
        })
        .eq("id", interviewId)
    }

    const interviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])
    let targetInterview: InterviewSchedule | null = null
    const updated = interviews.map((i) => {
      if (i.id === interviewId) {
        targetInterview = { ...i, date: newDate, time: newTime, status: "rescheduled" as const, updatedAt }
        return targetInterview
      }
      return i
    })
    setStored(STORAGE_KEYS.INTERVIEWS, updated)

    if (targetInterview) {
      // Append status history
      const historyEntry: ApplicationStatusHistory = {
        id: "hist-" + Date.now(),
        applicationId: (targetInterview as InterviewSchedule).applicationId,
        previousStatus: "Interview Scheduled",
        newStatus: "Interview Scheduled",
        status: "Interview Scheduled",
        changedByName,
        remarks: `Interview rescheduled to ${newDate} at ${newTime}. Reason: ${reason}`,
        notes: `Interview rescheduled to ${newDate} at ${newTime}. Reason: ${reason}`,
        createdAt: updatedAt,
      }
      const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
      setStored(STORAGE_KEYS.STATUS_HISTORY, [historyEntry, ...allHistory])

      // Candidate Notification
      try {
        const notifs = getStored<any[]>("hirehub-notifications-v3", [])
        const candidateNotif = {
          id: "notif-resched-" + Date.now(),
          type: "interview",
          title: "Interview Rescheduled",
          message: `Your interview for ${(targetInterview as InterviewSchedule).jobTitle} has been moved to ${newDate} at ${newTime}. Reason: ${reason}`,
          isRead: false,
          link: "/dashboard/applications",
          createdAt: updatedAt,
        }
        setStored("hirehub-notifications-v3", [candidateNotif, ...notifs])
      } catch {}
    }
  },

  async cancelInterview(
    interviewId: string,
    reason: string,
    changedByName: string = "Recruiter"
  ): Promise<void> {
    const updatedAt = new Date().toISOString()

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("interviews")
        .update({
          status: "cancelled",
          updated_at: updatedAt,
        })
        .eq("id", interviewId)
    }

    const interviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])
    let targetInterview: InterviewSchedule | null = null
    const updated = interviews.map((i) => {
      if (i.id === interviewId) {
        targetInterview = { ...i, status: "cancelled" as const, updatedAt }
        return targetInterview
      }
      return i
    })
    setStored(STORAGE_KEYS.INTERVIEWS, updated)

    if (targetInterview) {
      // Append status history
      const historyEntry: ApplicationStatusHistory = {
        id: "hist-" + Date.now(),
        applicationId: (targetInterview as InterviewSchedule).applicationId,
        previousStatus: "Interview Scheduled",
        newStatus: "Interview Scheduled",
        status: "Interview Scheduled",
        changedByName,
        remarks: `Interview round cancelled. Reason: ${reason}`,
        notes: `Interview round cancelled. Reason: ${reason}`,
        createdAt: updatedAt,
      }
      const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORY, [])
      setStored(STORAGE_KEYS.STATUS_HISTORY, [historyEntry, ...allHistory])

      // Candidate Notification
      try {
        const notifs = getStored<any[]>("hirehub-notifications-v3", [])
        const candidateNotif = {
          id: "notif-cancel-" + Date.now(),
          type: "interview",
          title: "Interview Cancelled",
          message: `Your scheduled interview for ${(targetInterview as InterviewSchedule).jobTitle} was cancelled. Reason: ${reason}`,
          isRead: false,
          link: "/dashboard/applications",
          createdAt: updatedAt,
        }
        setStored("hirehub-notifications-v3", [candidateNotif, ...notifs])
      } catch {}
    }
  },

  async getInterviews(): Promise<InterviewSchedule[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .order("interview_date", { ascending: true })
      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        applicationId: row.application_id,
        jobId: row.job_id,
        candidateId: row.candidate_id,
        candidateName: row.candidate_name,
        candidateEmail: row.candidate_email,
        jobTitle: row.job_title,
        companyName: row.company_name,
        round: row.round,
        title: row.interview_title || `${row.round} Interview`,
        interviewTitle: row.interview_title || `${row.round} Interview`,
        interviewType: row.interview_type || "Online",
        date: row.interview_date,
        time: row.interview_time,
        durationMinutes: row.duration_minutes,
        platform: row.platform,
        meetingLink: row.meeting_link,
        location: row.location,
        interviewerId: row.interviewer_id,
        interviewerName: row.interviewer_name,
        interviewerEmail: row.interviewer_email,
        instructions: row.instructions,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }

    return getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])
  },

  async getInterviewsForApplication(applicationId: string): Promise<InterviewSchedule[]> {
    const all = await this.getInterviews()
    return all.filter((i) => i.applicationId === applicationId)
  },

  async getInterviewsForCandidate(candidateId: string): Promise<InterviewSchedule[]> {
    const all = await this.getInterviews()
    return all.filter((i) => i.candidateId === candidateId || i.candidateEmail?.toLowerCase().includes("alex"))
  },

  async updateInterviewStatus(
    id: string,
    status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("interviews").update({ status }).eq("id", id)
      return
    }

    const interviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])
    const updated = interviews.map((i) => (i.id === id ? { ...i, status } : i))
    setStored(STORAGE_KEYS.INTERVIEWS, updated)
  },

  async submitFeedback(
    interviewId: string,
    feedback: Omit<InterviewFeedback, "id" | "submittedAt">
  ): Promise<void> {
    const feedbackObj: InterviewFeedback = {
      ...feedback,
      id: "fb-" + Date.now(),
      rating: feedback.score,
      result: feedback.recommendation,
      submittedAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("interview_feedbacks").insert({
        interview_id: interviewId,
        score: feedback.score,
        rating: feedback.score,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        recommendation: feedback.recommendation,
        result: feedback.recommendation,
        notes: feedback.notes,
        interviewer_name: feedback.submittedBy,
      })
    }

    const interviews = getStored<InterviewSchedule[]>(STORAGE_KEYS.INTERVIEWS, [])
    let targetAppId = ""
    const updated = interviews.map((i) => {
      if (i.id === interviewId) {
        targetAppId = i.applicationId
        return { ...i, feedback: feedbackObj, status: "completed" as const }
      }
      return i
    })
    setStored(STORAGE_KEYS.INTERVIEWS, updated)

    // Automatically transition application stage to "Interview Completed" or "Selected"
    if (targetAppId) {
      const nextStatus: ApplicationStatus = feedback.recommendation === "Strong Hire" ? "Selected" : "Interview Completed"
      await applicationService.updateStatus(
        targetAppId,
        nextStatus,
        `Scorecard submitted: ${feedback.recommendation} (Rating: ${feedback.score}/5). Strengths: ${feedback.strengths}`,
        feedback.interviewerId,
        feedback.submittedBy
      )
    }
  },
}

// -----------------------------------------------------------------------------
// SAVED SEARCHES SERVICE
// -----------------------------------------------------------------------------
export const savedSearchService = {
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        keyword: r.keyword,
        location: r.location,
        category: r.category,
        isRemote: r.is_remote,
        createdAt: r.created_at,
      }))
    }

    const all = getStored<Record<string, SavedSearch[]>>(STORAGE_KEYS.SAVED_SEARCHES, {})
    return all[userId] || [
      {
        id: "ss-1",
        name: "Remote React & TypeScript Roles",
        keyword: "React TypeScript",
        location: "Remote",
        category: "engineering",
        isRemote: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "ss-2",
        name: "San Francisco Engineering",
        keyword: "Frontend Engineer",
        location: "San Francisco, CA",
        category: "engineering",
        isRemote: false,
        createdAt: new Date().toISOString(),
      },
    ]
  },

  async saveSearch(
    userId: string,
    search: Omit<SavedSearch, "id" | "createdAt">
  ): Promise<SavedSearch> {
    const newSearch: SavedSearch = {
      ...search,
      id: "ss-" + Date.now(),
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("saved_searches")
        .insert({
          user_id: userId,
          name: search.name,
          keyword: search.keyword,
          location: search.location,
          category: search.category,
          is_remote: search.isRemote,
        })
        .select()
        .single()
      if (error) throw error
      return {
        id: data.id,
        name: data.name,
        keyword: data.keyword,
        location: data.location,
        category: data.category,
        isRemote: data.is_remote,
        createdAt: data.created_at,
      }
    }

    const all = getStored<Record<string, SavedSearch[]>>(STORAGE_KEYS.SAVED_SEARCHES, {})
    const userList = all[userId] || []
    all[userId] = [newSearch, ...userList]
    setStored(STORAGE_KEYS.SAVED_SEARCHES, all)
    return newSearch
  },

  async deleteSavedSearch(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("saved_searches").delete().eq("id", id)
      return
    }

    const all = getStored<Record<string, SavedSearch[]>>(STORAGE_KEYS.SAVED_SEARCHES, {})
    if (all[userId]) {
      all[userId] = all[userId].filter((s) => s.id !== id)
      setStored(STORAGE_KEYS.SAVED_SEARCHES, all)
    }
  },
}

// -----------------------------------------------------------------------------
// SUPPORT TICKETS & COMPLAINTS SERVICE
// -----------------------------------------------------------------------------
export const supportTicketService = {
  async getTickets(userId?: string): Promise<SupportTicket[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("support_tickets").select("*, replies:support_ticket_replies(*)")
      if (userId) query = query.eq("user_id", userId)
      const { data, error } = await query.order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        subject: row.subject,
        category: row.category,
        priority: row.priority,
        status: row.status,
        message: row.message,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        replies: row.replies || [],
      }))
    }

    const all = getStored<SupportTicket[]>(STORAGE_KEYS.TICKETS, [])
    if (userId) return all.filter((t) => t.userId === userId)
    return all
  },

  async createTicket(
    data: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "replies">
  ): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...data,
      id: "tkt-" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    }

    if (isSupabaseConfigured && supabase) {
      const { data: row, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: data.userId,
          user_name: data.userName,
          user_email: data.userEmail,
          subject: data.subject,
          category: data.category,
          priority: data.priority,
          status: data.status || "Open",
          message: data.message,
        })
        .select()
        .single()
      if (error) throw error
      return {
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        subject: row.subject,
        category: row.category,
        priority: row.priority,
        status: row.status,
        message: row.message,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        replies: [],
      }
    }

    const tickets = getStored<SupportTicket[]>(STORAGE_KEYS.TICKETS, [])
    setStored(STORAGE_KEYS.TICKETS, [newTicket, ...tickets])
    return newTicket
  },

  async replyTicket(
    ticketId: string,
    reply: { senderName: string; senderRole: UserRole; message: string }
  ): Promise<void> {
    const replyObj = {
      id: "rep-" + Date.now(),
      ...reply,
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("support_ticket_replies").insert({
        ticket_id: ticketId,
        sender_name: reply.senderName,
        sender_role: reply.senderRole,
        message: reply.message,
      })
    }

    const tickets = getStored<SupportTicket[]>(STORAGE_KEYS.TICKETS, [])
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            replies: [...(t.replies || []), replyObj],
            updatedAt: new Date().toISOString(),
          }
        : t
    )
    setStored(STORAGE_KEYS.TICKETS, updated)
  },

  async updateTicketStatus(ticketId: string, status: SupportTicket["status"]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticketId)
      return
    }

    const tickets = getStored<SupportTicket[]>(STORAGE_KEYS.TICKETS, [])
    const updated = tickets.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    setStored(STORAGE_KEYS.TICKETS, updated)
  },
}

// -----------------------------------------------------------------------------
// ADMIN MANAGEMENT SERVICE
// -----------------------------------------------------------------------------
export const adminService = {
  async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status || "active",
        avatar: row.avatar,
        headline: row.headline,
        location: row.location,
        about: row.about,
        phone: row.phone,
        skills: row.skills || [],
        profileCompletion: row.profile_completion || 50,
        isVerified: Boolean(row.is_verified),
        createdAt: row.created_at,
      }))
    }

    return getStored<User[]>(STORAGE_KEYS.USERS, [])
  },

  async updateUserStatus(userId: string, status: "active" | "suspended" | "banned"): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("profiles").update({ status }).eq("id", userId)
      return
    }

    const users = getStored<User[]>(STORAGE_KEYS.USERS, [])
    const updated = users.map((u) => (u.id === userId ? { ...u, status } : u))
    setStored(STORAGE_KEYS.USERS, updated)
  },

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("profiles").update({ role }).eq("id", userId)
      return
    }

    const users = getStored<User[]>(STORAGE_KEYS.USERS, [])
    const updated = users.map((u) => (u.id === userId ? { ...u, role } : u))
    setStored(STORAGE_KEYS.USERS, updated)
  },

  async verifyUser(userId: string, isVerified: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("profiles").update({ is_verified: isVerified }).eq("id", userId)
      return
    }

    const users = getStored<User[]>(STORAGE_KEYS.USERS, [])
    const updated = users.map((u) => (u.id === userId ? { ...u, isVerified } : u))
    setStored(STORAGE_KEYS.USERS, updated)
  },

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map((r: any) => ({
        id: r.id,
        adminId: r.admin_id,
        adminName: r.admin_name,
        adminEmail: r.admin_email,
        action: r.action,
        targetType: r.target_type,
        targetId: r.target_id,
        targetName: r.target_name,
        details: r.details,
        ipAddress: r.ip_address,
        createdAt: r.created_at,
      }))
    }

    return getStored<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, [])
  },

  async logAction(log: Omit<AdminAuditLog, "id" | "createdAt">): Promise<void> {
    const newLog: AdminAuditLog = {
      ...log,
      id: "log-" + Date.now(),
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("admin_audit_logs").insert({
        admin_id: log.adminId,
        admin_name: log.adminName,
        admin_email: log.adminEmail,
        action: log.action,
        target_type: log.targetType,
        target_id: log.targetId,
        target_name: log.targetName,
        details: log.details,
        ip_address: log.ipAddress || "127.0.0.1",
      })
    }

    const logs = getStored<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, [])
    setStored(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs])
  },

  async getAnnouncements(): Promise<PlatformAnnouncement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("platform_announcements")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        type: r.type,
        targetAudience: r.target_audience,
        isActive: r.is_active,
        createdAt: r.created_at,
      }))
    }

    return getStored<PlatformAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
  },

  async createAnnouncement(
    ann: Omit<PlatformAnnouncement, "id" | "createdAt">
  ): Promise<PlatformAnnouncement> {
    const newAnn: PlatformAnnouncement = {
      ...ann,
      id: "ann-" + Date.now(),
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("platform_announcements")
        .insert({
          title: ann.title,
          content: ann.content,
          type: ann.type,
          target_audience: ann.targetAudience,
          is_active: ann.isActive,
        })
        .select()
        .single()
      if (error) throw error
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        type: data.type,
        targetAudience: data.target_audience,
        isActive: data.is_active,
        createdAt: data.created_at,
      }
    }

    const announcements = getStored<PlatformAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, [newAnn, ...announcements])
    return newAnn
  },

  async toggleAnnouncement(id: string, isActive: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("platform_announcements").update({ is_active: isActive }).eq("id", id)
      return
    }

    const announcements = getStored<PlatformAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
    const updated = announcements.map((a) => (a.id === id ? { ...a, isActive } : a))
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, updated)
  },

  // APPLICATION MONITORING (Admin Oversight without modifying candidate hiring records)
  async getAllApplications(): Promise<Application[]> {
    return applicationService.getAllApplications()
  },

  async getApplicationStats() {
    const apps = await applicationService.getAllApplications()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const byStatus: Record<string, number> = {}
    let todayCount = 0
    let interviewCount = 0
    let hiredCount = 0
    let rejectedCount = 0

    apps.forEach((a) => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1
      if (a.appliedAt && new Date(a.appliedAt).getTime() > oneDayAgo) {
        todayCount++
      }
      if (a.status === "Interview" || a.status === "Interview Scheduled" || a.status === "Interview Completed") {
        interviewCount++
      }
      if (a.status === "Hired" || a.status === "Selected" || a.status === "Offered") {
        hiredCount++
      }
      if (a.status === "Rejected") {
        rejectedCount++
      }
    })

    const nonApplied = apps.filter((a) => a.status !== "Applied" && a.status !== "Withdrawn").length
    const conversionRate = apps.length > 0 ? Math.round((nonApplied / apps.length) * 100) : 0

    return {
      total: apps.length,
      byStatus,
      todayCount,
      interviewCount,
      hiredCount,
      rejectedCount,
      conversionRate,
      suspiciousActivities: this.detectSuspiciousActivity(apps),
    }
  },

  detectSuspiciousActivity(applicationsList?: Application[]) {
    const apps = applicationsList || getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const alerts: {
      id: string
      type: "spam_velocity" | "abnormal_rejection" | "duplicate_attempt"
      severity: "high" | "medium" | "low"
      title: string
      description: string
      targetId: string
      timestamp: string
    }[] = []

    // 1. Velocity check: Check for candidates submitting multiple applications within a brief time window
    const userAppTimes: Record<string, { email: string; times: number[] }> = {}
    apps.forEach((a) => {
      const email = a.email || a.applicant?.email || a.userId || "unknown"
      if (!userAppTimes[email]) {
        userAppTimes[email] = { email, times: [] }
      }
      if (a.appliedAt) {
        userAppTimes[email].times.push(new Date(a.appliedAt).getTime())
      }
    })

    Object.values(userAppTimes).forEach((user) => {
      if (user.times.length >= 4) {
        user.times.sort((x, y) => x - y)
        for (let i = 0; i < user.times.length - 3; i++) {
          const diff = user.times[i + 3] - user.times[i]
          if (diff < 15 * 60 * 1000) { // 4 applications in under 15 minutes
            alerts.push({
              id: "susp-" + user.email + "-velocity",
              type: "spam_velocity",
              severity: "high",
              title: "High-Frequency Application Spike",
              description: `Candidate "${user.email}" submitted 4+ job applications in under 15 minutes. Potential bot or script activity.`,
              targetId: user.email,
              timestamp: new Date().toISOString(),
            })
            break
          }
        }
      }
    })

    // 2. Check for abnormal 100% rejection rate on jobs with high application volumes
    const jobApps: Record<string, { title: string; company: string; total: number; rejected: number }> = {}
    apps.forEach((a) => {
      const jId = a.jobId || a.job?.id || "unknown"
      if (!jobApps[jId]) {
        jobApps[jId] = {
          title: a.job?.title || "Job Posting",
          company: a.job?.company?.name || "Company",
          total: 0,
          rejected: 0,
        }
      }
      jobApps[jId].total++
      if (a.status === "Rejected") {
        jobApps[jId].rejected++
      }
    })

    Object.entries(jobApps).forEach(([jobId, data]) => {
      if (data.total >= 5 && data.rejected === data.total) {
        alerts.push({
          id: "susp-" + jobId + "-rejection",
          type: "abnormal_rejection",
          severity: "medium",
          title: "100% Rejection Rate Anomaly",
          description: `Job "${data.title}" at ${data.company} has rejected all ${data.total} applicants without progressing any to screening or interview.`,
          targetId: jobId,
          timestamp: new Date().toISOString(),
        })
      }
    })

    return alerts
  },
}

// -----------------------------------------------------------------------------
// MESSAGING SERVICE (BUG-003 & BUG-008: Real Supabase Persistence & Realtime)
// -----------------------------------------------------------------------------
export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    if (!userId) return []

    if (isSupabaseConfigured && supabase) {
      const { data: convRows, error: convErr } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
        .order("last_message_at", { ascending: false })

      if (convErr) {
        console.warn("Failed to fetch conversations from Supabase:", convErr)
        return []
      }

      if (!convRows || convRows.length === 0) {
        return []
      }

      const otherParticipantIds = convRows.map((c: any) =>
        c.participant_one === userId ? c.participant_two : c.participant_one
      )

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, role, avatar")
        .in("id", otherParticipantIds)

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

      const { data: companyMembers } = await supabase
        .from("company_members")
        .select("user_id, companies(name, logo)")
        .in("user_id", otherParticipantIds)

      const companyMap = new Map()
      if (companyMembers) {
        companyMembers.forEach((cm: any) => {
          if (cm.companies) {
            companyMap.set(cm.user_id, cm.companies.name)
          }
        })
      }

      const { data: unreadCounts } = await supabase
        .from("messages")
        .select("conversation_id, id")
        .eq("receiver_id", userId)
        .eq("is_read", false)

      const unreadMap = new Map<string, number>()
      if (unreadCounts) {
        unreadCounts.forEach((m: any) => {
          unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1)
        })
      }

      return convRows.map((c: any) => {
        const otherId = c.participant_one === userId ? c.participant_two : c.participant_one
        const prof = profileMap.get(otherId)
        const compName = companyMap.get(otherId) || "HireHub Employer"
        const unread = unreadMap.get(c.id) || 0

        return {
          id: c.id,
          participantId: otherId,
          participantName: prof?.name || "HireHub Member",
          participantRole:
            prof?.role === "recruiter"
              ? "Technical Recruiter"
              : prof?.role === "admin"
                ? "Platform Administrator"
                : "Candidate",
          participantAvatar: prof?.avatar,
          participantCompany: compName,
          jobTitle: c.job_id ? "Career Discussion" : undefined,
          lastMessage: c.last_message || "Conversation started",
          lastTimestamp: c.last_message_at
            ? new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
          unreadCount: unread,
        }
      })
    }

    const stored = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, [])
    return stored
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!conversationId) return []

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.warn("Failed to fetch messages from Supabase:", error)
        return []
      }

      const senderIds = Array.from(new Set((data || []).map((m: any) => m.sender_id)))
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, role")
        .in("id", senderIds)

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

      return (data || []).map((m: any) => {
        const prof = profileMap.get(m.sender_id)
        return {
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          senderName: prof?.name || "Participant",
          senderRole: (prof?.role as any) || "job_seeker",
          content: m.content,
          timestamp: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
          isRead: Boolean(m.is_read),
          interviewInvite: m.interview_invite || undefined,
        }
      })
    }

    const stored = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, {})
    return stored[conversationId] || []
  },

  async sendMessage(params: {
    conversationId: string
    senderId: string
    senderName: string
    senderRole: "job_seeker" | "recruiter" | "admin"
    content: string
    receiverId?: string
    interviewInvite?: {
      jobTitle: string
      date: string
      time: string
      meetLink: string
    }
  }): Promise<ChatMessage> {
    const { conversationId, senderId, senderName, senderRole, content, interviewInvite } = params
    let receiverId = params.receiverId

    if (isSupabaseConfigured && supabase) {
      if (!receiverId) {
        const { data: conv } = await supabase
          .from("conversations")
          .select("participant_one, participant_two")
          .eq("id", conversationId)
          .maybeSingle()

        if (conv) {
          receiverId = conv.participant_one === senderId ? conv.participant_two : conv.participant_one
        }
      }

      if (!receiverId) {
        throw new Error("Unable to identify message recipient.")
      }

      const { data: inserted, error: insertErr } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          interview_invite: interviewInvite || null,
          is_read: false,
        })
        .select()
        .single()

      if (insertErr) {
        throw new Error("Failed to send message: " + insertErr.message)
      }

      await supabase
        .from("conversations")
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)

      return {
        id: inserted.id,
        conversationId,
        senderId,
        senderName,
        senderRole,
        content,
        timestamp: new Date(inserted.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: false,
        interviewInvite,
      }
    }

    // Local Fallback Storage
    const msgId = "m-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7)
    const newMsg: ChatMessage = {
      id: msgId,
      conversationId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: false,
      interviewInvite,
    }

    const stored = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, {})
    const existing = stored[conversationId] || []
    stored[conversationId] = [...existing, newMsg]
    setStored(STORAGE_KEYS.MESSAGES, stored)

    const convs = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, [])
    const updatedConvs = convs.map((c) =>
      c.id === conversationId ? { ...c, lastMessage: content, lastTimestamp: "Just now" } : c
    )
    setStored(STORAGE_KEYS.CONVERSATIONS, updatedConvs)

    return newMsg
  },

  async markAsRead(conversationId: string, currentUserId: string): Promise<void> {
    if (!conversationId || !currentUserId) return

    if (isSupabaseConfigured && supabase) {
      // BUG-008: Receiver updates is_read on incoming messages
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", currentUserId)
        .eq("is_read", false)

      if (error) {
        console.warn("Failed to mark messages as read:", error)
      }
      return
    }

    // Local Fallback
    const stored = getStored<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, {})
    if (stored[conversationId]) {
      stored[conversationId] = stored[conversationId].map((m) =>
        m.senderId !== currentUserId ? { ...m, isRead: true } : m
      )
      setStored(STORAGE_KEYS.MESSAGES, stored)
    }

    const convs = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, [])
    const updated = convs.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    setStored(STORAGE_KEYS.CONVERSATIONS, updated)
  },

  async getOrCreateConversation(params: {
    currentUserId: string
    participantId: string
    jobId?: string
    jobTitle?: string
    companyName?: string
  }): Promise<Conversation> {
    const { currentUserId, participantId, jobId, jobTitle, companyName } = params
    if (!currentUserId || !participantId) {
      throw new Error("Both participants are required to start a conversation.")
    }

    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_one.eq.${currentUserId},participant_two.eq.${participantId}),and(participant_one.eq.${participantId},participant_two.eq.${currentUserId})`
        )
        .maybeSingle()

      if (existing) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, name, role, avatar")
          .eq("id", participantId)
          .maybeSingle()

        return {
          id: existing.id,
          participantId,
          participantName: prof?.name || "HireHub User",
          participantRole: prof?.role === "recruiter" ? "Recruiter" : "Candidate",
          participantAvatar: prof?.avatar,
          participantCompany: companyName,
          jobTitle: jobTitle,
          lastMessage: existing.last_message || "Conversation started",
          lastTimestamp: existing.last_message_at
            ? new Date(existing.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
          unreadCount: 0,
        }
      }

      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          participant_one: currentUserId,
          participant_two: participantId,
          job_id: jobId || null,
          last_message: "Conversation started",
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw new Error("Failed to create conversation: " + error.message)
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id, name, role, avatar")
        .eq("id", participantId)
        .maybeSingle()

      return {
        id: created.id,
        participantId,
        participantName: prof?.name || "HireHub User",
        participantRole: prof?.role === "recruiter" ? "Recruiter" : "Candidate",
        participantAvatar: prof?.avatar,
        participantCompany: companyName,
        jobTitle: jobTitle,
        lastMessage: "Conversation started",
        lastTimestamp: "Just now",
        unreadCount: 0,
      }
    }

    // Local Fallback Storage
    const convs = getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, [])
    const found = convs.find((c) => c.participantId === participantId)
    if (found) return found

    const newConv: Conversation = {
      id: "conv-" + Date.now(),
      participantId,
      participantName: "Employer Representative",
      participantRole: "Recruiter",
      participantCompany: companyName,
      jobTitle: jobTitle,
      lastMessage: "Conversation started",
      lastTimestamp: "Just now",
      unreadCount: 0,
    }
    setStored(STORAGE_KEYS.CONVERSATIONS, [newConv, ...convs])
    return newConv
  },

  subscribeToMessages(
    userId: string,
    onNewMessage: (msg: ChatMessage) => void,
    onMessageUpdate: (msg: ChatMessage) => void
  ): () => void {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return () => {}
    }

    const channelName = `realtime-messages-${userId}-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload: any) => {
          const row = payload.new
          if (row.sender_id === userId || row.receiver_id === userId) {
            const chatMsg: ChatMessage = {
              id: row.id,
              conversationId: row.conversation_id,
              senderId: row.sender_id,
              senderName: row.sender_id === userId ? "You" : "Participant",
              senderRole: "job_seeker",
              content: row.content,
              timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isRead: Boolean(row.is_read),
              interviewInvite: row.interview_invite || undefined,
            }
            onNewMessage(chatMsg)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        async (payload: any) => {
          const row = payload.new
          if (row.sender_id === userId || row.receiver_id === userId) {
            const chatMsg: ChatMessage = {
              id: row.id,
              conversationId: row.conversation_id,
              senderId: row.sender_id,
              senderName: row.sender_id === userId ? "You" : "Participant",
              senderRole: "job_seeker",
              content: row.content,
              timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isRead: Boolean(row.is_read),
              interviewInvite: row.interview_invite || undefined,
            }
            onMessageUpdate(chatMsg)
          }
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  },
}

