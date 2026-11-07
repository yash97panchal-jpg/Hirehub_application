import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Briefcase,
  List,
  Sparkles,
  Building2,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import JobCard from "../components/ui/JobCard"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import RoleSearchInput from "../components/ui/RoleSearchInput"
import LocationSearchInput from "../components/ui/LocationSearchInput"
import { useJobStore } from "../store/jobStore"
import type { Job, JobType, ExperienceLevel } from "../types"
import { matchLocationQuery } from "../data/locationCatalog"

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
  const { jobs: storeJobs } = useJobStore()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize state from URL params
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword)
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [companyParam, setCompanyParam] = useState(searchParams.get("company") || "")
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>(
    searchParams.getAll("type") as JobType[],
  )
  const [selectedExp, setSelectedExp] = useState<ExperienceLevel[]>(
    searchParams.getAll("exp") as ExperienceLevel[],
  )
  const [datePosted, setDatePosted] = useState(searchParams.get("date") || "")
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "salary">(
    (searchParams.get("sort") as any) || "relevance",
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [salaryMin, setSalaryMin] = useState(
    Number(searchParams.get("salary")) || 0,
  )
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get("page") || "1", 10)
    return isNaN(p) || p < 1 ? 1 : p
  })

  // Debounce keyword
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300)
    return () => clearTimeout(timer)
  }, [keyword])

  // Sync from URL (e.g. when clicking a Navbar link while already on /jobs)
  useEffect(() => {
    const urlCat = searchParams.get("category") || ""
    if (urlCat !== category) {
      setCategory(urlCat)
    }
  }, [searchParams])

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedKeyword) params.set("keyword", debouncedKeyword)
    if (location) params.set("location", location)
    if (category) params.set("category", category)
    selectedTypes.forEach((t) => params.append("type", t))
    selectedExp.forEach((e) => params.append("exp", e))
    if (datePosted) params.set("date", datePosted)
    if (sortBy !== "relevance") params.set("sort", sortBy)
    if (salaryMin > 0) params.set("salary", salaryMin.toString())
    if (currentPage > 1) params.set("page", currentPage.toString())

    setSearchParams(params, { replace: true })
  }, [
    debouncedKeyword,
    location,
    category,
    selectedTypes,
    selectedExp,
    datePosted,
    sortBy,
    salaryMin,
    currentPage,
    setSearchParams,
  ])

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1)
  }, [
    debouncedKeyword,
    location,
    category,
    companyParam,
    selectedTypes,
    selectedExp,
    datePosted,
    sortBy,
    salaryMin,
  ])

  const toggleType = (t: JobType) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )

  const toggleExp = (e: ExperienceLevel) =>
    setSelectedExp((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    )

  const filtered = useMemo(() => {
    let jobs = [...storeJobs]
    if (debouncedKeyword) {
      const kw = debouncedKeyword.toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(kw) ||
          j.company.name.toLowerCase().includes(kw) ||
          j.skills.some((s) => s.toLowerCase().includes(kw)) ||
          (j.category && j.category.toLowerCase().includes(kw)),
      )
    }
    if (location) {
      const loc = location.toLowerCase().trim()
      if (loc === "remote") {
        jobs = jobs.filter((j) => j.isRemote || j.remoteType === "Remote" || (j.location || "").toLowerCase().includes("remote"))
      } else {
        jobs = jobs.filter((j) => {
          return (
            matchLocationQuery(location, j.location, j.address) ||
            matchLocationQuery(location, j.company?.location || "", j.company?.address)
          )
        })
      }
    }
    if (category) {
      const cat = category.toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.category &&
          (j.category.toLowerCase() === cat ||
            j.category.toLowerCase().includes(cat)),
      )
    }
    if (companyParam) {
      const cmp = companyParam.toLowerCase()
      jobs = jobs.filter((j) => j.company.name.toLowerCase().includes(cmp))
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
    debouncedKeyword,
    location,
    category,
    companyParam,
    selectedTypes,
    selectedExp,
    salaryMin,
    datePosted,
    sortBy,
    storeJobs,
  ])

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filtered.length)
  const paginatedJobs = useMemo(() => {
    return filtered.slice(startIndex, endIndex)
  }, [filtered, startIndex, endIndex])

  const paginationRange = useMemo(() => {
    const delta = 1
    const range: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i)
      return range
    }

    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    range.push(1)
    if (left > 2) range.push("...")
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 1) range.push("...")
    range.push(totalPages)

    return range
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    const el = document.getElementById("job-results-container")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      window.scrollTo({ top: 320, behavior: "smooth" })
    }
  }

  const clearAll = () => {
    setKeyword("")
    setLocation("")
    setCategory("")
    setCompanyParam("")
    setSelectedTypes([])
    setSelectedExp([])
    setSalaryMin(0)
    setDatePosted("")
    setCurrentPage(1)
  }

  const activeFilterCount =
    selectedTypes.length +
    selectedExp.length +
    (salaryMin > 0 ? 1 : 0) +
    (datePosted ? 1 : 0) +
    (category ? 1 : 0) +
    (companyParam ? 1 : 0)

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 w-full max-w-full overflow-x-hidden">
      {/* Search Header Bar */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, #1A0924 55%, var(--primary-deep) 100%)",
        }}
        className="py-8 border-b border-[var(--border)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--primary)] flex items-center gap-1.5 mb-1">
                <Sparkles size={14} /> Global Job Portal & Career Discovery
              </span>
              <h1 className="font-poppins text-2xl sm:text-3xl font-extrabold text-white">
                Find Your Next Opportunity
              </h1>
              <p className="text-xs sm:text-sm text-white/75 mt-1">
                Search and discover verified career opportunities worldwide
              </p>
            </div>

            {/* List View Indicator */}
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 text-white text-xs font-semibold backdrop-blur-md self-start sm:self-auto">
              <List size={14} />
              <span>List View</span>
            </div>
          </div>

          {/* Search Inputs: Role Search & Location Search with Autocomplete */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 1. Search Role with Role/Skill Suggestions */}
            <RoleSearchInput
              value={keyword}
              onChange={setKeyword}
              variant="dark"
              placeholder="Search role, skills (e.g. Python Developer, React, PyTorch)…"
              inputClassName="py-3 pl-11"
            />

            {/* 2. Search Location with 3-Tier Hierarchy (Country -> State -> City) */}
            <LocationSearchInput
              value={location}
              onChange={setLocation}
              variant="dark"
              className="sm:w-96"
              placeholder="Search country, state, or city (e.g. India, California, San Francisco)…"
              inputClassName="py-3 pl-11"
            />

            {(keyword || location) && (
              <button
                onClick={() => {
                  setKeyword("")
                  setLocation("")
                }}
                className="px-5 py-3 rounded-xl bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside
              className={`lg:w-72 shrink-0 ${
                filtersOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sticky top-24 shadow-[var(--shadow-card)]">
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

                {/* Category */}
                <div className="mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                    Category
                  </h3>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] capitalize"
                  >
                    <option value="">All Categories</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="product">Product</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                    <option value="data science">Data Science</option>
                  </select>
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

            {/* Job List Main Column */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div
                id="job-results-container"
                className="flex items-center justify-between mb-5 flex-wrap gap-3 scroll-mt-28"
              >
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
                    Showing{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {filtered.length === 0 ? 0 : startIndex + 1}–{endIndex}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {filtered.length}
                    </span>{" "}
                    jobs found
                    {location && (
                      <span>
                        {" "}
                        in{" "}
                        <strong className="text-[var(--foreground)]">
                          {location}
                        </strong>
                      </span>
                    )}
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
              {(selectedTypes.length > 0 ||
                selectedExp.length > 0 ||
                category ||
                location) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {location && (
                    <Badge variant="primary" className="cursor-pointer inline-flex items-center gap-1">
                      <MapPin size={11} /> {location}
                      <X
                        size={10}
                        className="ml-1"
                        onClick={() => setLocation("")}
                      />
                    </Badge>
                  )}
                  {category && (
                    <Badge
                      variant="primary"
                      className="cursor-pointer capitalize"
                    >
                      {category}{" "}
                      <X
                        size={10}
                        className="ml-1"
                        onClick={() => setCategory("")}
                      />
                    </Badge>
                  )}
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

              {/* Job Cards */}
              {filtered.length > 0 ? (
                <>
                  <div className="grid gap-4">
                    {paginatedJobs.map((job, i) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                      >
                        <JobCard job={job} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Bar - Below the last job */}
                  {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Page Counter & Per-page selector */}
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--muted-foreground)]">
                        <span>
                          Page <strong className="text-[var(--foreground)]">{currentPage}</strong> of{" "}
                          <strong className="text-[var(--foreground)]">{totalPages}</strong>
                        </span>
                        <span className="text-[var(--border)]">|</span>
                        <div className="flex items-center gap-1.5">
                          <span>Per page:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value))
                              setCurrentPage(1)
                            }}
                            className="text-xs bg-[var(--card)] border border-[var(--border)] rounded-md px-2 py-1 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                          >
                            <option value={8}>8</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                          </select>
                        </div>
                      </div>

                      {/* Page Numbers and Navigation */}
                      <nav aria-label="Job Results Pagination" className="flex items-center gap-1 sm:gap-1.5">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors shadow-sm"
                          aria-label="Previous page"
                        >
                          <ChevronLeft size={16} />
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        {paginationRange.map((page, idx) => {
                          if (typeof page === "string") {
                            return (
                              <span
                                key={`ellipsis-${idx}`}
                                className="px-2 py-1 text-xs text-[var(--muted-foreground)] select-none"
                              >
                                ...
                              </span>
                            )
                          }
                          const isActive = page === currentPage
                          return (
                            <button
                              key={page}
                              type="button"
                              onClick={() => handlePageChange(page)}
                              className={`min-w-8 sm:min-w-9 h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                isActive
                                  ? "bg-[var(--primary)] text-white shadow-sm shadow-[var(--primary)]/30 font-bold"
                                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                              }`}
                              aria-current={isActive ? "page" : undefined}
                            >
                              {page}
                            </button>
                          )
                        })}

                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs sm:text-sm font-medium hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors shadow-sm"
                          aria-label="Next page"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight size={16} />
                        </button>
                      </nav>
                    </div>
                  )}
                </>
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
