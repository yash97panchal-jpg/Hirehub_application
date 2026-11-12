import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Application, ApplicationStatus } from "../types"
import { worldwideOpenPositions } from "../data/worldwideJobs"

const googleJob = worldwideOpenPositions.find((j) => j.company.id === "comp-google") || worldwideOpenPositions[0]
const stripeJob = worldwideOpenPositions.find((j) => j.company.id === "comp-stripe") || worldwideOpenPositions[1]
const swiggyJob = worldwideOpenPositions.find((j) => j.company.id === "comp-swiggy") || worldwideOpenPositions[2]

const initialApplications: Application[] = [
  {
    id: "app-seed-1",
    applicationCode: "APP-20261108-0101",
    applicationNumber: "APP-20261108-0101",
    jobId: googleJob?.id || "seed-1",
    job: googleJob,
    status: "Interview Scheduled",
    resumeUrl: "/sample-resume.pdf",
    coverLetter: "Excited to contribute to high-scale infrastructure and frontier distributed AI clusters at Google.",
    source: "easy",
    fullName: "Alex Morgan",
    email: "candidate@hirehub.com",
    mobileNumber: "+1 (555) 349-8821",
    currentLocation: "San Francisco, CA",
    highestEducation: "Master of Science in Computer Science",
    highestQualification: "Master of Science in Computer Science",
    totalExperience: "6 years",
    workExperience: "6 years",
    currentEmploymentStatus: "Employed",
    expectedSalary: "$175,000 / yr",
    noticePeriod: "2 weeks",
    linkedinUrl: "https://linkedin.com/in/alex-morgan-dev",
    portfolioUrl: "https://github.com/alexmorgan",
    skills: ["React", "TypeScript", "Node.js", "Distributed Systems", "GraphQL"],
    answers: {
      "Years of Distributed Systems experience?": "6+ years",
      "Comfortable with on-call rotation?": "Yes",
    },
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicant: {
      id: "usr-demo",
      name: "Alex Morgan",
      email: "candidate@hirehub.com",
      role: "job_seeker",
      headline: "Senior Full Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop",
      skills: ["React", "TypeScript", "Node.js", "Distributed Systems"],
      profileCompletion: 95,
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "app-seed-2",
    applicationCode: "APP-20261106-0102",
    applicationNumber: "APP-20261106-0102",
    jobId: stripeJob?.id || "seed-2",
    job: stripeJob,
    status: "Shortlisted",
    resumeUrl: "/sample-resume.pdf",
    coverLetter: "Strong background in payment state machines, idempotency, and high-volume transaction routing.",
    source: "easy",
    fullName: "Alex Morgan",
    email: "candidate@hirehub.com",
    mobileNumber: "+1 (555) 349-8821",
    currentLocation: "San Francisco, CA",
    highestEducation: "Master of Science in Computer Science",
    highestQualification: "Master of Science in Computer Science",
    totalExperience: "6 years",
    workExperience: "6 years",
    currentEmploymentStatus: "Employed",
    expectedSalary: "$170,000 / yr",
    noticePeriod: "1 month",
    linkedinUrl: "https://linkedin.com/in/alex-morgan-dev",
    portfolioUrl: "https://github.com/alexmorgan",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Fintech"],
    answers: {
      "Experience with idempotent payment processing?": "Built high throughput ledger processing engines.",
    },
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applicant: {
      id: "usr-demo",
      name: "Alex Morgan",
      email: "candidate@hirehub.com",
      role: "job_seeker",
      headline: "Senior Full Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop",
      skills: ["React", "TypeScript", "Node.js", "Distributed Systems"],
      profileCompletion: 95,
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "app-seed-3",
    applicationCode: "APP-20261109-0103",
    applicationNumber: "APP-20261109-0103",
    jobId: swiggyJob?.id || "seed-3",
    job: swiggyJob,
    status: "Applied",
    resumeUrl: "/sample-resume.pdf",
    coverLetter: "Passionate about low-latency geospatial dispatch intelligence and microservices.",
    source: "easy",
    fullName: "Alex Morgan",
    email: "candidate@hirehub.com",
    mobileNumber: "+1 (555) 349-8821",
    currentLocation: "San Francisco, CA",
    highestEducation: "Master of Science in Computer Science",
    highestQualification: "Master of Science in Computer Science",
    totalExperience: "6 years",
    workExperience: "6 years",
    currentEmploymentStatus: "Employed",
    expectedSalary: "$160,000 / yr",
    noticePeriod: "Immediate",
    linkedinUrl: "https://linkedin.com/in/alex-morgan-dev",
    portfolioUrl: "https://github.com/alexmorgan",
    skills: ["React", "TypeScript", "Kafka", "Redis"],
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicant: {
      id: "usr-demo",
      name: "Alex Morgan",
      email: "candidate@hirehub.com",
      role: "job_seeker",
      headline: "Senior Full Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop",
      skills: ["React", "TypeScript", "Node.js", "Distributed Systems"],
      profileCompletion: 95,
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
  },
]

interface ApplicationState {
  applications: Application[]
  setApplications: (applications: Application[]) => void
  addApplication: (application: Application) => void
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => void
  withdrawApplication: (id: string) => void
  getApplicationsByJobId: (jobId: string) => Application[]
  refreshApplications: () => void
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: initialApplications,
      setApplications: (applications) => set({ applications }),
      refreshApplications: () => {
        try {
          const raw = localStorage.getItem("hirehub_applications_v3")
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed) && parsed.length > 0) {
              set({ applications: parsed })
            }
          }
        } catch {}
      },
      addApplication: (application) =>
        set((state) => {
          const targetJobId = application.job?.id || application.jobId
          const existingIndex = state.applications.findIndex(
            (a) => a.id === application.id || ((a.job?.id || a.jobId) === targetJobId)
          )
          if (existingIndex >= 0) {
            const updated = [...state.applications]
            updated[existingIndex] = {
              ...application,
              status: "Applied",
              updatedAt: new Date().toISOString(),
            }
            return { applications: updated }
          }
          return { applications: [application, ...state.applications] }
        }),
      updateApplicationStatus: (id, status, notes) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, status, notes: notes !== undefined ? notes : a.notes, updatedAt: new Date().toISOString() } : a
          ),
        })),
      withdrawApplication: (id) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? { ...a, status: "Withdrawn" as ApplicationStatus, updatedAt: new Date().toISOString() } : a
          ),
        })),
      getApplicationsByJobId: (jobId) =>
        get().applications.filter((app) => (app.job?.id || app.jobId) === jobId),
    }),
    {
      name: "application-storage-v3",
    }
  )
)
