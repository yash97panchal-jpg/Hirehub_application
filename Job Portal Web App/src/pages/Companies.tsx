import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Search,
  Star,
  MapPin,
  Users,
  Briefcase,
  BadgeCheck,
  Building,
  CheckCircle,
} from "lucide-react"
import Badge from "../components/ui/Badge"
import { companyService } from "../lib/supabase"
import { mockCompanies } from "../data/mockData"
import { getCompanyRealLogo } from "../data/companyLogos"
import type { Company } from "../types"

const industries = [
  "All",
  "Technology",
  "Design",
  "Fintech",
  "CleanTech",
  "Healthcare",
  "Media",
  "E-Commerce",
]

export default function Companies() {
  const [search, setSearch] = useState("")
  const [industry, setIndustry] = useState("All")
  const [companiesList, setCompaniesList] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCompanies() {
      setIsLoading(true)
      try {
        const comps = await companyService.getCompanies()
        if (comps && comps.length > 0) {
          setCompaniesList(
            comps.map((c) => ({
              ...c,
              logo: getCompanyRealLogo(c.name, c.website, c.logo),
            }))
          )
        } else {
          setCompaniesList(
            mockCompanies.map((c) => ({
              ...c,
              logo: getCompanyRealLogo(c.name, c.website, c.logo),
            }))
          )
        }
      } catch (err) {
        console.error("Error loading companies:", err)
        setCompaniesList(
          mockCompanies.map((c) => ({
            ...c,
            logo: getCompanyRealLogo(c.name, c.website, c.logo),
          }))
        )
      } finally {
        setIsLoading(false)
      }
    }
    loadCompanies()
  }, [])

  const filtered = useMemo(() => {
    return companiesList.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.industry?.toLowerCase().includes(search.toLowerCase()))
        return false
      if (industry !== "All" && c.industry !== industry) return false
      return true
    })
  }, [companiesList, search, industry])

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
          <p className="text-white/80 mb-8 max-w-xl mx-auto text-sm">
            Discover verified employer profiles, culture insights, and open opportunities across leading teams worldwide.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name or industry…"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mr-1">
            Industry:
          </span>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                industry === ind
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                  : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-9 h-9 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/companies/${company.slug || company.id}`}
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
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 ring-4 ring-[var(--card)] overflow-hidden mb-3 shadow-[var(--shadow-card)] p-1.5 flex items-center justify-center">
                      <img
                        src={getCompanyRealLogo(company.name, company.website, company.logo)}
                        alt={company.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = getCompanyRealLogo(company.name, company.website)
                        }}
                      />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-poppins font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                            {company.name}
                          </h3>
                          {company.isVerified && (
                            <span title="Verified Employer">
                              <BadgeCheck size={15} className="text-blue-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <Badge variant="default" size="sm" className="mt-1">
                          {company.industry || "Technology"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[var(--foreground)] shrink-0">
                        <Star
                          size={13}
                          className="fill-[var(--accent)] text-[var(--accent)]"
                        />
                        {company.rating || 4.9}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2 line-clamp-2">
                      {company.about || company.description || "Leading employer in the technology sector."}
                    </p>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <MapPin size={11} /> {company.location ? company.location.split(",")[0] : "Remote"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        Founded {company.founded || 2016}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <Users size={11} /> {company.size || "50-200"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 max-w-lg mx-auto">
            <Building size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
            <h3 className="font-bold text-base text-[var(--foreground)]">No companies found</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Try adjusting your search query or industry filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
