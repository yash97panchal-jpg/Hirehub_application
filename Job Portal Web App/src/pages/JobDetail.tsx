import { useState, useEffect } from "react"
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
  ShieldAlert,
  Navigation,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import RoundSkillMatchBadge from "../components/ui/RoundSkillMatchBadge"
import JobCard from "../components/ui/JobCard"
import { useJobStore } from "../store/jobStore"
import { useAuthStore } from "../store/authStore"
import { useApplicationStore } from "../store/applicationStore"
import { useSavedJobsStore } from "../store/savedJobsStore"
import { externalApplyService } from "../lib/supabase"
import EasyApplyModal from "../components/jobs/EasyApplyModal"
import ExternalApplyPromptModal from "../components/jobs/ExternalApplyPromptModal"
import ApplicationSuccessModal from "../components/jobs/ApplicationSuccessModal"
import ShareJobModal from "../components/jobs/ShareJobModal"
import ReportJobModal from "../components/jobs/ReportJobModal"
import { emailService, type SentEmailRecord } from "../services/emailService"
import { getCompanyRealLogo } from "../data/companyLogos"
import { calculateSkillMatch } from "../utils/skillMatcher"
import { Browser } from "@capacitor/browser"
import toast from "react-hot-toast"

export default function JobDetail() {
  const { id } = useParams()
  const { jobs: storeJobs } = useJobStore()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { applications, addApplication } = useApplicationStore()
  const { isJobSaved, toggleSaveJob } = useSavedJobsStore()

  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isEasyApplyOpen, setIsEasyApplyOpen] = useState(false)
  const [dispatchedEmail, setDispatchedEmail] = useState<SentEmailRecord | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // External Apply Prompt tracking
  const [pendingExternalClickId, setPendingExternalClickId] = useState<string | null>(null)
  const [showExternalPrompt, setShowExternalPrompt] = useState(false)

  const job = storeJobs.find((j) => j.id === id) || null

  // Check if already applied
  const existingApp = applications.find((a) => a.job?.id === job?.id)
  const isAlreadyApplied = Boolean(existingApp)

  // Listen for window/tab refocus to prompt external apply follow-up
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && pendingExternalClickId && job) {
        // User came back from external site
        setTimeout(() => {
          setShowExternalPrompt(true)
        }, 600)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [pendingExternalClickId, job])

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] text-center shadow-lg">
          <Briefcase size={44} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-50" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">Job Not Found</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            The job opening you are looking for does not exist or has been removed.
          </p>
          <Button variant="primary" className="mt-5 w-full" onClick={() => navigate("/jobs")}>
            Browse Available Jobs
          </Button>
        </div>
      </div>
    )
  }

  const isSaved = isJobSaved(job.id)
  const skillMatch = calculateSkillMatch(job.skills, undefined, user)

  const handleToggleSave = () => {
    const nowSaved = toggleSaveJob(job.id)
    if (nowSaved) {
      toast.success(`Saved "${job.title}" to your bookmarks!`)
    } else {
      toast(`Removed "${job.title}" from saved jobs`)
    }
  }

  // Handle External Apply Button Click
  const handleExternalApply = async () => {
    const url = job.externalApplyUrl || job.company.website
    if (!url) {
      toast.error("External application link not available.")
      return
    }

    try {
      // Log click
      const clickId = await externalApplyService.logClick(job.id, user?.id)
      setPendingExternalClickId(clickId)

      // Open URL safely via Capacitor Browser on mobile, or window.open on web
      try {
        await Browser.open({ url })
      } catch {
        window.open(url, "_blank", "noopener,noreferrer")
      }
    } catch (err: any) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  // User confirmed they applied on external site
  const handleConfirmExternalApply = async () => {
    if (pendingExternalClickId) {
      await externalApplyService.confirmApplication(pendingExternalClickId, "applied")
    }

    if (user && job) {
      const newApp = {
        id: "ext-" + Date.now(),
        job,
        applicant: user,
        status: "Applied" as const,
        resumeUrl: "External Apply Submission",
        source: "external" as const,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addApplication(newApp)

      try {
        const emailRec = await emailService.sendApplicationConfirmation({
          applicant: user,
          job,
          applicationId: newApp.id,
        })
        setDispatchedEmail(emailRec)
      } catch (err) {
        console.warn("Could not dispatch confirmation email:", err)
      }
    }

    setShowExternalPrompt(false)
    setPendingExternalClickId(null)
    setShowSuccessModal(true)
    toast.success("Application recorded & confirmation email dispatched!")
  }

  const similarJobs = storeJobs
    .filter((j) => j.id !== job.id && j.category === job.category)
    .slice(0, 3)

  const daysAgo = Math.floor(
    (Date.now() - new Date(job.postedAt).getTime()) / 86400000,
  )

  const salary =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k/yr`
      : "Salary not specified"

  const lat = job.coordinates?.lat || 37.7749
  const lng = job.coordinates?.lng || -122.4194

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-6">
          <Link
            to={
              isAuthenticated && user
                ? user.role === "admin"
                  ? "/admin"
                  : user.role === "recruiter"
                    ? "/recruiter"
                    : "/dashboard"
                : "/"
            }
            className="hover:text-[var(--primary)]"
          >
            {isAuthenticated ? "Dashboard" : "Home"}
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
                <Link to={`/companies/${job.company.slug || job.company.id}`} className="shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-[var(--border)] p-1.5 flex items-center justify-center shadow-xs">
                    <img
                      src={getCompanyRealLogo(job.company.name, job.company.website, job.company.logo)}
                      alt={job.company.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = getCompanyRealLogo(job.company.name, job.company.website)
                      }}
                    />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/companies/${job.company.slug || job.company.id}`}
                      className="text-sm font-semibold text-[var(--primary)] hover:underline"
                    >
                      {job.company.name}
                    </Link>
                    {job.company.isVerified && (
                      <Badge variant="success" size="sm">
                        ✓ Verified Company
                      </Badge>
                    )}
                    {job.isUrgent && (
                      <Badge variant="error" size="sm">
                        Urgent Hiring
                      </Badge>
                    )}
                  </div>

                  <h1 className="font-poppins font-bold text-xl sm:text-2xl text-[var(--foreground)] mt-1 mb-2">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-[var(--primary)]" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={15} className="text-[var(--primary)]" />
                      {job.type}
                    </span>
                    {job.isRemote && (
                      <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                        <Globe size={15} /> Remote Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsShareOpen(true)}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                    title="Share this role"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:bg-[var(--muted)] transition-colors"
                    title="Report scam or issue"
                  >
                    <ShieldAlert size={16} />
                  </button>
                </div>
              </div>

              {/* Key metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                {[
                  {
                    icon: DollarSign,
                    label: "Compensation",
                    value: salary,
                  },
                  {
                    icon: Briefcase,
                    label: "Job Type",
                    value: job.type,
                  },
                  {
                    icon: Users,
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
              <p className="text-[var(--foreground)] text-sm leading-relaxed mb-6 whitespace-pre-line">
                {job.description}
              </p>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <>
                  <h3 className="font-semibold text-[var(--foreground)] mb-3">
                    Key Responsibilities
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
                </>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <>
                  <h3 className="font-semibold text-[var(--foreground)] mb-3">
                    Requirements & Qualifications
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
                </>
              )}

              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-semibold text-[var(--foreground)]">
                  Skills Required
                </h3>
                <RoundSkillMatchBadge skillMatch={skillMatch} size="sm" showLabel={true} />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills.map((skill) => {
                  const isMatched = skillMatch.matchedSkills.some(
                    (ms) => ms.toLowerCase() === skill.toLowerCase()
                  )
                  return (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        isMatched
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold"
                          : "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]"
                      }`}
                      title={isMatched ? "Matches your profile / resume skills" : "Job requirement"}
                    >
                      {isMatched && <span className="mr-1 text-emerald-500 font-bold">✓</span>}
                      {skill}
                    </span>
                  )
                })}
              </div>

              {job.benefits && job.benefits.length > 0 && (
                <>
                  <h3 className="font-semibold text-[var(--foreground)] mb-3">
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

            {/* LOCATION MAP VIEW (User Request: "relateed to job location it is show in the map view also") */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-bold text-lg text-[var(--foreground)] flex items-center gap-2">
                  <Navigation size={18} className="text-[var(--primary)]" />
                  Office Location & GIS Map
                </h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {job.location}
                </span>
              </div>

              {/* Embedded Interactive Map Frame */}
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm relative bg-[var(--muted)]">
                <iframe
                  title="Job Location Map"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    job.address || job.location
                  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                <MapPin size={13} className="text-[var(--primary)] shrink-0" />
                <span>{job.address || `${job.location} · Verified workplace coordinate`}</span>
              </p>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div>
                <h2 className="font-poppins font-bold text-xl text-[var(--foreground)] mb-4">
                  Similar Opportunities
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

              {/* Application Status or Apply Buttons by Mode */}
              {isAlreadyApplied ? (
                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-green-700 dark:text-green-400 text-sm">
                    Application Submitted
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Status: <span className="font-bold">{existingApp?.status || "Applied"}</span>
                    {existingApp?.source === "external" && " (External)"}
                  </p>
                  <Link
                    to="/dashboard/applications"
                    className="inline-block mt-3 text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    View in Application Tracker →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Mode: Easy Apply */}
                  {(job.applyMode === "easy" || job.applyMode === "both") && (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full font-bold justify-center"
                      onClick={() => {
                        if (!isAuthenticated || !user) {
                          toast("Please log in or create an account to apply.")
                          navigate("/login")
                          return
                        }
                        setIsEasyApplyOpen(true)
                      }}
                    >
                      <Zap size={16} className="mr-1.5" /> Easy Apply (In-App)
                    </Button>
                  )}

                  {/* Mode: External Apply */}
                  {(job.applyMode === "external" || job.applyMode === "both") && (
                    <Button
                      variant={job.applyMode === "both" ? "outline" : "primary"}
                      size="lg"
                      className="w-full font-bold justify-center"
                      onClick={handleExternalApply}
                    >
                      <ExternalLink size={16} className="mr-1.5" /> Apply on Company Site
                    </Button>
                  )}
                </div>
              )}

              {/* Bookmark Save Button */}
              <Button
                variant={isSaved ? "secondary" : "outline"}
                size="md"
                className={`w-full mt-2.5 ${
                  isSaved
                    ? "text-[var(--primary)] border-[var(--primary)]/30 bg-[var(--primary)]/10"
                    : ""
                }`}
                onClick={handleToggleSave}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={15} className="text-[var(--primary)] mr-1.5" /> Saved to Bookmarks
                  </>
                ) : (
                  <>
                    <Bookmark size={15} className="mr-1.5" /> Save Job
                  </>
                )}
              </Button>

              <div className="mt-4 pt-4 border-t border-[var(--border)] text-center space-y-1">
                <p className="text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-1.5">
                  <Clock size={12} className="text-[var(--primary)]" />
                  <span>Recruiter responds in ~2-3 business days</span>
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Apply Mode:{" "}
                  <strong className="text-[var(--foreground)] uppercase font-mono">
                    {job.applyMode}
                  </strong>
                </p>
              </div>
            </div>

            {/* Company Sidebar Card */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-[var(--border)] overflow-hidden shrink-0 p-1 flex items-center justify-center shadow-xs">
                  <img
                    src={getCompanyRealLogo(job.company.name, job.company.website, job.company.logo)}
                    alt={job.company.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = getCompanyRealLogo(job.company.name, job.company.website)
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--foreground)]">
                    {job.company.name}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {job.company.industry || "Technology"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                {job.company.description || job.company.about}
              </p>

              <div className="pt-2 border-t border-[var(--border)]">
                <Link
                  to={`/companies/${job.company.slug || job.company.id}`}
                  className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center justify-between"
                >
                  <span>View Full Company Profile & Jobs</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Easy Apply In-App Modal */}
      <EasyApplyModal
        job={job}
        user={user}
        isOpen={isEasyApplyOpen}
        onClose={() => setIsEasyApplyOpen(false)}
        onSuccess={(newApp, emailRecord) => {
          if (newApp) {
            addApplication(newApp)
          } else if (user) {
            addApplication({
              id: "app-" + Date.now(),
              job,
              applicant: user,
              status: "Applied",
              resumeUrl: "Profile Resume",
              source: "easy",
              appliedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
          if (emailRecord) {
            setDispatchedEmail(emailRecord)
          }
          setShowSuccessModal(true)
        }}
      />

      {/* External Apply Follow-Up Modal */}
      <ExternalApplyPromptModal
        job={job}
        isOpen={showExternalPrompt}
        onConfirm={handleConfirmExternalApply}
        onDecline={() => {
          if (pendingExternalClickId) {
            externalApplyService.confirmApplication(pendingExternalClickId, "not_applied")
          }
          setShowExternalPrompt(false)
          setPendingExternalClickId(null)
        }}
        onDismiss={() => {
          setShowExternalPrompt(false)
          setPendingExternalClickId(null)
        }}
      />

      {/* Application Success & Email Receipt Modal */}
      <ApplicationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        job={job}
        user={user}
        emailRecord={dispatchedEmail}
      />

      {/* Share & Report Modals */}
      <ShareJobModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company.name}
      />
      <ReportJobModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company.name}
      />
    </div>
  )
}
