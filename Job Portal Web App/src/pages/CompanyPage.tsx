import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Building,
  MapPin,
  Globe,
  Users,
  ArrowLeft,
  Star,
  CheckCircle,
  Briefcase,
  ExternalLink,
  ChevronRight,
  BadgeCheck,
  Map as MapIcon,
  Compass,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import { companyService, jobService } from "../lib/supabase"
import { mockCompanies, mockJobs } from "../data/mockData"
import type { Company, Job } from "../types"
import toast from "react-hot-toast"

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [companyJobs, setCompanyJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showMap, setShowMap] = useState(true)

  useEffect(() => {
    async function loadCompany() {
      if (!id) return
      setIsLoading(true)
      try {
        const found = await companyService.getCompanyBySlug(id)
        if (found) {
          setCompany(found)
          // Fetch open jobs for this company
          const allJobs = await jobService.getJobs()
          const matched = allJobs.filter(
            (j) =>
              j.company?.id === found.id ||
              j.company?.slug === found.slug ||
              j.company?.name.toLowerCase() === found.name.toLowerCase()
          )
          setCompanyJobs(matched)
        } else {
          // Fallback to mock search
          const fallback = mockCompanies.find(
            (c) =>
              c.id === id ||
              c.slug === id ||
              c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id.toLowerCase()
          )
          if (fallback) {
            setCompany(fallback)
            setCompanyJobs(
              mockJobs.filter((j) => j.company.id === fallback.id || j.company.name === fallback.name)
            )
          }
        }
      } catch (err) {
        console.error("Error loading company:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCompany()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-32 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] text-center shadow-lg">
          <Building size={44} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-50" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">Company Not Found</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            No verified company profile exists with the identifier "{id}".
          </p>
          <Button variant="primary" className="mt-5 w-full" onClick={() => navigate("/companies")}>
            Browse Verified Companies
          </Button>
        </div>
      </div>
    )
  }

  const handleFollowToggle = () => {
    setIsFollowing((prev) => {
      const next = !prev
      if (next) {
        toast.success(`You are now following ${company.name}`)
      } else {
        toast("Unfollowed " + company.name, { icon: "👋" })
      }
      return next
    })
  }

  const mapQuery = encodeURIComponent(`${company.name}, ${company.location || "San Francisco, CA"}`)

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Banner */}
      <div className="h-64 sm:h-80 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] relative overflow-hidden">
        {company.banner ? (
          <img
            src={company.banner}
            alt={`${company.name} Banner`}
            className="w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[var(--accent)] to-[#1E0B29] opacity-90" />
        )}
        <div className="absolute top-24 left-4 sm:left-8 z-10">
          <Button
            variant="outline"
            className="bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60 shadow-lg"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-24">
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-10 shadow-[var(--shadow-card)]">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[var(--card)] border-4 border-[var(--card)] flex items-center justify-center shrink-0 shadow-lg overflow-hidden ring-1 ring-[var(--border)]">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building size={48} className="text-[var(--primary)]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                    {company.name}
                  </h1>
                  {company.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20" title="Admin Verified Company">
                      <BadgeCheck size={14} className="text-blue-500" /> Verified Employer
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Pending Verification
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge variant="default" size="sm">
                    {company.industry || "Technology"}
                  </Badge>
                  {company.rating && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-[var(--foreground)]">
                      <Star size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
                      <span>{company.rating}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        ({company.reviewCount || 120} reviews)
                      </span>
                    </div>
                  )}
                  {company.size && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {company.size} employees
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant={isFollowing ? "outline" : "primary"}
              size="lg"
              onClick={handleFollowToggle}
              className="w-full sm:w-auto font-semibold shrink-0"
            >
              {isFollowing ? "✓ Following" : "+ Follow Company"}
            </Button>
          </div>

          {/* Quick Meta Stats */}
          <div className="flex flex-wrap gap-6 mt-8 py-5 border-y border-[var(--border)] text-sm">
            <div className="flex items-center gap-2 text-[var(--foreground)] font-medium">
              <MapPin size={18} className="text-[var(--primary)] shrink-0" />
              <span>{company.location || "Global Remote"}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--foreground)] font-medium">
              <Users size={18} className="text-[var(--primary)] shrink-0" />
              <span>{company.size || "50-200"} team members</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--foreground)] font-medium">
              <Briefcase size={18} className="text-[var(--primary)] shrink-0" />
              <span>{companyJobs.length} Active Positions</span>
            </div>
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[var(--primary)] shrink-0" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                >
                  {company.website.replace(/^https?:\/\//, "")}
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* About Section */}
          <div className="mt-8">
            <h2 className="font-poppins text-xl font-bold text-[var(--foreground)] mb-3">
              About {company.name}
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {company.about ||
                company.description ||
                `${company.name} is a high-growth technology leader building scalable products and fostering world-class engineering and creative talent.`}
            </p>
          </div>

          {/* GIS Location Map View */}
          <div className="mt-8 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-poppins text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  <MapIcon size={18} className="text-[var(--primary)]" />
                  Office Location & Workplace Map
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {company.location || "Worldwide Remote / Hybrid Headquarters"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <Compass size={13} /> {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>

            {showMap && (
              <div className="rounded-2xl overflow-hidden border border-[var(--border)] h-56 sm:h-72 w-full bg-[var(--muted)]/40 relative shadow-inner">
                <iframe
                  title={`${company.name} Map Location`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full grayscale-[25%] contrast-[1.05]"
                />
              </div>
            )}
          </div>

          {/* Open Positions Section */}
          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
                  Open Opportunities ({companyJobs.length})
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Choose between Easy Apply in-app and Direct ATS website applications.
                </p>
              </div>
              <Link
                to={`/jobs?keyword=${encodeURIComponent(company.name)}`}
                className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Explore on Search <ChevronRight size={13} />
              </Link>
            </div>

            {companyJobs.length > 0 ? (
              <div className="space-y-3">
                {companyJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-poppins font-bold text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {job.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          job.applyMode === "both"
                            ? "bg-purple-500/10 text-purple-600"
                            : job.applyMode === "external"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {job.applyMode === "both"
                            ? "Easy & External"
                            : job.applyMode === "external"
                              ? "Apply on Website"
                              : "Easy Apply"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {job.salaryMin && job.salaryMax
                            ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`
                            : "Competitive Salary"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button variant="outline" size="sm" className="group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        Apply Now <ChevronRight size={14} />
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-[var(--border)] rounded-2xl bg-[var(--muted)]/20">
                <Building
                  size={40}
                  className="mx-auto text-[var(--muted-foreground)] opacity-40 mb-3"
                />
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  No published openings currently
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Follow {company.name} to receive real-time notifications as new positions open.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
