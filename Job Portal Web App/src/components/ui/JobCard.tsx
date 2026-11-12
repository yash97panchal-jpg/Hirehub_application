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
  Sparkles,
} from "lucide-react"
import Badge from "./Badge"
import RoundSkillMatchBadge from "./RoundSkillMatchBadge"
import type { Job } from "../../types"
import { useSavedJobsStore } from "../../store/savedJobsStore"
import { useAuthStore } from "../../store/authStore"
import { getCompanyRealLogo } from "../../data/companyLogos"
import { calculateSkillMatch } from "../../utils/skillMatcher"

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
  const { user, isAuthenticated } = useAuthStore()
  const { isJobSaved, toggleSaveJob } = useSavedJobsStore()
  const isSaved = isJobSaved(job.id)
  const cardRef = useRef<HTMLDivElement>(null)

  const skillMatch = calculateSkillMatch(job.skills, undefined, user)

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
    if (!isAuthenticated || !user) {
      toast.error("Please log in or create an account to save jobs.")
      return
    }
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
      className="tilt-card bg-[var(--card)] rounded-xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-[#F97316]/60 transition-all duration-200 p-5 group flex flex-col justify-between"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div>
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            to={`/companies/${job.company.slug || job.company.id || job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="flex items-center gap-3 min-w-0 flex-1 group/comp"
          >
            <div className="w-11 h-11 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 p-1 flex items-center justify-center shadow-xs">
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
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/comp:text-[#F97316] transition-colors truncate">
                {job.company.name}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
            </div>
          </Link>

          {/* Skill Match Round Badge & Bookmark Button */}
          <div className="flex items-center gap-2 shrink-0">
            <RoundSkillMatchBadge skillMatch={skillMatch} size="sm" />
            <button
              onClick={handleBookmarkClick}
              className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                isSaved
                  ? "bg-orange-50 dark:bg-orange-950/60 text-[#F97316]"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              aria-label={isSaved ? "Unsave job" : "Save job"}
              title={isSaved ? "Remove from saved jobs" : "Save job for later"}
            >
              {isSaved ? (
                <BookmarkCheck size={16} className="text-[#F97316] fill-[#F97316]/20" />
              ) : (
                <Bookmark
                  size={16}
                  className="group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors"
                />
              )}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 items-center mb-2.5">
          <Badge variant={typeColors[job.type] as any}>{job.type}</Badge>
          {job.isRemote && (
            <Badge variant="success">Remote</Badge>
          )}
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
          <h3 className="font-poppins font-semibold text-slate-900 dark:text-white text-base leading-snug mb-2 group-hover:text-[#F97316] transition-colors line-clamp-2">
            {job.title}
          </h3>
        </Link>

        {!compact && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            {job.skills.slice(0, 4).map((skill) => {
              const isMatched = skillMatch.matchedSkills.some(
                (ms) => ms.toLowerCase() === skill.toLowerCase()
              )
              return (
                <span
                  key={skill}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                    isMatched
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-medium"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                  title={isMatched ? "Skill matches your profile" : "Job requirement"}
                >
                  {isMatched && <span className="mr-1 text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
                  {skill}
                </span>
              )
            })}
            {job.skills.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Footer info */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            {salary && (
              <span className="flex items-center gap-0.5 font-semibold text-slate-800 dark:text-slate-200">
                <DollarSign size={12} className="text-emerald-600 dark:text-emerald-400" />
                {salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={11} />
              {job.applicationCount} applied
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </span>
        </div>

        {/* Action Buttons: Apply Now & Company Profile */}
        <div className="flex items-center gap-2 pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-3.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] active:bg-[#C2410C] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Apply Now</span>
            <ArrowRight size={13} />
          </Link>
          <Link
            to={`/companies/${job.company.id || job.company.slug || job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101F3E] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
            title={`View ${job.company.name} profile and other openings`}
          >
            <Building2 size={13} className="text-[#F97316] shrink-0" />
            <span>Company</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
