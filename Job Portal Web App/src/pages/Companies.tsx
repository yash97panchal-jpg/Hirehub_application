import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  Star,
  MapPin,
  Users,
  Briefcase,
  CheckCircle,
  Building,
} from "lucide-react"
import Badge from "../components/ui/Badge"
import { mockCompanies } from "../data/mockData"
import { useJobStore } from "../store/jobStore"
import { isLocalhost } from "../utils/env"
import type { Company } from "../types"

const industries = [
  "All",
  "Technology",
  "Design",
  "Fintech",
  "CleanTech",
  "Healthcare",
  "Media",
]
const sizes = ["All", "1-50", "51-200", "200-1000", "1000+"]

export default function Companies() {
  const [search, setSearch] = useState("")
  const [industry, setIndustry] = useState("All")
  const [size, setSize] = useState("All")
  const { jobs } = useJobStore()

  // On localhost show mock companies. On live server, extract real companies from posted jobs.
  const companiesList = useMemo<Company[]>(() => {
    if (isLocalhost()) {
      return mockCompanies
    }
    const map = new Map<string, Company>()
    jobs.forEach((j) => {
      if (j.company && j.company.id && !map.has(j.company.id)) {
        map.set(j.company.id, j.company)
      }
    })
    return Array.from(map.values())
  }, [jobs])

  const filtered = companiesList.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false
    if (industry !== "All" && c.industry !== industry) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, #1A0924 55%, var(--primary-deep) 100%)",
        }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-poppins text-4xl font-bold text-white mb-3">
            Explore Top Companies
          </h1>
          <p className="text-white/80 mb-8">
            Discover culture, reviews, and open roles at 3,200+ leading
            employers.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies…"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm text-[var(--muted-foreground)] self-center mr-2">
            Industry:
          </span>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                industry === ind
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={`/companies/${company.id}`}
                className="block bg-[var(--card)] rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-elevated)] transition-all duration-200 overflow-hidden group"
              >
                {/* Banner */}
                <div className="h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] relative overflow-hidden">
                  {company.banner && (
                    <img
                      src={company.banner}
                      alt=""
                      className="w-full h-full object-cover opacity-60"
                    />
                  )}
                </div>
                {/* Content */}
                <div className="p-4 -mt-8 relative">
                  <div className="w-16 h-16 rounded-xl bg-[var(--card)] ring-4 ring-[var(--card)] overflow-hidden mb-3 shadow-[var(--shadow-card)]">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[var(--primary)] bg-[var(--muted)]">
                        {company.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-poppins font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {company.name}
                        </h3>
                        {company.isVerified && (
                          <CheckCircle
                            size={14}
                            className="text-[var(--primary)] shrink-0"
                          />
                        )}
                      </div>
                      <Badge variant="default" size="sm" className="mt-1">
                        {company.industry}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-[var(--foreground)] shrink-0">
                      <Star
                        size={13}
                        className="fill-[var(--accent)] text-[var(--accent)]"
                      />
                      {company.rating}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2 line-clamp-2">
                    {company.about}
                  </p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <MapPin size={11} /> {company.location.split(",")[0]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Briefcase size={11} /> {company.jobCount} jobs
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Users size={11} /> {company.size}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 max-w-lg mx-auto">
            <Building size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
            <h3 className="font-bold text-base text-[var(--foreground)]">No companies found</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {isLocalhost()
                ? "Try adjusting your search query or industry filter."
                : "No company profiles registered yet. Once recruiters post jobs, their companies will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
