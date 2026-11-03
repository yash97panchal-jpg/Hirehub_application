import { create } from "zustand"
import { persist } from "zustand/middleware"
import { mockJobs } from "../data/mockData"
import type { Job } from "../types"
import { isLocalhost } from "../utils/env"

interface JobState {
  jobs: Job[]
  addJob: (job: Job) => void
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      // On localhost load mock jobs for development; on live server start clean with real data
      jobs: isLocalhost() ? mockJobs : [],
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
    }),
    {
      // Separate storage key for dev vs live production so live users never inherit cached dummy data
      name: isLocalhost() ? "job-storage-v3" : "hirehub-live-jobs",
    }
  )
)
