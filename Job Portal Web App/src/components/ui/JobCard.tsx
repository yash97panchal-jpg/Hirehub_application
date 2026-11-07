import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Users,
  Zap,
  ArrowRight,
  Building2,
} from "lucide-react"
import Badge from "./Badge"
import type { Job } from "../../types"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { getCompanyRealLogo } from "../../data/companyLogos"

interface JobCardProps {
  job: Job
  compact?: boolean
}

function formatSalary(job: Job) {
  if (!job.salaryMin && !job.salaryMax) return null

  const symMap: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "AU$",
    SGD: "S$",
    CHF: "CHF ",
    INR: "₹",
    JPY: "¥",
  }
  const cur = symMap[job.currency || "USD"] || (job.currency ? `${job.currency} ` : "$")

  if (job.type === "Internship") {
    return `${cur}${job.salaryMin}–${job.salaryMax}/hr`
  }

  const fmt = (n: number) => {
    if (job.currency === "INR") {
      if (n >= 100000) return `${cur}${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`
      return `${cur}${(n / 1000).toFixed(0)}k`
    }
    if (job.currency === "JPY") {
      if (n >= 10000) return `${cur}${(n / 10000).toFixed(0)}万`
      return `${cur}${n.toLocaleString()}`
    }
    return n >= 1000 ? `${cur}${(n / 1000).toFixed(0)}k` : `${cur}${n}`
  }

  if (job.salaryMin && job.salaryMax)
    return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`
  if (job.salaryMax) return `Up to ${fmt(job.salaryMax)}`
  return `From ${fmt(job.salaryMin!)}`
}

const typeColors: Record<string, string> = {
  "Full-time": "primary",
  "Part-time": "default",
  Internship: "accent",
  Contract: "warning",
  Freelance: "warning",
  Remote: "success",
  Hybrid: "default",
  "On-site": "default",
}

export default function JobCard({ job, compact = false }: JobCardProps) {
  const { isJobSaved, toggleSaveJob } = useSavedJobsStore()
  const isSaved = isJobSaved(job.id)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`
  }

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = ""
  }

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggleSaveJob(job.id)
    if (nowSaved) {
      toast.success(`Saved "${job.title}" to bookmarks!`)
    } else {
      toast(`Removed "${job.title}" from saved jobs`)
    }
  }

  const salary = formatSalary(job)
  const daysAgo = Math.floor(
    (Date.now() - new Date(job.postedAt).getTime()) / 86400000,
  )

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-[var(--primary)] transition-all duration-200 p-5 group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <Link
          to={`/companies/${job.company.slug || job.company.id || job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          className="flex items-center gap-3 min-w-0"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-[var(--border)] p-1 flex items-center justify-center shadow-xs">
            <img
              src={getCompanyRealLogo(job.company.name, job.company.website, job.company.logo)}
              alt={job.company.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = getCompanyRealLogo(job.company.name, job.company.website)
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] truncate">
              {job.company.name}
            </p>
            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <MapPin size={10} />
              <span className="truncate">{job.location}</span>
            </div>
          </div>
        </Link>
        <button
          onClick={handleBookmarkClick}
          className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
            isSaved
              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
              : "hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          }`}
          aria-label={isSaved ? "Unsave job" : "Save job"}
          title={isSaved ? "Remove from saved jobs" : "Save job for later"}
        >
          {isSaved ? (
            <BookmarkCheck size={16} className="text-[var(--primary)] fill-[var(--primary)]/20" />
          ) : (
            <Bookmark
              size={16}
              className="group-hover:text-[var(--primary)] transition-colors"
            />
          )}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant={typeColors[job.type] as any}>{job.type}</Badge>
        {job.isFeatured && (
          <Badge variant="accent">
            <Zap size={10} className="mr-0.5" />
            Featured
          </Badge>
        )}
        {job.isUrgent && <Badge variant="error">Urgent</Badge>}
      </div>

      {/* Title */}
      <Link to={`/jobs/${job.id}`}>
        <h3 className="font-poppins font-semibold text-[var(--foreground)] text-base leading-snug mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
          {job.title}
        </h3>
      </Link>

      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
              +{job.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          {salary && (
            <span className="flex items-center gap-1 font-semibold text-[var(--foreground)]">
              <DollarSign size={12} className="text-[var(--success)]" />
              {salary}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={11} />
            {job.applicationCount} applied
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock size={11} />
          {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
        </span>
      </div>

      {/* Action Buttons: Apply Now & Company Profile */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[var(--border)]/70">
        <Link
          to={`/jobs/${job.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 py-2 px-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Apply Now</span>
          <ArrowRight size={13} />
        </Link>
        <Link
          to={`/companies/${job.company.id || job.company.slug || job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          onClick={(e) => e.stopPropagation()}
          className="py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          title={`View ${job.company.name} profile and other openings`}
        >
          <Building2 size={13} className="text-[var(--primary)] shrink-0" />
          <span>Company Profile</span>
        </Link>
      </div>
    </motion.div>
  )
}
