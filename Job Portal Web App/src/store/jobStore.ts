import { create } from "zustand"
import { persist } from "zustand/middleware"
import { mockJobs } from "../data/mockData"
import type { Job, JobStatus } from "../types"

interface JobState {
  jobs: Job[]
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void
  duplicateJob: (id: string) => Job | null
  toggleFeaturedJob: (id: string) => void
  toggleStatus: (id: string, status: JobStatus) => void
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: mockJobs,
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        })),
      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
        })),
      duplicateJob: (id) => {
        const job = get().jobs.find((j) => j.id === id)
        if (!job) return null
        const duplicated: Job = {
          ...job,
          id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: `${job.title} (Copy)`,
          postedAt: new Date().toISOString(),
          applicationCount: 0,
          status: "draft",
        }
        set((state) => ({ jobs: [duplicated, ...state.jobs] }))
        return duplicated
      },
      toggleFeaturedJob: (id) =>
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id ? { ...j, isFeatured: !j.isFeatured } : j
          ),
        })),
      toggleStatus: (id, status) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, status } : j)),
        })),
    }),
    {
      name: "hirehub-jobs-v12",
    }
  )
)
