import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  Filter,
  Mail,
} from "lucide-react"
import { Link } from "react-router-dom"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { useApplicationStore } from "../../store/applicationStore"
import { useAuthStore } from "../../store/authStore"
import { useNotificationStore } from "../../store/notificationStore"
import { applicationService } from "../../lib/supabase"
import ApplicationSuccessModal from "../../components/jobs/ApplicationSuccessModal"
import { emailService } from "../../services/emailService"
import { getCompanyRealLogo } from "../../data/companyLogos"
import RoundSkillMatchBadge from "../../components/ui/RoundSkillMatchBadge"
import ApplicationPipelineStepper from "../../components/dashboard/ApplicationPipelineStepper"
import CustomSelect from "../../components/ui/CustomSelect"
import { calculateSkillMatch } from "../../utils/skillMatcher"
import type { Application, ApplicationStatus } from "../../types"
import toast from "react-hot-toast"

export default function ApplicationTracker() {
  const { applications: storeApplications, withdrawApplication } = useApplicationStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()

  const [filterSource, setFilterSource] = useState<"all" | "easy" | "external">("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null)
  const [previewApp, setPreviewApp] = useState<Application | null>(null)

  // Filtered applications
  const applications = useMemo(() => {
    let list = storeApplications

    if (filterSource !== "all") {
      list = list.filter((a) => (a.source || "easy") === filterSource)
    }

    if (filterStatus !== "all") {
      list = list.filter((a) => a.status === filterStatus)
    }

    return list
  }, [storeApplications, filterSource, filterStatus])

  // Handle Seeker Withdrawing Application
  const confirmWithdraw = async (target: Application) => {
    setWithdrawingId(target.id)
    try {
      withdrawApplication(target.id)
      await applicationService.withdrawApplication(target.id)
      addNotification({
        type: "application",
        title: "Application Withdrawn",
        message: `You successfully withdrew your application for ${target.job?.title || "the position"} at ${target.job?.company?.name || "the company"}.`,
        link: `/jobs/${target.job?.id || target.jobId}`,
      })
      toast.success("Application successfully withdrawn.")
      setWithdrawTarget(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw application.")
    } finally {
      setWithdrawingId(null)
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "Applied":
        return <Badge variant="primary">Applied</Badge>
      case "Viewed":
        return <Badge variant="accent">Viewed by Recruiter</Badge>
      case "Shortlisted":
        return <Badge variant="success">Shortlisted for Review</Badge>
      case "Interview":
        return <Badge variant="warning">Interview Scheduled</Badge>
      case "Offered":
        return <Badge variant="success">Offer Extended</Badge>
      case "Rejected":
        return <Badge variant="error">Not Selected</Badge>
      case "Withdrawn":
        return <Badge variant="outline">Withdrawn</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
              <Briefcase className="text-[#2563EB]" />
              Application Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Live tracking for your Easy Apply submissions and external ATS applications.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <CustomSelect
              value={filterSource}
              onChange={(val) => setFilterSource(val)}
              options={[
                { value: "all", label: "All Sources" },
                { value: "easy", label: "Easy Apply (In-App)" },
                { value: "external", label: "External Website" },
              ]}
              size="sm"
              className="w-44"
            />

            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(String(val))}
              options={[
                { value: "all", label: "All Stages" },
                { value: "Applied", label: "Applied" },
                { value: "Viewed", label: "Viewed" },
                { value: "Shortlisted", label: "Shortlisted" },
                { value: "Interview", label: "Interview" },
                { value: "Offered", label: "Offered" },
                { value: "Withdrawn", label: "Withdrawn" },
              ]}
              size="sm"
              className="w-36"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Applications", count: storeApplications.length },
            {
              label: "In Review / Shortlisted",
              count: storeApplications.filter((a) => a.status === "Shortlisted" || a.status === "Viewed").length,
            },
            {
              label: "Interviews",
              count: storeApplications.filter((a) => a.status === "Interview").length,
            },
            {
              label: "Easy Apply Submissions",
              count: storeApplications.filter((a) => (a.source || "easy") === "easy").length,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm"
            >
              <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
              <p className="text-2xl font-poppins font-black text-[var(--foreground)] mt-1">
                {item.count}
              </p>
            </div>
          ))}
        </div>

        {/* Applications List */}
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
          {applications.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Briefcase size={44} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No Applications Found</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                {storeApplications.length === 0
                  ? "You haven't submitted any job applications yet. Find your dream role on the jobs marketplace."
                  : "No applications match the selected filters."}
              </p>
              <Link to="/jobs">
                <Button variant="primary" size="sm" className="mt-2">
                  Browse Verified Jobs <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 sm:p-6 hover:bg-[var(--muted)]/15 transition-all space-y-4"
                >
                  {/* Top Row: Company Info & Round Skill Match */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-13 h-13 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg text-[var(--primary)] border border-[var(--border)] p-1 shadow-xs">
                        {app.job?.company?.name ? (
                          <img
                            src={getCompanyRealLogo(app.job.company.name, app.job.company.website, app.job.company.logo)}
                            alt={app.job.company.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = getCompanyRealLogo(app.job?.company?.name || "Company", app.job?.company?.website);
                            }}
                          />
                        ) : (
                          app.job?.company?.name?.charAt(0) || "C"
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/jobs/${app.job?.id}`}
                            className="font-poppins font-bold text-base text-[var(--foreground)] hover:text-[var(--primary)] hover:underline truncate"
                          >
                            {app.job?.title || "Untitled Position"}
                          </Link>
                          {/* Source Label */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                              app.source === "external"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                : "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                            }`}
                          >
                            {app.source === "external" ? (
                              <>
                                <ExternalLink size={10} /> External ATS
                              </>
                            ) : (
                              <>
                                <Zap size={10} /> In-App Easy Apply
                              </>
                            )}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[var(--muted-foreground)]">
                          <span className="font-semibold text-[var(--foreground)]">{app.job?.company?.name}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {app.job?.location || "Remote"}
                          </span>
                          {app.job?.type && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{app.job.type}</span>
                            </>
                          )}
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />{" "}
                            {app.appliedAt
                              ? new Date(app.appliedAt).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Skill Match in Round Format & Status Badge */}
                    <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                      {app.job?.skills && app.job.skills.length > 0 && (
                        <RoundSkillMatchBadge
                          skillMatch={calculateSkillMatch(app.job.skills, undefined, user)}
                          size="sm"
                        />
                      )}
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  </div>

                  {/* 5-Stage Visual Progress Stepper */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)]/70">
                    <ApplicationPipelineStepper status={app.status} appliedAt={app.appliedAt} />
                  </div>

                  {app.coverLetter && (
                    <div className="p-3 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                      <span className="font-bold text-[var(--foreground)] mr-1">Cover Note:</span>
                      <span className="italic">"{app.coverLetter}"</span>
                    </div>
                  )}

                  {/* Stage & Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]/50 text-xs">
                    <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                      Ref: #{app.id ? app.id.slice(0, 8).toUpperCase() : "APP-LIVE"}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* View Confirmation Email / Details */}
                      <button
                        type="button"
                        onClick={() => setPreviewApp(app)}
                        className="px-3 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 font-semibold flex items-center gap-1.5 transition-colors"
                        title="View Confirmation Email & Company Details"
                      >
                        <Mail size={13} />
                        <span>Confirmation</span>
                      </button>

                      <Link
                        to={`/jobs/${app.job?.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-bold text-white flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>Role Details</span>
                        <ArrowRight size={13} />
                      </Link>

                      {/* Withdraw button for submissions that aren't already closed */}
                      {app.status !== "Withdrawn" && app.status !== "Rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWithdrawTarget(app)}
                          disabled={withdrawingId === app.id}
                          className="text-xs text-red-500 hover:text-red-700 hover:border-red-300"
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Mobile-Optimized Withdraw Confirmation Modal */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 mx-auto">
              <AlertCircle size={26} />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                Withdraw Application?
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Are you sure you want to withdraw your application for{" "}
                <strong className="text-[var(--foreground)]">
                  {withdrawTarget.job?.title || "this position"}
                </strong>{" "}
                at{" "}
                <strong className="text-[var(--foreground)]">
                  {withdrawTarget.job?.company?.name || "the company"}
                </strong>?
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
              Your profile remains intact. You will be able to re-apply to this position at any time.
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 font-semibold"
                onClick={() => setWithdrawTarget(null)}
                disabled={Boolean(withdrawingId)}
              >
                Keep Active
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold border-red-600"
                onClick={() => confirmWithdraw(withdrawTarget)}
                disabled={Boolean(withdrawingId)}
              >
                {withdrawingId ? "Withdrawing..." : "Confirm Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Email Preview Modal */}
      {previewApp && (
        <ApplicationSuccessModal
          isOpen={Boolean(previewApp)}
          onClose={() => setPreviewApp(null)}
          job={previewApp.job}
          user={user}
          emailRecord={{
            id: "email-" + previewApp.id,
            to: user?.email || previewApp.applicant?.email || "candidate@hirehub.app",
            subject: `Application Submitted Successfully: ${previewApp.job?.title} at ${previewApp.job?.company?.name}`,
            timestamp: previewApp.appliedAt,
            status: "delivered",
            companyName: previewApp.job?.company?.name || "Company",
            companyLogo: getCompanyRealLogo(
              previewApp.job?.company?.name || "Company",
              previewApp.job?.company?.website,
              previewApp.job?.company?.logo
            ),
            companyLocation: previewApp.job?.company?.location || previewApp.job?.location,
            companyWebsite: previewApp.job?.company?.website,
            jobTitle: previewApp.job?.title || "Role",
            jobType: previewApp.job?.type || "Full-time",
            jobLocation: previewApp.job?.location || "Remote",
            salary: previewApp.job?.salaryMin && previewApp.job?.salaryMax
              ? `${previewApp.job.currency || "$"}${previewApp.job.salaryMin.toLocaleString()} - ${previewApp.job.currency || "$"}${previewApp.job.salaryMax.toLocaleString()}`
              : "Market Standard",
            applicationId: previewApp.id,
            applicationStatus: previewApp.status,
            htmlPreview: emailService.generateApplicationEmailHtml({
              applicant: user || previewApp.applicant,
              job: previewApp.job,
              applicationId: previewApp.id,
              appliedDate: previewApp.appliedAt,
            }),
          }}
        />
      )}
    </div>
  )
}
