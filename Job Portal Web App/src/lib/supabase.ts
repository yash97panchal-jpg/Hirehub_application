import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type {
  User,
  Company,
  Job,
  Application,
  ExternalApplyClick,
  JobReport,
  CompanyMember,
  FilterState,
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
  COMPANIES: "hirehub_supabase_companies_v4",
  JOBS: "hirehub_supabase_jobs_v4",
  APPLICATIONS: "hirehub_supabase_applications_v4",
  CLICKS: "hirehub_supabase_clicks_v4",
  REPORTS: "hirehub_supabase_reports_v4",
  MEMBERS: "hirehub_supabase_members_v4",
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
          ? j.company.website || "https://careers.example.com/apply"
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

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

  async signInWithGoogle(account?: { email: string; name?: string }) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
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
    const email = account?.email || "google.user@example.com"
    const mockUser: User = {
      id: "usr-google-" + Date.now(),
      name,
      email,
      role: "job_seeker",
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
      // Cascade deletes profile, applications, saved jobs via foreign keys
      const { error } = await supabase.from("profiles").delete().eq("id", userId)
      if (error) throw error
      await supabase.auth.signOut()
    }
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
// APPLICATIONS SERVICE (In-App Easy Apply & External Tracking)
// -----------------------------------------------------------------------------
export const applicationService = {
  async submitApplication(application: {
    jobId: string
    userId: string
    resumeFile: string
    coverLetter?: string
    answers?: Record<string, string>
    job: Job
    applicant: User
  }): Promise<Application> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("applications")
        .insert({
          job_id: application.jobId,
          user_id: application.userId,
          resume_file: application.resumeFile,
          cover_letter: application.coverLetter,
          answers: application.answers || {},
          status: "Applied",
        })
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already applied for this job.")
        }
        throw error
      }

      return {
        id: data.id,
        jobId: application.jobId,
        job: application.job,
        userId: application.userId,
        applicant: application.applicant,
        status: data.status,
        resumeUrl: data.resume_file,
        coverLetter: data.cover_letter,
        answers: data.answers,
        source: "easy",
        appliedAt: data.created_at,
        updatedAt: data.updated_at,
      }
    }

    // Local Mock Fallback
    const stored = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const exists = stored.some((a) => a.job.id === application.jobId && a.applicant.id === application.userId)
    if (exists) {
      throw new Error("You have already submitted an application for this position.")
    }

    const newApp: Application = {
      id: "app-" + Date.now(),
      jobId: application.jobId,
      job: application.job,
      userId: application.userId,
      applicant: application.applicant,
      status: "Applied",
      resumeUrl: application.resumeFile,
      coverLetter: application.coverLetter,
      answers: application.answers,
      source: "easy",
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setStored(STORAGE_KEYS.APPLICATIONS, [newApp, ...stored])
    return newApp
  },

  async getSeekerApplications(userId: string): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("applications")
        .select("*, job:jobs(*, company:companies(*))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        jobId: row.job_id,
        job: formatJobFromDb(row.job),
        userId: row.user_id,
        applicant: { id: row.user_id } as any,
        status: row.status,
        resumeUrl: row.resume_file,
        coverLetter: row.cover_letter,
        answers: row.answers,
        source: "easy",
        appliedAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }

    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    return all.filter((a) => a.userId === userId || a.applicant.id === userId)
  },

  async getUserApplications(userId: string): Promise<Application[]> {
    return this.getSeekerApplications(userId)
  },

  async getCompanyApplications(companyId: string): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("applications")
        .select("*, job:jobs!inner(*), applicant:profiles(*)")
        .eq("job.company_id", companyId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []).map((row: any) => ({
        id: row.id,
        jobId: row.job_id,
        job: formatJobFromDb(row.job),
        userId: row.user_id,
        applicant: row.applicant || { id: row.user_id, name: "Applicant", email: "applicant@hirehub.app" },
        status: row.status,
        resumeUrl: row.resume_file,
        coverLetter: row.cover_letter,
        answers: row.answers,
        notes: row.notes,
        atsScore: row.ats_score,
        appliedAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }

    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    return all.filter((a) => a.job.company.id === companyId || (a.job as any).companyId === companyId)
  },

  async updateStatus(applicationId: string, status: Application["status"], notes?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const payload: any = { status, updated_at: new Date().toISOString() }
      if (notes !== undefined) payload.notes = notes

      const { error } = await supabase.from("applications").update(payload).eq("id", applicationId)
      if (error) throw error
      return
    }

    const all = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, [])
    const updated = all.map((a) => (a.id === applicationId ? { ...a, status, notes: notes ?? a.notes } : a))
    setStored(STORAGE_KEYS.APPLICATIONS, updated)
  },

  async withdrawApplication(applicationId: string): Promise<void> {
    return this.updateStatus(applicationId, "Withdrawn")
  },
}

// -----------------------------------------------------------------------------
// EXTERNAL APPLY TRACKING SERVICE
// -----------------------------------------------------------------------------
export const externalApplyService = {
  async logClick(jobId: string, userId?: string): Promise<string> {
    const clickId = "click-" + Date.now()
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("external_apply_clicks")
        .insert({
          job_id: jobId,
          user_id: userId || null,
        })
        .select()
        .single()
      return data?.id || clickId
    }

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

  async confirmApplication(clickId: string, status: "applied" | "not_applied"): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("external_apply_clicks")
        .update({ user_confirmed: status })
        .eq("id", clickId)
      return
    }

    const clicks = getStored<ExternalApplyClick[]>(STORAGE_KEYS.CLICKS, [])
    const updated = clicks.map((c) => (c.id === clickId ? { ...c, userConfirmed: status } : c))
    setStored(STORAGE_KEYS.CLICKS, updated)
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
// STORAGE SERVICE (Private Resumes with Signed URLs)
// -----------------------------------------------------------------------------
export const storageService = {
  async uploadResume(file: File, userId: string): Promise<string> {
    // Validate size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      throw new Error("File exceeds maximum allowed size of 5 MB.")
    }

    // Validate mime type (PDF / DOCX)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      throw new Error("Invalid file type. Only PDF and DOCX files are permitted.")
    }

    const fileExt = file.name.split(".").pop()
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
// TRUST, SAFETY & MODERATION SERVICE
// -----------------------------------------------------------------------------
export const moderationService = {
  async reportJob(jobId: string, reason: string, details?: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("job_reports").insert({
        job_id: jobId,
        reason,
        details,
        user_id: userId || null,
      })
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

  async getReports(): Promise<JobReport[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("job_reports")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    }

    return getStored<JobReport[]>(STORAGE_KEYS.REPORTS, [])
  },

  async updateReportStatus(reportId: string, status: "pending" | "reviewed" | "dismissed"): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("job_reports").update({ status }).eq("id", reportId)
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
