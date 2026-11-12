export type UserRole = "job_seeker" | "recruiter" | "admin"

export type JobType = "Full-time" | "Part-time" | "Internship" | "Contract" | "Freelance" | "Remote" | "Hybrid" | "On-site"

export type RemoteType = "Remote" | "Hybrid" | "On-site"

export type ExperienceLevel = "Fresher" | "0-1 years" | "1-3 years" | "3-5 years" | "5+ years"

export type ApplicationStatus =
  | "Applied"
  | "Viewed"
  | "Under Review"
  | "Screening"
  | "Shortlisted"
  | "Assessment"
  | "Interview"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Final Selection"
  | "Selected"
  | "Offered"
  | "Hired"
  | "Rejected"
  | "Withdrawn"

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
  fieldOfStudy?: string
  grade?: string
  description?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialUrl?: string
}

export interface ResumeVersion {
  id: string
  name: string
  url: string
  fileName: string
  fileSize: string
  uploadedAt: string
  isDefault: boolean
  skills?: string[]
}

export interface SavedSearch {
  id: string
  name: string
  keyword: string
  location: string
  category?: string
  isRemote?: boolean
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status?: "active" | "suspended" | "banned"
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
  certifications?: Certification[]
  resumes?: ResumeVersion[]
  savedSearches?: SavedSearch[]
  followedCompanies?: string[]
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

export interface ApplicationQuestion {
  id: string
  jobId: string
  question: string
  questionType: "text" | "yes_no" | "multiple_choice"
  options?: string[]
  isRequired: boolean
  createdAt?: string
}

export interface ApplicationAnswer {
  id: string
  applicationId: string
  questionId: string
  questionText?: string
  answer: string
  createdAt: string
}

export interface ApplicationStatusHistory {
  id: string
  applicationId: string
  status: ApplicationStatus
  previousStatus?: ApplicationStatus | null
  newStatus?: ApplicationStatus
  changedBy?: string
  changedByName: string
  remarks?: string
  notes?: string
  changedAt?: string
  createdAt?: string
}

export interface RecruiterNote {
  id: string
  applicationId: string
  authorId?: string
  authorName: string
  note: string
  createdAt: string
}

export interface Application {
  id: string // e.g. "APP-20261110-8472"
  applicationNumber?: string
  applicationCode?: string
  jobId?: string
  job: Job
  userId?: string
  candidateId?: string
  recruiterId?: string
  applicant: User
  status: ApplicationStatus
  resumeUrl: string
  resumeName?: string
  resumeId?: string
  coverLetter?: string
  answers?: Record<string, string>
  
  // Detailed candidate submission data
  fullName?: string
  email?: string
  mobileNumber?: string
  currentLocation?: string
  highestQualification?: string
  highestEducation?: string
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

  notes?: string
  recruiterNotes?: RecruiterNote[]
  statusHistory?: ApplicationStatusHistory[]
  interviews?: InterviewSchedule[]
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
  sessionCreatedAt?: number
  lastActiveAt?: number
}

export type InterviewRound =
  | "Screening"
  | "Technical"
  | "System Design"
  | "Behavioral"
  | "Final"

export interface InterviewFeedback {
  id: string
  interviewId?: string
  score: number // 1 to 5
  rating?: number // 1 to 5 alias
  strengths: string
  weaknesses: string
  recommendation: "Strong Hire" | "Hire" | "Neutral" | "No Hire"
  result?: "Strong Hire" | "Hire" | "Neutral" | "No Hire"
  notes: string
  feedback?: string
  submittedAt: string
  submittedBy: string
  interviewerId?: string
}

export interface InterviewSchedule {
  id: string
  title?: string
  interviewTitle?: string
  applicationId: string
  jobId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  companyName: string
  round: InterviewRound
  date: string
  time: string
  durationMinutes: number
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "In-Person" | "Phone"
  interviewType?: "Online" | "Phone" | "In-person" | "Offline"
  meetingLink: string
  location?: string
  interviewerId?: string
  interviewerName: string
  interviewerEmail: string
  instructions?: string
  notes?: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  feedback?: InterviewFeedback
  createdAt: string
  updatedAt?: string
}

export interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  category: "Account" | "Job Posting" | "Billing" | "Bug Report" | "Other"
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Open" | "In Progress" | "Resolved" | "Closed"
  message: string
  createdAt: string
  updatedAt: string
  replies?: {
    id: string
    senderName: string
    senderRole: UserRole
    message: string
    createdAt: string
  }[]
}

export interface AdminAuditLog {
  id: string
  adminId: string
  adminName: string
  adminEmail: string
  action: string
  targetType: "User" | "Company" | "Job" | "Report" | "Setting" | "Announcement" | "SupportTicket"
  targetId?: string
  targetName?: string
  details: string
  ipAddress?: string
  createdAt: string
}

export interface PlatformAnnouncement {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "alert" | "success"
  targetAudience: "all" | "job_seekers" | "recruiters"
  isActive: boolean
  createdAt: string
}

export type AdminSubRole =
  | "Super Admin"
  | "User Management Admin"
  | "Job Moderation Admin"
  | "Company Verification Admin"
  | "Support Admin"
  | "Finance Admin"
  | "Content Admin"

