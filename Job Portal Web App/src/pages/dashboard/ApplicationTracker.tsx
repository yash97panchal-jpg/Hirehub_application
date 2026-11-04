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
import { applicationService } from "../../lib/supabase"
import ApplicationSuccessModal from "../../components/jobs/ApplicationSuccessModal"
import { emailService } from "../../services/emailService"
import type { Application, ApplicationStatus } from "../../types"
import toast from "react-hot-toast"

export default function ApplicationTracker() {
  const { applications: storeApplications } = useApplicationStore()
  const { user } = useAuthStore()

  const [filterSource, setFilterSource] = useState<"all" | "easy" | "external">("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
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
  const handleWithdraw = async (appId: string) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      return
    }

    setWithdrawingId(appId)
    try {
      await applicationService.withdrawApplication(appId)
      toast.success("Application successfully withdrawn.")
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
        return <Badge variant="success">Offer Extended 🎉</Badge>
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
            <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)] flex items-center gap-2.5">
              <Briefcase className="text-[var(--primary)]" />
              Application Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Live tracking for your Easy Apply submissions and external ATS applications.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)]"
            >
              <option value="all">All Sources</option>
              <option value="easy">⚡ Easy Apply (In-App)</option>
              <option value="external">🌐 External Website</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)]"
            >
              <option value="all">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Viewed">Viewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Offered</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
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
                  className="p-5 sm:p-6 hover:bg-[var(--muted)]/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg text-[var(--primary)] border border-[var(--border)] p-1 shadow-xs">
                      {app.job?.company?.logo ? (
                        <img
                          src={app.job.company.logo}
                          alt={app.job.company.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerHTML = `<span class="text-base font-bold text-[var(--primary)]">${app.job?.company?.name?.charAt(0) || "C"}</span>`;
                            }
                          }}
                        />
                      ) : (
                        app.job?.company?.name?.charAt(0) || "C"
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/jobs/${app.job?.id}`}
                          className="font-poppins font-bold text-base text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
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

                      <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                        <span>{app.job?.company?.name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {app.job?.location}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />{" "}
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </p>

                      {app.coverLetter && (
                        <p className="text-xs text-[var(--muted-foreground)] italic line-clamp-1 pt-1">
                          Note: "{app.coverLetter}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stage & Action Controls */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <div className="text-right">
                      {getStatusBadge(app.status)}
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                        {app.status === "Withdrawn"
                          ? "Application closed"
                          : app.status === "Interview"
                            ? "Action needed: check email"
                            : "Live status updated"}
                      </p>
                    </div>

                    {/* View Confirmation Email / Details */}
                    <button
                      type="button"
                      onClick={() => setPreviewApp(app)}
                      className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                      title="View Confirmation Email & Company Details"
                    >
                      <Mail size={15} />
                    </button>

                    {/* Withdraw button for in-app applications that aren't already closed */}
                    {app.source !== "external" && app.status !== "Withdrawn" && app.status !== "Rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                        className="text-xs text-red-500 hover:text-red-700 hover:border-red-300"
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
            companyLogo: previewApp.job?.company?.logo,
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
