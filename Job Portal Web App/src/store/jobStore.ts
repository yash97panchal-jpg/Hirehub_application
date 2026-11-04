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
      jobs: mockJobs,
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
    }),
    {
      name: "hirehub-jobs-v5",
    }
  )
)
