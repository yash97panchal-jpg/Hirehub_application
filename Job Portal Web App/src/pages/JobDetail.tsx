import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Bookmark,
  Share2,
  BookmarkCheck,
  CheckCircle,
  Star,
  Building2,
  ArrowLeft,
  Zap,
  ChevronRight,
  Globe,
  ExternalLink,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import JobCard from "../components/ui/JobCard"
import { mockJobs } from "../data/mockData"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)

  const job = mockJobs.find((j) => j.id === id) || mockJobs[0]
  const similarJobs = mockJobs
    .filter((j) => j.id !== job.id && j.category === job.category)
    .slice(0, 3)
  const daysAgo = Math.floor(
    (Date.now() - new Date(job.postedAt).getTime()) / 86400000,
  )

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    setApplying(true)
    await new Promise((r) => setTimeout(r, 1200))
    setApplied(true)
    setApplying(false)
    toast.success(
      "Application submitted! The recruiter will review it shortly.",
    )
  }

  const salary =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k/yr`
      : "Salary not specified"

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-6">
          <Link to="/" className="hover:text-[var(--primary)]">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/jobs" className="hover:text-[var(--primary)]">
            Jobs
          </Link>
          <ChevronRight size={14} />
          <span className="text-[var(--foreground)] truncate">{job.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-4">
                <Link to={`/companies/${job.company.id}`} className="shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--muted)] ring-1 ring-[var(--border)]">
                    {job.company.logo ? (
                      <img
                        src={job.company.logo}
                        alt={job.company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[var(--primary)]">
                        {job.company.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge
                      variant={
                        job.type === "Full-time"
                          ? "primary"
                          : job.type === "Internship"
                            ? "accent"
                            : "default"
                      }
                    >
                      {job.type}
                    </Badge>
                    {job.isFeatured && (
                      <Badge variant="accent">
                        <Zap size={10} className="mr-0.5" />
                        Featured
                      </Badge>
                    )}
                    {job.isUrgent && <Badge variant="error">Urgent Hire</Badge>}
                  </div>
                  <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-1">
                    {job.title}
                  </h1>
                  <Link
                    to={`/companies/${job.company.id}`}
                    className="flex items-center gap-1 text-[var(--muted-foreground)] text-sm hover:text-[var(--primary)] transition-colors"
                  >
                    <Building2 size={14} />
                    <span className="font-medium">{job.company.name}</span>
                    {job.company.isVerified && (
                      <CheckCircle size={13} className="text-blue-500 ml-0.5" />
                    )}
                  </Link>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setSaved((v) => !v)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                  >
                    {saved ? (
                      <BookmarkCheck
                        size={16}
                        className="text-[var(--primary)]"
                      />
                    ) : (
                      <Bookmark
                        size={16}
                        className="text-[var(--muted-foreground)]"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success("Link copied!")
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                  >
                    <Share2
                      size={16}
                      className="text-[var(--muted-foreground)]"
                    />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[var(--border)]">
                {[
                  { icon: MapPin, label: "Location", value: job.location },
                  { icon: DollarSign, label: "Salary", value: salary },
                  {
                    icon: Briefcase,
                    label: "Experience",
                    value: job.experience,
                  },
                  {
                    icon: Clock,
                    label: "Posted",
                    value: daysAgo === 0 ? "Today" : `${daysAgo} days ago`,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">
                      {item.label}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <item.icon
                        size={13}
                        className="text-[var(--primary)] shrink-0"
                      />
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-poppins font-bold text-lg text-[var(--foreground)] mb-4">
                Job Description
              </h2>
              <p className="text-[var(--foreground)] text-sm leading-relaxed mb-6">
                {job.description}
              </p>

              <h3 className="font-semibold text-[var(--foreground)] mb-3">
                Responsibilities
              </h3>
              <ul className="space-y-2 mb-6">
                {job.responsibilities.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 text-sm text-[var(--foreground)]"
                  >
                    <CheckCircle
                      size={15}
                      className="text-[var(--primary)] shrink-0 mt-0.5"
                    />
                    {r}
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-[var(--foreground)] mb-3">
                Requirements
              </h3>
              <ul className="space-y-2 mb-6">
                {job.requirements.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 text-sm text-[var(--foreground)]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-2" />
                    {r}
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-[var(--foreground)] mb-3">
                Skills Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-[var(--muted)] text-sm font-medium text-[var(--foreground)] border border-[var(--border)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {job.benefits && job.benefits.length > 0 && (
                <>
                  <h3 className="font-semibold text-[var(--foreground)] mt-6 mb-3">
                    Benefits & Perks
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {job.benefits.map((b) => (
                      <div
                        key={b}
                        className="flex items-center gap-2 text-sm text-[var(--foreground)]"
                      >
                        <Star
                          size={13}
                          className="text-[var(--accent)] fill-[var(--accent)] shrink-0"
                        />
                        {b}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div>
                <h2 className="font-poppins font-bold text-xl text-[var(--foreground)] mb-4">
                  Similar Jobs
                </h2>
                <div className="grid gap-4">
                  {similarJobs.map((j) => (
                    <JobCard key={j.id} job={j} compact />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Apply card */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] sticky top-24">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-[var(--foreground)] font-poppins">
                  {salary}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Annual compensation
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-[var(--muted-foreground)] mb-5">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {job.applicationCount} applied
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                </span>
              </div>

              {applied ? (
                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle
                    size={24}
                    className="text-green-500 mx-auto mb-2"
                  />
                  <p className="font-semibold text-green-700 dark:text-green-400 text-sm">
                    Application Submitted!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Track it in your dashboard.
                  </p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleApply}
                  isLoading={applying}
                >
                  Apply Now
                </Button>
              )}

              <Button
                variant="outline"
                size="md"
                className="w-full mt-2"
                onClick={() => setSaved((v) => !v)}
              >
                {saved ? (
                  <>
                    <BookmarkCheck size={15} /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark size={15} /> Save Job
                  </>
                )}
              </Button>

              <div className="mt-4 pt-4 border-t border-[var(--border)] text-center">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Responding in &lt; 3 days · {job.applicationCount} applicants
                </p>
              </div>
            </div>

            {/* Company card */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                About the Company
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--muted)] ring-1 ring-[var(--border)] shrink-0">
                  {job.company.logo && (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--foreground)]">
                    {job.company.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {job.company.industry}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4 line-clamp-3">
                {job.company.about}
              </p>
              <div className="space-y-2">
                {[
                  { label: "Industry", value: job.company.industry },
                  { label: "Size", value: job.company.size + " employees" },
                  { label: "Location", value: job.company.location },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between text-xs"
                  >
                    <span className="text-[var(--muted-foreground)]">
                      {item.label}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to={`/companies/${job.company.id}`}
                className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                View company profile <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
