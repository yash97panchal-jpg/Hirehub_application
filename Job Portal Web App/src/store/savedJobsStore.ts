import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SavedJobsState {
  savedJobIds: string[]
  saveJob: (jobId: string) => void
  unsaveJob: (jobId: string) => void
  toggleSaveJob: (jobId: string) => boolean
  isJobSaved: (jobId: string) => boolean
  clearSavedJobs: () => void
}

export const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedJobIds: ["1", "3"], // Seed with 2 real featured jobs for instant demo; syncs with user clicks
      saveJob: (jobId) =>
        set((state) => ({
          savedJobIds: state.savedJobIds.includes(jobId)
            ? state.savedJobIds
            : [jobId, ...state.savedJobIds],
        })),
      unsaveJob: (jobId) =>
        set((state) => ({
          savedJobIds: state.savedJobIds.filter((id) => id !== jobId),
        })),
      toggleSaveJob: (jobId) => {
        const currentIds = get().savedJobIds
        const isSaved = currentIds.includes(jobId)
        if (isSaved) {
          set({ savedJobIds: currentIds.filter((id) => id !== jobId) })
          return false
        } else {
          set({ savedJobIds: [jobId, ...currentIds] })
          return true
        }
      },
      isJobSaved: (jobId) => get().savedJobIds.includes(jobId),
      clearSavedJobs: () => set({ savedJobIds: [] }),
    }),
    {
      name: "hirehub-saved-jobs-v1",
    }
  )
)
