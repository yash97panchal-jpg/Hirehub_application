import { useState, useMemo } from "react"
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
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import { mockCompanies } from "../data/mockData"
import { useJobStore } from "../store/jobStore"
import { isLocalhost } from "../utils/env"
import type { Company } from "../types"
import toast from "react-hot-toast"

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { jobs: storeJobs } = useJobStore()
  const [isFollowing, setIsFollowing] = useState(false)

  // On localhost show mock companies. On live server, derive from real store jobs.
  const allCompanies = useMemo<Company[]>(() => {
    if (isLocalhost()) return mockCompanies
    const map = new Map<string, Company>()
    storeJobs.forEach((j) => {
      if (j.company && j.company.id && !map.has(j.company.id)) {
        map.set(j.company.id, j.company)
      }
    })
    return Array.from(map.values())
  }, [storeJobs])

  // Find company by ID or name
  const company =
    allCompanies.find((c) => c.id === id) ||
    allCompanies.find((c) => c.name.toLowerCase().includes(id?.toLowerCase() || "")) ||
    (allCompanies.length > 0 ? allCompanies[0] : null)

  if (!company) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] text-center shadow-lg">
          <Building size={44} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-50" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">Company Not Found</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            No company profile exists with this identifier yet.
          </p>
          <Button variant="primary" className="mt-5 w-full" onClick={() => navigate("/companies")}>
            Back to Companies
          </Button>
        </div>
      </div>
    )
  }

  // Find jobs posted by this company
  const companyJobs = storeJobs.filter(
    (j) => j.company?.id === company.id || j.company?.name.toLowerCase() === company.name.toLowerCase(),
  )

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
                <div className="flex items-center gap-2">
                  <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <span title="Verified Employer">
                      <CheckCircle size={20} className="text-[var(--primary)]" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge variant="default" size="sm">
                    {company.industry}
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
                  {company.founded && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Founded in {company.founded}
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
              <span>{company.location}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--foreground)] font-medium">
              <Users size={18} className="text-[var(--primary)] shrink-0" />
              <span>{company.size} employees</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--foreground)] font-medium">
              <Briefcase size={18} className="text-[var(--primary)] shrink-0" />
              <span>{companyJobs.length || company.jobCount || 0} Open Roles</span>
            </div>
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[var(--primary)] shrink-0" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
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
                `${company.name} is a forward-thinking organization dedicated to excellence and fostering top-tier career growth across the globe.`}
            </p>
          </div>

          {/* Address / Headquarters */}
          {company.address && (
            <div className="mt-6 p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] text-xs text-[var(--muted-foreground)] flex items-center gap-2">
              <MapPin size={16} className="text-[var(--primary)] shrink-0" />
              <span>Headquarters: {company.address}</span>
            </div>
          )}

          {/* Open Positions Section */}
          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
                  Open Positions ({companyJobs.length})
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Direct opportunities currently accepting applications.
                </p>
              </div>
              <Link
                to={`/jobs?keyword=${encodeURIComponent(company.name)}`}
                className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Browse all in Map <ChevronRight size={13} />
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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-poppins font-bold text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {job.title}
                        </h3>
                        {job.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            Urgent
                          </span>
                        )}
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
                            : "Competitive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button variant="outline" size="sm" className="group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        View Role <ChevronRight size={14} />
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
                  No active openings right now
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Follow this company to be notified immediately when a new position opens.
                </p>
              </div>
            )}
          </div>

          {/* Employee Reviews */}
          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <h2 className="font-poppins text-xl font-bold text-[var(--foreground)] mb-4">
              Verified Employee Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  rating: 5,
                  author: "Senior Software Engineer",
                  tenure: "Current employee (2+ years)",
                  text: "Incredible engineering culture with genuine autonomy. Great modern tech stack and strong mentorship.",
                  date: "October 2026",
                },
                {
                  rating: 4,
                  author: "Product Designer",
                  tenure: "Current employee (1 year)",
                  text: "Fast-moving collaborative environment with excellent work-life balance and comprehensive remote setup perks.",
                  date: "September 2026",
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className="p-5 bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--foreground)]">
                        {review.author}
                      </h4>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{review.tenure}</p>
                    </div>
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-2">
                    "{review.text}"
                  </p>
                  <span className="text-[10px] text-[var(--muted-foreground)]/60 block mt-3">
                    {review.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
