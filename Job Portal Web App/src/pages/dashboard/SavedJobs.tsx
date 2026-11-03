import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Bookmark,
  Search,
  SlidersHorizontal,
  Briefcase,
  ArrowRight,
  Trash2,
  X,
  Compass,
  Building2,
  CheckCircle,
} from "lucide-react"
import JobCard from "../../components/ui/JobCard"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import { useJobStore } from "../../store/jobStore"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import type { Job } from "../../types"
import toast from "react-hot-toast"

const typeFilterOptions = ["All", "Full-time", "Remote", "Contract", "Internship"]

export default function SavedJobs() {
  const { jobs } = useJobStore()
  const { savedJobIds, clearSavedJobs } = useSavedJobsStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")

  // Resolve saved job IDs into real Job objects, preserving recent save order
  const savedJobs = useMemo(() => {
    return savedJobIds
      .map((id) => jobs.find((j) => j.id === id))
      .filter((j): j is Job => Boolean(j))
  }, [savedJobIds, jobs])

  // Filter based on search input and job type filter
  const filteredJobs = useMemo(() => {
    return savedJobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.name.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.skills.some((skill) => skill.toLowerCase().includes(q))

      const matchesType =
        selectedType === "All" ||
        job.type.toLowerCase().includes(selectedType.toLowerCase())

      return matchesSearch && matchesType
    })
  }, [savedJobs, searchQuery, selectedType])

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all saved jobs?")) {
      clearSavedJobs()
      toast.success("All saved jobs removed")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <Bookmark size={22} className="fill-[var(--primary)]/20" />
              </div>
              <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)]">
                Saved Jobs
              </h1>
              {savedJobs.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--primary)] text-white dark:text-[#12051B]">
                  {savedJobs.length}
                </span>
              )}
            </div>
            <p className="text-[var(--muted-foreground)] mt-2">
              {savedJobs.length === 0
                ? "Manage and track all positions you have bookmarked for later."
                : `You have ${savedJobs.length} saved job${
                    savedJobs.length === 1 ? "" : "s"
                  } in your personal collection.`}
            </p>
          </div>

          {savedJobs.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 size={15} className="mr-1.5" />
                Clear All
              </Button>
              <Link to="/jobs">
                <Button variant="primary" size="sm">
                  <Compass size={15} className="mr-1.5" />
                  Explore More Jobs
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Empty state when NO jobs are saved at all */}
        {savedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4 max-w-lg mx-auto border border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)]/50"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} />
            </div>
            <h2 className="font-poppins text-xl font-bold text-[var(--foreground)] mb-2">
              No Saved Jobs Yet
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">
              As you browse jobs across HireHub, tap the bookmark icon on any job card or job page to save opportunities here.
            </p>
            <Link to="/jobs">
              <Button variant="primary" size="md" className="mx-auto">
                <Briefcase size={16} className="mr-2" />
                Find Jobs Now
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Search and Filters Bar */}
            <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, company, or skill..."
                  className="w-full pl-10 pr-9 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Type Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {typeFilterOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedType === type
                        ? "bg-[var(--primary)] text-white dark:text-[#12051B] font-semibold shadow-xs"
                        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* If filters yield no results */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]/30">
                <Search
                  size={36}
                  className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-60"
                />
                <h3 className="font-poppins font-bold text-base text-[var(--foreground)] mb-1">
                  No matching saved jobs found
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mb-4">
                  We couldn't find any saved jobs matching "{searchQuery}". Try a different keyword or reset filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedType("All")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              /* Saved Jobs Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.25 }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
