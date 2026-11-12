import { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  Users,
  Eye,
  Star,
  Plus,
  MoreHorizontal,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Copy,
  Trash2,
  Sparkles,
  ExternalLink,
  Download,
  PauseCircle,
  PlayCircle,
  XCircle,
  ShieldCheck,
  Zap,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import toast from "react-hot-toast"
import { useJobStore } from "../../store/jobStore"
import { useApplicationStore } from "../../store/applicationStore"
import { useAuthStore } from "../../store/authStore"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import type { Job, JobStatus } from "../../types"

const weeklyData = [
  { day: "Mon", applications: 14 },
  { day: "Tue", applications: 22 },
  { day: "Wed", applications: 18 },
  { day: "Thu", applications: 31 },
  { day: "Fri", applications: 27 },
  { day: "Sat", applications: 8 },
  { day: "Sun", applications: 5 },
]

const statusVariant: Record<string, any> = {
  Shortlisted: "success",
  Interview: "primary",
  Viewed: "warning",
  Applied: "default",
  Offered: "accent",
  Hired: "success",
  Rejected: "error",
}

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    jobs: storeJobs,
    updateJob,
    deleteJob,
    duplicateJob,
    toggleFeaturedJob,
    toggleStatus,
  } = useJobStore()
  const { applications } = useApplicationStore()

  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applicants">("overview")
  const [jobSearch, setJobSearch] = useState("")
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("all")
  const [applicantSearch, setApplicantSearch] = useState("")
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>("all")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Subscription plan & posting quota
  const planDetails = {
    tier: "Growth Plan",
    maxJobs: 10,
    usedJobs: storeJobs.filter((j) => j.status === "published" || j.status === "active").length,
    renewDate: "Dec 31, 2026",
  }
  const quotaPercent = Math.min(100, Math.round((planDetails.usedJobs / planDetails.maxJobs) * 100))

  // Real pipeline metrics
  const realApplied = applications.length
  const realShortlisted = applications.filter((a) => a.status === "Shortlisted").length
  const realInterviews = applications.filter((a) => a.status === "Interview").length
  const realHired = applications.filter((a) => a.status === "Offered" || a.status === "Hired").length

  const funnelData = useMemo(() => {
    const applied = applications.length
    const viewed = applications.filter((a) =>
      ["Viewed", "Screening", "Shortlisted", "Assessment", "Interview", "Final Selection", "Offered", "Hired"].includes(a.status)
    ).length
    const shortlisted = applications.filter((a) =>
      ["Shortlisted", "Assessment", "Interview", "Final Selection", "Offered", "Hired"].includes(a.status)
    ).length
    const interview = applications.filter((a) =>
      ["Interview", "Final Selection", "Offered", "Hired"].includes(a.status)
    ).length
    const offered = applications.filter((a) => ["Offered", "Hired"].includes(a.status)).length

    return [
      { stage: "Applied", count: applied },
      { stage: "Screened", count: viewed },
      { stage: "Shortlisted", count: shortlisted },
      { stage: "Interview", count: interview },
      { stage: "Hired", count: offered },
    ]
  }, [applications])

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return storeJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.category.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.location.toLowerCase().includes(jobSearch.toLowerCase())
      const matchesStatus =
        jobStatusFilter === "all" ||
        (jobStatusFilter === "active" && (job.status === "published" || job.status === "active")) ||
        job.status === jobStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [storeJobs, jobSearch, jobStatusFilter])

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const candidateName = app.applicant?.name || ""
      const jobTitle = app.job?.title || ""
      const matchesSearch =
        candidateName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        jobTitle.toLowerCase().includes(applicantSearch.toLowerCase())
      const matchesStatus =
        applicantStatusFilter === "all" || app.status === applicantStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, applicantSearch, applicantStatusFilter])

  // Handlers
  const handleDuplicate = (id: string, title: string) => {
    const duplicated = duplicateJob(id)
    if (duplicated) {
      toast.success(`Duplicated "${title}" as a draft opening!`)
    }
  }

  const handleDeleteJob = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the job post "${title}"?`)) {
      deleteJob(id)
      toast.success("Job post deleted successfully.")
    }
  }

  const handleToggleStatus = (id: string, currentStatus: JobStatus) => {
    const nextStatus: JobStatus =
      currentStatus === "published" || currentStatus === "active"
        ? "closed"
        : "published"
    toggleStatus(id, nextStatus)
    toast.success(`Job marked as ${nextStatus}!`)
  }

  const handleToggleFeatured = (id: string, isFeatured?: boolean) => {
    toggleFeaturedJob(id)
    toast.success(isFeatured ? "Removed from featured listings." : "Promoted to Featured Job!")
  }

  // Export Applicants to CSV
  const exportApplicantsCSV = () => {
    if (filteredApplicants.length === 0) {
      toast.error("No applicants available to export.")
      return
    }
    const headers = [
      "Applicant Name",
      "Email",
      "Applied Job",
      "ATS Score (%)",
      "Status",
      "Applied Date",
      "Resume URL",
    ]
    const rows = filteredApplicants.map((app) => [
      `"${app.applicant?.name || "Candidate"}"`,
      `"${app.applicant?.email || ""}"`,
      `"${app.job?.title || ""}"`,
      app.atsScore || 0,
      `"${app.status}"`,
      `"${app.appliedAt}"`,
      `"${app.resumeUrl || ""}"`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `HireHub_Applicants_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Applicants exported to CSV successfully!")
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                Recruiter Command Center
              </h1>
              <Badge variant="accent" size="sm">
                {planDetails.tier}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Manage talent acquisition, job postings, candidate pipelines, and automated ATS hiring.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              onClick={() => navigate("/recruiter/company-profile")}
            >
              Company Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/recruiter/applicants")}
            >
              <Users size={16} className="mr-1.5" /> ATS Kanban
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/recruiter/post-job")}
            >
              <Plus size={16} className="mr-1.5" /> Post New Job
            </Button>
          </div>
        </motion.div>

        {/* Plan Quota Meter Banner */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 mb-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--foreground)]">
                  Job Posting Quota: {planDetails.usedJobs} / {planDetails.maxJobs} slots active
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  ({10 - planDetails.usedJobs} remaining)
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Active slots renew on {planDetails.renewDate}. Need more slots or featured spotlight?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-48 bg-[var(--muted)] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  quotaPercent > 80 ? "bg-red-500" : "bg-[var(--primary)]"
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpgradeModal(true)}
              className="shrink-0"
            >
              Upgrade Tier
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--muted)] rounded-xl mb-8 w-fit border border-[var(--border)]">
          {(["overview", "jobs", "applicants"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[var(--card)] text-[#F97316] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab === "jobs"
                ? `Job Posts (${storeJobs.length})`
                : tab === "applicants"
                ? `Applicants (${applications.length})`
                : "Overview & Analytics"}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Active Jobs",
                  value: storeJobs.length,
                  icon: Briefcase,
                  color: "#F97316",
                  bg: "bg-orange-50 dark:bg-orange-950/40 text-[#EA580C]",
                  change: `${planDetails.usedJobs} active / ${planDetails.maxJobs} limit`,
                },
                {
                  label: "Total Applicants",
                  value: realApplied,
                  icon: Users,
                  color: "#101F3E",
                  bg: "bg-slate-100 dark:bg-slate-800 text-[#101F3E] dark:text-orange-300",
                  change: realApplied > 0 ? `${realApplied} candidates` : "0 candidates",
                },
                {
                  label: "Shortlisted",
                  value: realShortlisted,
                  icon: Star,
                  color: "#F59E0B",
                  bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-500",
                  change: realShortlisted > 0 ? `${realShortlisted} shortlisted` : "0 shortlisted",
                },
                {
                  label: "Interviews & Hired",
                  value: realInterviews + realHired,
                  icon: CheckCircle,
                  color: "#16A34A",
                  bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
                  change: `${realInterviews} interviews, ${realHired} hired`,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 shadow-xs"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
                  >
                    <stat.icon size={19} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)] mt-0.5">
                    {stat.label}
                  </p>
                  <p
                    className="text-xs font-semibold mt-2"
                    style={{ color: stat.color }}
                  >
                    {stat.change}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Hiring Funnel */}
              <div className="lg:col-span-2">
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] h-full">
                  <h3 className="font-poppins font-semibold text-[var(--foreground)] mb-1">
                    Hiring Funnel
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mb-4">
                    Candidates progression across active stages
                  </p>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart
                      data={funnelData}
                      layout="vertical"
                      margin={{ left: 8, right: 16, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Applications Area Chart */}
              <div className="lg:col-span-3">
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                        Applications Trend
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Inflow volume across the last 7 days
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                      <TrendingUp size={14} /> +24% inflow
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={230}>
                    <AreaChart
                      data={weeklyData}
                      margin={{ left: -16, right: 8, top: 4, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="recruiterGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        fill="url(#recruiterGrad)"
                        dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Active Jobs Quick View */}
              <div className="lg:col-span-3">
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                    <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                      Recent Job Postings
                    </h3>
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Manage all ({storeJobs.length}) <ChevronRight size={13} />
                    </button>
                  </div>
                  {storeJobs.slice(0, 4).map((job, i) => (
                    <div
                      key={job.id}
                      className={`p-4 flex items-center justify-between gap-4 ${
                        i < 3 ? "border-b border-[var(--border)]" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                            {job.title}
                          </p>
                          {job.isFeatured && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {job.applicationCount} applicants
                          </span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className="capitalize">{job.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            job.status === "published" || job.status === "active"
                              ? "success"
                              : job.status === "draft"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        >
                          {job.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(job.id, job.title)}
                          title="Duplicate Job"
                        >
                          <Copy size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applicants Quick View */}
              <div className="lg:col-span-2">
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                    <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                      Recent Candidates
                    </h3>
                    <button
                      onClick={() => setActiveTab("applicants")}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View all ({applications.length}) <ChevronRight size={13} />
                    </button>
                  </div>
                  {applications.slice(0, 4).map((a, i) => (
                    <div
                      key={a.id || i}
                      className={`p-4 flex items-center gap-3 ${
                        i < 3 ? "border-b border-[var(--border)]" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0">
                        {(a.applicant?.name || "Candidate")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                          {a.applicant?.name || "Applicant"}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                          {a.job?.title || "Role"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold text-[var(--primary)]">
                          {a.atsScore || 85}% ATS
                        </span>
                        <Badge variant={statusVariant[a.status] || "default"} size="sm">
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOB POSTS MANAGEMENT */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="flex items-center gap-2 w-full md:w-80">
                <div className="relative w-full">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  />
                  <input
                    type="text"
                    placeholder="Search by title, department, location..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-[var(--muted-foreground)] mr-1">Status:</span>
                {["all", "active", "draft", "closed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setJobStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      jobStatusFilter === st
                        ? "bg-[var(--primary)] text-white shadow-xs"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/recruiter/post-job")}
                  className="ml-auto md:ml-2"
                >
                  <Plus size={14} className="mr-1" /> New Post
                </Button>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
                    <tr>
                      <th className="px-5 py-3.5">Job Title & Details</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Applicants</th>
                      <th className="px-4 py-3.5">Spotlight</th>
                      <th className="px-4 py-3.5">Posted Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-[var(--muted-foreground)]">
                          No job posts matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-sm text-[var(--foreground)]">
                              {job.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--muted-foreground)]">
                              <span>{job.category}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                              <span>•</span>
                              <span>{job.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={
                                job.status === "published" || job.status === "active"
                                  ? "success"
                                  : job.status === "draft"
                                  ? "warning"
                                  : "default"
                              }
                              size="sm"
                            >
                              {job.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              to={`/recruiter/applicants?jobId=${job.id}`}
                              className="font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                            >
                              <Users size={13} />
                              {job.applicationCount} candidates
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleToggleFeatured(job.id, job.isFeatured)}
                              className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                job.isFeatured
                                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                              }`}
                            >
                              <Sparkles size={11} />
                              {job.isFeatured ? "Featured" : "Standard"}
                            </button>
                          </td>
                          <td className="px-4 py-4 text-[var(--muted-foreground)] font-mono text-[11px]">
                            {new Date(job.postedAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(job.id, job.status)}
                                title={
                                  job.status === "published" || job.status === "active"
                                    ? "Pause / Close Job"
                                    : "Publish Job"
                                }
                                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors cursor-pointer"
                              >
                                {job.status === "published" || job.status === "active" ? (
                                  <PauseCircle size={14} className="text-amber-500" />
                                ) : (
                                  <PlayCircle size={14} className="text-green-500" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDuplicate(job.id, job.title)}
                                title="Duplicate Job Opening"
                                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors cursor-pointer"
                              >
                                <Copy size={14} />
                              </button>
                              <Link
                                to={`/jobs/${job.id}`}
                                target="_blank"
                                title="View Public Job Listing"
                                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors cursor-pointer inline-block"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                onClick={() => handleDeleteJob(job.id, job.title)}
                                title="Delete Job Opening"
                                className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: APPLICANTS MANAGEMENT & EXPORT */}
        {activeTab === "applicants" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="flex items-center gap-2 w-full md:w-80">
                <div className="relative w-full">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  />
                  <input
                    type="text"
                    placeholder="Search candidate name or role..."
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={applicantStatusFilter}
                  onChange={(e) => setApplicantStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Interview">Interview</option>
                  <option value="Final Selection">Final Selection</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <Button variant="outline" size="sm" onClick={exportApplicantsCSV}>
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/recruiter/applicants")}
                >
                  Open Full ATS Kanban
                </Button>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
                    <tr>
                      <th className="px-5 py-3.5">Candidate</th>
                      <th className="px-4 py-3.5">Applied Position</th>
                      <th className="px-4 py-3.5">ATS Match</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Applied Date</th>
                      <th className="px-5 py-3.5 text-right">Quick Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredApplicants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-[var(--muted-foreground)]">
                          No applicants found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApplicants.map((app) => (
                        <tr key={app.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-bold flex items-center justify-center shrink-0">
                                {(app.applicant?.name || "Candidate")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-[var(--foreground)]">
                                  {app.applicant?.name || "Candidate"}
                                </p>
                                <p className="text-[11px] text-[var(--muted-foreground)]">
                                  {app.applicant?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-[var(--foreground)]">
                            {app.job?.title || "Role"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-md">
                              {app.atsScore || 85}%
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={statusVariant[app.status] || "default"} size="sm">
                              {app.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-[var(--muted-foreground)] font-mono text-[11px]">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate("/recruiter/applicants")}
                            >
                              Review Candidate
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Subscription Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--card)] rounded-3xl border border-[var(--border)] max-w-2xl w-full p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-poppins font-bold text-xl text-[var(--foreground)]">
                    Recruiter Subscription Plans
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Scale your hiring pipeline with dedicated job slots and priority candidate matching.
                  </p>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 my-6">
                {[
                  {
                    name: "Starter",
                    price: "$0",
                    period: "/mo",
                    jobs: "3 Active Postings",
                    features: ["Standard ATS pipeline", "Basic applicant filters", "Email alerts"],
                    current: false,
                  },
                  {
                    name: "Growth",
                    price: "$149",
                    period: "/mo",
                    jobs: "10 Active Postings",
                    features: ["Automated ATS Kanban", "Talent Pool Bookmarking", "Interview Scheduler", "CSV/Excel Data Export"],
                    current: true,
                  },
                  {
                    name: "Enterprise",
                    price: "$499",
                    period: "/mo",
                    jobs: "Unlimited Postings",
                    features: ["Dedicated Talent Manager", "Custom Webhooks & API", "Top-tier Featured Spotlights", "Unlimited Team Seats"],
                    current: false,
                  },
                ].map((tier) => (
                  <div
                    key={tier.name}
                    className={`rounded-2xl border p-4 flex flex-col justify-between ${
                      tier.current
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[var(--foreground)]">{tier.name}</span>
                        {tier.current && (
                          <span className="text-[10px] font-bold uppercase bg-[var(--primary)] text-white px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-[var(--foreground)]">{tier.price}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{tier.period}</span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--primary)] mt-1">{tier.jobs}</p>
                      <ul className="mt-3 space-y-1.5 text-[11px] text-[var(--muted-foreground)]">
                        {tier.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-green-500 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant={tier.current ? "outline" : "primary"}
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => {
                        toast.success(`Selected ${tier.name} Plan! Request forwarded to billing.`);
                        setShowUpgradeModal(false);
                      }}
                    >
                      {tier.current ? "Active Plan" : "Choose Plan"}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-center text-xs text-[var(--muted-foreground)]">
                All subscriptions include 256-bit encrypted data storage, RLS compliance, and candidate privacy protection.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
