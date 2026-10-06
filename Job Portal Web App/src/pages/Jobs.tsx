import { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  ChevronDown,
  Briefcase,
} from "lucide-react"
import JobCard from "../components/ui/JobCard"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import { mockJobs } from "../data/mockData"
import type { JobType, ExperienceLevel } from "../types"

const jobTypes: JobType[] = [
  "Full-time",
  "Part-time",
  "Remote",
  "Hybrid",
  "Contract",
  "Freelance",
  "Internship",
  "On-site",
]
const experienceLevels: ExperienceLevel[] = [
  "Fresher",
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5+ years",
]
const dateOptions = [
  { label: "Any time", value: "" },
  { label: "Last 24 hours", value: "1" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
]

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([])
  const [selectedExp, setSelectedExp] = useState<ExperienceLevel[]>([])
  const [datePosted, setDatePosted] = useState("")
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "salary">(
    "relevance",
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [salaryMin, setSalaryMin] = useState(0)

  const toggleType = (t: JobType) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )

  const toggleExp = (e: ExperienceLevel) =>
    setSelectedExp((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    )

  const filtered = useMemo(() => {
    let jobs = [...mockJobs]
    if (keyword) {
      const kw = keyword.toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(kw) ||
          j.company.name.toLowerCase().includes(kw) ||
          j.skills.some((s) => s.toLowerCase().includes(kw)) ||
          j.category.toLowerCase().includes(kw),
      )
    }
    if (location) {
      const loc = location.toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.location.toLowerCase().includes(loc) ||
          (loc === "remote" && j.isRemote),
      )
    }
    if (selectedTypes.length > 0) {
      jobs = jobs.filter((j) => selectedTypes.includes(j.type))
    }
    if (selectedExp.length > 0) {
      jobs = jobs.filter((j) => selectedExp.includes(j.experience))
    }
    if (salaryMin > 0) {
      jobs = jobs.filter((j) => (j.salaryMin || 0) >= salaryMin)
    }
    if (datePosted) {
      const days = parseInt(datePosted)
      const cutoff = Date.now() - days * 86400000
      jobs = jobs.filter((j) => new Date(j.postedAt).getTime() >= cutoff)
    }

    if (sortBy === "newest") {
      jobs.sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      )
    } else if (sortBy === "salary") {
      jobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0))
    } else {
      jobs.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }
    return jobs
  }, [
    keyword,
    location,
    selectedTypes,
    selectedExp,
    salaryMin,
    datePosted,
    sortBy,
  ])

  const clearAll = () => {
    setKeyword("")
    setLocation("")
    setSelectedTypes([])
    setSelectedExp([])
    setSalaryMin(0)
    setDatePosted("")
  }

  const activeFilterCount =
    selectedTypes.length +
    selectedExp.length +
    (salaryMin > 0 ? 1 : 0) +
    (datePosted ? 1 : 0)

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      {/* Search Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #101F3E 0%, var(--primary) 100%)",
        }}
        className="py-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-poppins text-3xl font-bold text-white mb-6">
            Find Your Next Opportunity
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={18}
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skill, or company…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={18}
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or Remote…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--primary-deep)] font-bold text-sm hover:bg-[var(--accent-hover)] transition-colors shrink-0">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside
            className={`lg:w-72 shrink-0 ${
              filtersOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-poppins font-semibold text-[var(--foreground)]">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Job Type */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                  Job Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        selectedTypes.includes(t)
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-[var(--muted)] text-[var(--foreground)] border-transparent hover:border-[var(--primary)]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                  Experience
                </h3>
                <div className="space-y-2">
                  {experienceLevels.map((e) => (
                    <label
                      key={e}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExp.includes(e)}
                        onChange={() => toggleExp(e)}
                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        {e}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Min Salary */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                  Min Salary
                  {salaryMin > 0 && (
                    <span className="ml-2 text-[var(--primary)] normal-case font-normal">
                      ${(salaryMin / 1000).toFixed(0)}k+
                    </span>
                  )}
                </h3>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>$0</span>
                  <span>$200k</span>
                </div>
              </div>

              {/* Date Posted */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                  Date Posted
                </h3>
                <div className="space-y-2">
                  {dateOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="datePosted"
                        value={opt.value}
                        checked={datePosted === opt.value}
                        onChange={() => setDatePosted(opt.value)}
                        className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Job list */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] hover:border-[var(--primary)]"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">
                    {filtered.length}
                  </span>{" "}
                  jobs found
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {(selectedTypes.length > 0 || selectedExp.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTypes.map((t) => (
                  <Badge key={t} variant="primary" className="cursor-pointer">
                    {t}{" "}
                    <X
                      size={10}
                      className="ml-1"
                      onClick={() => toggleType(t)}
                    />
                  </Badge>
                ))}
                {selectedExp.map((e) => (
                  <Badge key={e} variant="default" className="cursor-pointer">
                    {e}{" "}
                    <X
                      size={10}
                      className="ml-1"
                      onClick={() => toggleExp(e)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Job cards */}
            {filtered.length > 0 ? (
              <div className="grid gap-4">
                {filtered.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[var(--muted)] flex items-center justify-center mb-4">
                  <Briefcase
                    size={36}
                    className="text-[var(--muted-foreground)]"
                  />
                </div>
                <h3 className="font-poppins font-bold text-xl text-[var(--foreground)] mb-2">
                  No jobs found
                </h3>
                <p className="text-[var(--muted-foreground)] text-sm max-w-xs">
                  Try adjusting your filters or search terms to find more
                  opportunities.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearAll}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
