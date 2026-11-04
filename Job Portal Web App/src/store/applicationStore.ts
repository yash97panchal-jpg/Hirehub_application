import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Application } from "../types"
import { worldwideOpenPositions } from "../data/worldwideJobs"

const googleJob = worldwideOpenPositions.find((j) => j.company.id === "comp-google") || worldwideOpenPositions[0]
const stripeJob = worldwideOpenPositions.find((j) => j.company.id === "comp-stripe") || worldwideOpenPositions[1]
const swiggyJob = worldwideOpenPositions.find((j) => j.company.id === "comp-swiggy") || worldwideOpenPositions[2]

const initialApplications: Application[] = [
  {
    id: "app-seed-1",
    jobId: googleJob?.id || "seed-1",
    job: googleJob,
    status: "Interview",
    resumeUrl: "/sample-resume.pdf",
    coverLetter: "Excited to contribute to high-scale infrastructure and frontier distributed AI clusters at Google.",
    source: "easy",
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
    jobId: stripeJob?.id || "seed-2",
    job: stripeJob,
    status: "Shortlisted",
    resumeUrl: "/sample-resume.pdf",
    coverLetter: "Strong background in payment state machines, idempotency, and high-volume transaction routing.",
    source: "easy",
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
    jobId: swiggyJob?.id || "seed-3",
    job: swiggyJob,
    status: "Applied",
    resumeUrl: "/sample-resume.pdf",
    coverLetter: "Passionate about low-latency geospatial dispatch intelligence and microservices.",
    source: "easy",
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
  getApplicationsByJobId: (jobId: string) => Application[]
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: initialApplications,
      setApplications: (applications) => set({ applications }),
      addApplication: (application) =>
        set((state) => ({ applications: [application, ...state.applications] })),
      getApplicationsByJobId: (jobId) =>
        get().applications.filter((app) => app.job.id === jobId),
    }),
    {
      name: "application-storage-v3",
    }
  )
)
