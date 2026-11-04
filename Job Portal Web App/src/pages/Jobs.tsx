import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Briefcase,
  List,
  Map as MapIcon,
  Layers,
  Sparkles,
} from "lucide-react"
import JobCard from "../components/ui/JobCard"
import JobMap from "../components/jobs/JobMap"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
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

type ViewMode = "map" | "split" | "list"

export default function Jobs() {
  const { jobs: storeJobs } = useJobStore()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize state from URL params
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword)
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
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
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const jobCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Synchronize scroll: when a pin on the map is clicked, scroll the job list on the right straight to that position
  useEffect(() => {
    if (selectedJob && jobCardRefs.current[selectedJob.id]) {
      jobCardRefs.current[selectedJob.id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedJob])

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
    setSearchParams,
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
    selectedTypes,
    selectedExp,
    salaryMin,
    datePosted,
    sortBy,
    storeJobs,
  ])

  const clearAll = () => {
    setKeyword("")
    setLocation("")
    setCategory("")
    setSelectedTypes([])
    setSelectedExp([])
    setSalaryMin(0)
    setDatePosted("")
  }

  const activeFilterCount =
    selectedTypes.length +
    selectedExp.length +
    (salaryMin > 0 ? 1 : 0) +
    (datePosted ? 1 : 0) +
    (category ? 1 : 0)

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
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

            {/* View Mode Toggle Switcher: Split / List / Map */}
            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/20 self-start sm:self-auto backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "split"
                    ? "bg-[var(--accent)] text-white shadow-md font-bold"
                    : "text-white/80 hover:text-white"
                }`}
                title="Split View (Side-by-Side Map & Job List)"
              >
                <Layers size={14} />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "list"
                    ? "bg-[var(--accent)] text-white shadow-md font-bold"
                    : "text-white/80 hover:text-white"
                }`}
                title="List View (Full Job Board & Filters)"
              >
                <List size={14} />
                <span>List View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "map"
                    ? "bg-[var(--accent)] text-white shadow-md font-bold"
                    : "text-white/80 hover:text-white"
                }`}
                title="Map View (Only Map + Search Location + Search Role)"
              >
                <MapIcon size={14} />
                <span>Map View</span>
              </button>
            </div>
          </div>

          {/* Search Inputs: Role Search & Location Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 1. Search Role */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={18}
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search role (e.g. Frontend Developer, Data Scientist, DevOps, Designer)…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* 2. Search Location */}
            <div className="relative sm:w-80">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={18}
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search location or city (e.g. San Francisco, Austin, NY, London, India)…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

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

      {/* VIEW MODE 1: PURE MAP VIEW */}
      {viewMode === "map" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <JobMap
            jobs={filtered}
            selectedJob={selectedJob}
            onSelectJob={(j) => setSelectedJob(j)}
            activeLocation={location}
            onLocationChange={(loc) => setLocation(loc)}
            roleKeyword={debouncedKeyword || category}
            mapHeightClass="h-[580px] lg:h-[660px]"
          />
        </div>
      ) : viewMode === "split" ? (
        /* VIEW MODE 2: TRUE SPLIT VIEW (Side-by-Side Map & Job List) */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Map (sticky) */}
            <div className="lg:col-span-7 sticky top-24">
              <JobMap
                jobs={filtered}
                selectedJob={selectedJob}
                onSelectJob={(j) => setSelectedJob(j)}
                activeLocation={location}
                onLocationChange={(loc) => setLocation(loc)}
                roleKeyword={debouncedKeyword || category}
                mapHeightClass="h-[480px] lg:h-[600px]"
              />
            </div>

            {/* Right Column: Scrollable List of Job Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                  Open Positions ({filtered.length})
                </h3>
                {location && (
                  <span className="text-xs text-[var(--primary)] font-semibold">
                    📍 {location}
                  </span>
                )}
              </div>

              {filtered.length > 0 ? (
                <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
                  {filtered.map((job) => (
                    <div
                      key={job.id}
                      ref={(el) => {
                        jobCardRefs.current[job.id] = el
                      }}
                      onClick={() => setSelectedJob(job)}
                      className={`cursor-pointer transition-all rounded-2xl ${
                        selectedJob?.id === job.id
                          ? "ring-2 ring-[var(--primary)] shadow-lg"
                          : ""
                      }`}
                    >
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
                  <Briefcase
                    size={36}
                    className="text-[var(--muted-foreground)] mb-3"
                  />
                  <h4 className="font-bold text-sm text-[var(--foreground)] mb-1">
                    No openings match this exact location or role
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] max-w-xs mb-4">
                    Try entering another city or clearing your search filters.
                  </p>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Reset Search
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 3: STANDARD LIST VIEW (With Filter Sidebar) */
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
                    <Badge variant="primary" className="cursor-pointer">
                      📍 {location}{" "}
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
      )}
    </div>
  )
}
