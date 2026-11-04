export type UserRole = "job_seeker" | "recruiter" | "admin"

export type JobType = "Full-time" | "Part-time" | "Internship" | "Contract" | "Freelance" | "Remote" | "Hybrid" | "On-site"

export type RemoteType = "Remote" | "Hybrid" | "On-site"

export type ExperienceLevel = "Fresher" | "0-1 years" | "1-3 years" | "3-5 years" | "5+ years"

export type ApplicationStatus = "Applied" | "Viewed" | "Shortlisted" | "Interview" | "Offered" | "Rejected" | "Withdrawn"

export type RecruiterStatus = "pending" | "approved" | "rejected" | "blocked"

export type CompanyStatus = "pending" | "approved" | "rejected" | "blocked"

export type JobStatus = "draft" | "published" | "closed" | "expired" | "active"

export type ApplyMode = "easy" | "external" | "both"

export type JobSource = "posted" | "imported"

export interface Experience {
  id: string
  company: string
  role: string
  duration: string
  description: string
}

export interface Education {
  id: string
  school: string
  degree: string
  dates: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  headline?: string
  location?: string
  about?: string
  phone?: string
  isPhoneVerified?: boolean
  isEmailVerified?: boolean
  linkedin?: string
  skills: string[]
  experience?: Experience[]
  education?: Education[]
  resumeUrl?: string
  profileCompletion: number
  isVerified: boolean
  createdAt: string
  companyId?: string // associated company for recruiters
}

export interface Company {
  id: string
  name: string
  slug?: string
  logo?: string
  banner?: string
  about?: string
  description?: string
  industry?: string
  size?: string
  location?: string
  address?: string
  coordinates?: { lat: number; lng: number }
  website?: string
  founded?: number
  rating: number
  reviewCount: number
  jobCount?: number
  isVerified: boolean
  status?: CompanyStatus
  createdBy?: string
  createdAt?: string
}

export interface CompanyMember {
  id: string
  companyId: string
  userId: string
  role: "owner" | "recruiter" | "member"
  createdAt: string
  user?: Partial<User>
}

export interface ScreeningQuestion {
  id: string
  question: string
  type: "text" | "yes_no" | "multiple_choice"
  options?: string[]
  required: boolean
}

export interface Job {
  id: string
  companyId?: string
  company: Company
  title: string
  description: string
  location: string
  address?: string
  coordinates?: { lat: number; lng: number }
  type: JobType
  remoteType?: RemoteType
  experience: ExperienceLevel
  salaryMin?: number
  salaryMax?: number
  currency?: string
  skills: string[]
  responsibilities: string[]
  requirements: string[]
  benefits?: string[]
  isRemote: boolean
  isFeatured?: boolean
  isUrgent?: boolean
  applicationCount: number
  postedAt: string
  expiresAt?: string
  status: JobStatus
  applyMode?: ApplyMode
  externalApplyUrl?: string
  screeningQuestions?: ScreeningQuestion[]
  source?: JobSource
  externalId?: string
  category: string
}

export interface Application {
  id: string
  jobId?: string
  job: Job
  userId?: string
  applicant: User
  status: ApplicationStatus
  resumeUrl: string
  coverLetter?: string
  answers?: Record<string, string>
  notes?: string
  atsScore?: number
  source?: "easy" | "external"
  appliedAt: string
  updatedAt: string
}

export interface ExternalApplyClick {
  id: string
  jobId: string
  userId?: string
  clickedAt: string
  userConfirmed?: "applied" | "not_applied" | null
}

export interface JobReport {
  id: string
  jobId: string
  userId?: string
  reason: string
  details?: string
  status: "pending" | "reviewed" | "dismissed"
  createdAt: string
}

export interface Notification {
  id: string
  type: "application" | "job_match" | "interview" | "message" | "system"
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

export interface FilterState {
  keyword: string
  location: string
  type: JobType[]
  experience: ExperienceLevel[]
  salaryMin: number
  salaryMax: number
  datePosted: string
  category: string
  skills: string[]
  isRemote: boolean
  sortBy: "relevance" | "newest" | "salary"
  applyMode?: ApplyMode | "all"
}

export interface ATSReport {
  id: string
  score: number
  resumeUrl: string
  jobDescription?: string
  breakdown: {
    keywordMatch: number
    skillsSection: number
    formatting: number
    completeness: number
    actionVerbs: number
    length: number
  }
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
