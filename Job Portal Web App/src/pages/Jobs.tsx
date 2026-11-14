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
  Check,
} from "lucide-react"
import JobCard from "../components/ui/JobCard"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import RoleSearchInput from "../components/ui/RoleSearchInput"
import LocationSearchInput from "../components/ui/LocationSearchInput"
import CustomSelect from "../components/ui/CustomSelect"
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

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "product", label: "Product" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR" },
  { value: "data science", label: "Data Science" },
  { value: "operations", label: "Operations" },
  { value: "legal", label: "Legal" },
]

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest Added" },
  { value: "salary", label: "Highest Salary" },
]

const pageSizeOptions = [
  { value: 8, label: "8 per page" },
  { value: 10, label: "10 per page" },
  { value: 15, label: "15 per page" },
  { value: 20, label: "20 per page" },
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

  const renderFilterBody = () => (
    <>
      {/* Category */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          Category
        </h3>
        <CustomSelect
          value={category}
          onChange={(val) => setCategory(String(val))}
          options={categoryOptions}
          placeholder="All Categories"
          icon={<Briefcase size={14} />}
        />
      </div>

      {/* Job Type */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
          Job Type
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {jobTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                selectedTypes.includes(t)
                  ? "bg-[#101F3E] text-white border-[#101F3E] dark:bg-[#F7941D] dark:border-[#F7941D] shadow-xs"
                  : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[#F7941D] hover:bg-orange-50/40 dark:hover:bg-orange-950/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          Experience Level
        </h3>
        <div className="space-y-1">
          {experienceLevels.map((e) => {
            const isChecked = selectedExp.includes(e)
            return (
              <button
                key={e}
                type="button"
                onClick={() => toggleExp(e)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left cursor-pointer group ${
                  isChecked
                    ? "bg-orange-50 dark:bg-orange-950/30 text-[#E8820A] font-semibold"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                }`}
              >
                <span className="text-xs">{e}</span>
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? "bg-[#F7941D] border-[#F7941D] text-white shadow-xs"
                      : "border-[var(--border)] bg-[var(--background)] group-hover:border-[#F7941D]"
                  }`}
                >
                  {isChecked && <Check size={11} strokeWidth={3} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Min Salary */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Min Salary
          </h3>
          <span className="text-xs font-bold text-[#E8820A] px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
            {salaryMin > 0 ? `$${(salaryMin / 1000).toFixed(0)}k+/yr` : "Any"}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="200000"
          step="10000"
          value={salaryMin}
          onChange={(e) => setSalaryMin(Number(e.target.value))}
          className="w-full accent-[#F7941D] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[var(--muted-foreground)] mt-1 font-mono">
          <span>$0</span>
          <span>$100k</span>
          <span>$200k+</span>
        </div>
      </div>

      {/* Date Posted */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          Date Posted
        </h3>
        <div className="space-y-1">
          {dateOptions.map((opt) => {
            const isSelected = datePosted === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDatePosted(opt.value)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left cursor-pointer group ${
                  isSelected
                    ? "bg-orange-50 dark:bg-orange-950/30 text-[#E8820A] font-semibold"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                }`}
              >
                <span className="text-xs">{opt.label}</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-[#F7941D] bg-[#F7941D]"
                      : "border-[var(--border)] bg-[var(--background)] group-hover:border-[#F7941D]"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 w-full max-w-full overflow-x-hidden">
      {/* Search Header Bar (30% Deep Symbol Navy Authority) */}
      <div className="py-8 bg-[#101F3E] border-b border-[#1E3563] relative overflow-hidden">
        {/* Subtle radial ambient gradients for premium SaaS look */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F7941D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#101F3E]/80 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#F7941D] flex items-center gap-1.5 mb-1.5">
                <Sparkles size={14} /> Career Discovery & Job Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Find Your Next Opportunity
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Explore thousands of verified roles at top global tech companies and high-growth startups
              </p>
            </div>

            {/* Total verified count pill */}
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15 text-white text-xs font-medium backdrop-blur-sm self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#F7941D] animate-pulse" />
              <span>{storeJobs.length} Active Positions</span>
            </div>
          </div>

          {/* Search Inputs: Role Search & Location Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <RoleSearchInput
              value={keyword}
              onChange={setKeyword}
              variant="dark"
              placeholder="Search role, title, or skills (e.g. Frontend Engineer, React, Python)…"
              inputClassName="py-3 pl-11 bg-white/10 border-white/20 text-white placeholder:text-slate-300 rounded-lg focus:ring-2 focus:ring-[#F7941D]"
            />

            <LocationSearchInput
              value={location}
              onChange={setLocation}
              variant="dark"
              className="sm:w-80"
              placeholder="Location or 'Remote'…"
              inputClassName="py-3 pl-11 bg-white/10 border-white/20 text-white placeholder:text-slate-300 rounded-lg focus:ring-2 focus:ring-[#F7941D]"
            />

            {(keyword || location) && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("")
                  setLocation("")
                }}
                className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold transition-colors shrink-0 border border-white/15"
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
            {/* Desktop Sidebar Filters */}
            <aside className="lg:w-72 shrink-0 hidden lg:block">
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 sticky top-24 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                    Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-[#F7941D] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <X size={12} /> Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>
                {renderFilterBody()}
              </div>
            </aside>

            {/* Mobile Slide-Up Filter Modal / Drawer */}
            {filtersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setFiltersOpen(false)}
                />
                <div className="relative z-10 bg-[var(--card)] border-t border-[var(--border)] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-[var(--primary)]" />
                      <h2 className="font-poppins font-bold text-base text-[var(--foreground)]">
                        Filters
                      </h2>
                      {activeFilterCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-xs text-[var(--primary)] font-semibold hover:underline mr-1 cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                      <button
                        onClick={() => setFiltersOpen(false)}
                        className="p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 overflow-y-auto space-y-2 flex-1">
                    {renderFilterBody()}
                  </div>

                  <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] shrink-0">
                    <Button
                      variant="primary"
                      className="w-full py-3 text-sm font-bold shadow-md"
                      onClick={() => setFiltersOpen(false)}
                    >
                      Show {filtered.length} Jobs
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Sort:
                  </span>
                  <CustomSelect
                    value={sortBy}
                    onChange={(val) => setSortBy(val)}
                    options={sortOptions}
                    size="sm"
                    className="w-36"
                    align="right"
                  />
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
                          <CustomSelect
                            value={pageSize}
                            onChange={(val) => {
                              setPageSize(Number(val))
                              setCurrentPage(1)
                            }}
                            options={pageSizeOptions}
                            size="sm"
                            className="w-28"
                          />
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
                                  ? "bg-[#F7941D] text-white shadow-xs font-bold"
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
                <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--card)] rounded-xl border border-[var(--border)] p-8">
                  <div className="w-16 h-16 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#E8820A] flex items-center justify-center mb-4">
                    <Briefcase size={28} />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--foreground)] mb-1.5">
                    No matching positions found
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-xs sm:text-sm max-w-sm mb-5">
                    We couldn't find any positions matching your exact criteria. Try broadening your keywords, location, or clearing applied filters.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
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
