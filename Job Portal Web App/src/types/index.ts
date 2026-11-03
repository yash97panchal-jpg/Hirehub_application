export type UserRole = "job_seeker" | "recruiter" | "admin"

export type JobType = "Full-time" | "Part-time" | "Internship" | "Contract" | "Freelance" | "Remote" | "Hybrid" | "On-site"

export type ExperienceLevel = "Fresher" | "0-1 years" | "1-3 years" | "3-5 years" | "5+ years"

export type ApplicationStatus = "Applied" | "Viewed" | "Shortlisted" | "Interview" | "Offered" | "Rejected" | "Withdrawn"

export type RecruiterStatus = "pending" | "approved" | "rejected" | "blocked"

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
  linkedin?: string
  skills: string[]
  experience?: Experience[]
  education?: Education[]
  profileCompletion: number
  isVerified: boolean
  createdAt: string
}

export interface Company {
  id: string
  name: string
  logo?: string
  banner?: string
  about: string
  industry: string
  size: string
  location: string
  address?: string
  coordinates?: { lat: number; lng: number }
  website?: string
  founded?: number
  rating: number
  reviewCount: number
  jobCount: number
  isVerified: boolean
}

export interface Job {
  id: string
  title: string
  company: Company
  location: string
  address?: string
  coordinates?: { lat: number; lng: number }
  type: JobType
  experience: ExperienceLevel
  salaryMin?: number
  salaryMax?: number
  currency?: string
  description: string
  responsibilities: string[]
  requirements: string[]
  skills: string[]
  benefits?: string[]
  isRemote: boolean
  isFeatured: boolean
  isUrgent: boolean
  applicationCount: number
  postedAt: string
  expiresAt?: string
  status: "active" | "paused" | "closed"
  category: string
}

export interface Application {
  id: string
  job: Job
  applicant: User
  status: ApplicationStatus
  resumeUrl: string
  coverLetter?: string
  atsScore?: number
  appliedAt: string
  updatedAt: string
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
