import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Application } from "../types"

interface ApplicationState {
  applications: Application[]
  setApplications: (applications: Application[]) => void
  addApplication: (application: Application) => void
  getApplicationsByJobId: (jobId: string) => Application[]
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: [],
      setApplications: (applications) => set({ applications }),
      addApplication: (application) =>
        set((state) => ({ applications: [application, ...state.applications] })),
      getApplicationsByJobId: (jobId) =>
        get().applications.filter((app) => app.job.id === jobId),
    }),
    {
      name: "application-storage",
    }
  )
)
