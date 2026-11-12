import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Eye,
  BarChart3,
  Activity,
  Check,
  Ban,
  BadgeCheck,
  Search,
  Filter,
  ExternalLink,
  Download,
  Copy,
  Calendar,
  Award,
  AlertOctagon,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Link } from "react-router-dom"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import CustomSelect from "../../components/ui/CustomSelect"
import { mockStats } from "../../data/mockData"
import { useJobStore } from "../../store/jobStore"
import { useApplicationStore } from "../../store/applicationStore"
import {
  companyService,
  moderationService,
  adminService,
  applicationService,
} from "../../lib/supabase"
import { getCompanyRealLogo } from "../../data/companyLogos"
import type {
  Company,
  JobReport,
  Application,
  ApplicationStatus,
  ApplicationStatusHistory,
} from "../../types"
import toast from "react-hot-toast"

const growthData = [
  { month: "Apr", users: 12, jobs: 28 },
  { month: "May", users: 18, jobs: 34 },
  { month: "Jun", users: 24, jobs: 42 },
  { month: "Jul", users: 31, jobs: 48 },
  { month: "Aug", users: 38, jobs: 54 },
  { month: "Sep", users: 45, jobs: 62 },
]

const categoryData = mockStats?.jobsByCategory ? mockStats.jobsByCategory.slice(0, 5) : []
const COLORS = [
  "var(--primary)",
  "var(--accent)",
  "#22C55E",
  "#F59E0B",
  "#8B5CF6",
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "companies" | "reports" | "jobs" | "applications"
  >("overview")
  const { jobs } = useJobStore()
  const { applications } = useApplicationStore()

  // Real data state
  const [companies, setCompanies] = useState<Company[]>([])
  const [reports, setReports] = useState<JobReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [companySearch, setCompanySearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string>("all")

  // Applications Monitoring State
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [appStats, setAppStats] = useState<any>(null)
  const [appSearch, setAppSearch] = useState("")
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all")
  const [appCompanyFilter, setAppCompanyFilter] = useState<string>("all")
  const [appJobFilter, setAppJobFilter] = useState<string>("all")
  const [appDateFilter, setAppDateFilter] = useState<string>("all")
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false)
  const [selectedAppForAudit, setSelectedAppForAudit] = useState<Application | null>(null)
  const [auditHistory, setAuditHistory] = useState<ApplicationStatusHistory[]>([])
  const [loadingAuditHistory, setLoadingAuditHistory] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [comps, reps, appsList, stats] = await Promise.all([
        companyService.getCompanies(),
        moderationService.getReports(),
        adminService.getAllApplications(),
        adminService.getApplicationStats(),
      ])
      setCompanies(comps)
      setReports(reps)
      setAllApplications(appsList)
      setAppStats(stats)
    } catch (err) {
      console.error("Error loading admin data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCompanyStatusChange = async (
    companyId: string,
    status: "pending" | "approved" | "rejected" | "blocked",
    verified?: boolean
  ) => {
    try {
      await companyService.updateStatus(companyId, status, verified)
      toast.success(`Company status updated to "${status}"`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to update company status.")
    }
  }

  const handleToggleVerified = async (company: Company) => {
    try {
      const newVerified = !company.isVerified
      await companyService.updateStatus(company.id, company.status || "approved", newVerified)
      toast.success(newVerified ? `Verified badge granted to ${company.name}` : `Verification revoked for ${company.name}`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to update verification.")
    }
  }

  const handleUpdateReport = async (reportId: string, status: "pending" | "reviewed" | "dismissed") => {
    try {
      await moderationService.updateReportStatus(reportId, status)
      toast.success(`Report marked as ${status}`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to update report status.")
    }
  }

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industry?.toLowerCase().includes(companySearch.toLowerCase())
    const matchesStatus =
      companyFilter === "all" ? true : (c.status || "pending") === companyFilter
    return matchesSearch && matchesStatus
  })

  // Applications Filtered List & Metadata
  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>()
    allApplications.forEach((a) => {
      if (a.job?.company?.name) set.add(a.job.company.name)
    })
    return Array.from(set).sort()
  }, [allApplications])

  const uniqueJobs = useMemo(() => {
    const set = new Set<string>()
    allApplications.forEach((a) => {
      if (a.job?.title) set.add(a.job.title)
    })
    return Array.from(set).sort()
  }, [allApplications])

  const filteredApplications = useMemo(() => {
    return allApplications.filter((app) => {
      const code = (app.applicationCode || app.applicationNumber || app.id || "").toLowerCase()
      const name = (app.fullName || app.applicant?.name || "").toLowerCase()
      const email = (app.email || app.applicant?.email || "").toLowerCase()
      const jobTitle = (app.job?.title || "").toLowerCase()
      const compName = (app.job?.company?.name || "").toLowerCase()

      const matchesSearch =
        !appSearch ||
        code.includes(appSearch.toLowerCase()) ||
        name.includes(appSearch.toLowerCase()) ||
        email.includes(appSearch.toLowerCase()) ||
        jobTitle.includes(appSearch.toLowerCase()) ||
        compName.includes(appSearch.toLowerCase())

      const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter
      const matchesCompany = appCompanyFilter === "all" || compName === appCompanyFilter.toLowerCase()
      const matchesJob = appJobFilter === "all" || jobTitle === appJobFilter.toLowerCase()

      let matchesDate = true
      if (appDateFilter !== "all" && app.appliedAt) {
        const appTime = new Date(app.appliedAt).getTime()
        const now = Date.now()
        if (appDateFilter === "today") {
          matchesDate = now - appTime <= 24 * 60 * 60 * 1000
        } else if (appDateFilter === "7d") {
          matchesDate = now - appTime <= 7 * 24 * 60 * 60 * 1000
        } else if (appDateFilter === "30d") {
          matchesDate = now - appTime <= 30 * 24 * 60 * 60 * 1000
        }
      }

      let matchesSuspicious = true
      if (showSuspiciousOnly) {
        const isSpamTarget = appStats?.suspiciousActivities?.some(
          (a: any) => a.targetId === (app.email || app.applicant?.email)
        )
        matchesSuspicious = Boolean(isSpamTarget)
      }

      return matchesSearch && matchesStatus && matchesCompany && matchesJob && matchesDate && matchesSuspicious
    })
  }, [allApplications, appSearch, appStatusFilter, appCompanyFilter, appJobFilter, appDateFilter, showSuspiciousOnly, appStats])

  const handleOpenAudit = async (app: Application) => {
    setSelectedAppForAudit(app)
    setLoadingAuditHistory(true)
    try {
      const history = await applicationService.getStatusHistory(app.id)
      setAuditHistory(history)
    } catch {
      setAuditHistory([])
    } finally {
      setLoadingAuditHistory(false)
    }
  }

  const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filename} successfully!`)
  }

  const exportApplicationsCSV = () => {
    const headers = [
      "Application ID",
      "Candidate Name",
      "Candidate Email",
      "Phone",
      "Location",
      "Job Title",
      "Company",
      "Current Status",
      "Total Experience",
      "Highest Education",
      "Expected Salary",
      "Applied At",
      "Last Updated",
    ]
    const rows = filteredApplications.map((app) => [
      `"${app.applicationCode || app.applicationNumber || app.id}"`,
      `"${app.fullName || app.applicant?.name || "N/A"}"`,
      `"${app.email || app.applicant?.email || "N/A"}"`,
      `"${app.mobileNumber || "N/A"}"`,
      `"${app.currentLocation || app.job?.location || "N/A"}"`,
      `"${app.job?.title || "N/A"}"`,
      `"${app.job?.company?.name || "N/A"}"`,
      `"${app.status}"`,
      `"${app.totalExperience || app.workExperience || "N/A"}"`,
      `"${app.highestEducation || app.highestQualification || "N/A"}"`,
      `"${app.expectedSalary || "N/A"}"`,
      `"${app.appliedAt || ""}"`,
      `"${app.updatedAt || ""}"`,
    ])
    downloadCSV("HireHub_Applications_Audit_Report.csv", headers, rows)
  }

  const exportApplicationsJSON = () => {
    const sanitized = filteredApplications.map((app) => ({
      applicationId: app.applicationCode || app.applicationNumber || app.id,
      candidateName: app.fullName || app.applicant?.name,
      candidateEmail: app.email || app.applicant?.email,
      phone: app.mobileNumber,
      location: app.currentLocation,
      jobTitle: app.job?.title,
      company: app.job?.company?.name,
      status: app.status,
      totalExperience: app.totalExperience || app.workExperience,
      highestEducation: app.highestEducation || app.highestQualification,
      expectedSalary: app.expectedSalary,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
    }))
    const blob = new Blob([JSON.stringify(sanitized, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "HireHub_Applications_Audit_Report.json"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Applications JSON report exported successfully!")
  }

  const getStatusBadgeVariant = (status: string): "default" | "primary" | "accent" | "navy" | "success" | "error" | "warning" | "outline" => {
    switch (status) {
      case "Applied":
        return "primary"
      case "Viewed":
        return "default"
      case "Screening":
      case "Shortlisted":
        return "accent"
      case "Assessment":
      case "Interview Scheduled":
      case "Interview":
        return "warning"
      case "Interview Completed":
      case "Selected":
      case "Offered":
      case "Hired":
        return "success"
      case "Rejected":
        return "error"
      case "Withdrawn":
        return "default"
      default:
        return "default"
    }
  }

  const pendingCompanies = companies.filter((c) => (c.status || "pending") === "pending")
  const pendingReports = reports.filter((r) => r.status === "pending")

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400 flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                  Admin Control Center
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                Enterprise moderation, company verification, and platform oversight.
              </p>
            </div>

            {/* Quick alert pill */}
            {(pendingCompanies.length > 0 || pendingReports.length > 0) && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400">
                <AlertTriangle size={15} />
                <span>
                  {pendingCompanies.length} pending review &bull; {pendingReports.length} flagged reports
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-[var(--muted)] rounded-xl mb-8 w-fit border border-[var(--border)]">
          {(["overview", "companies", "reports", "jobs", "applications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#101F3E] text-white dark:bg-[#F97316] dark:text-white shadow-xs font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab === "companies"
                ? `Companies (${companies.length})`
                : tab === "reports"
                ? `Moderation Reports (${reports.length})`
                : tab === "applications"
                ? `Applications (${allApplications.length || applications.length})`
                : tab}
            </button>
          ))}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Platform Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Active User Accounts",
                  value: "45",
                  change: "+7 this month",
                  icon: Users,
                  color: "var(--primary)",
                  bg: "bg-[var(--primary)]/10",
                },
                {
                  label: "Published Jobs",
                  value: jobs.length.toString(),
                  change: `${jobs.filter(j => j.applyMode === "both" || j.applyMode === "external").length} multi-mode`,
                  icon: Briefcase,
                  color: "#22C55E",
                  bg: "bg-green-100 dark:bg-green-900/30",
                },
                {
                  label: "Companies Onboarded",
                  value: companies.length.toString(),
                  change: `${companies.filter(c => c.isVerified).length} verified`,
                  icon: Building2,
                  color: "#F59E0B",
                  bg: "bg-yellow-100 dark:bg-yellow-900/30",
                },
                {
                  label: "In-App Applications",
                  value: (allApplications.length || applications.length).toString(),
                  change: `${allApplications.filter(a => a.status === "Interview" || a.status === "Interview Scheduled" || a.status === "Interview Completed").length} in interview, ${allApplications.filter(a => a.status === "Selected" || a.status === "Hired" || a.status === "Offered").length} hired`,
                  icon: FileText,
                  color: "#8B5CF6",
                  bg: "bg-purple-100 dark:bg-purple-900/30",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]"
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                    {stat.change}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                      Platform Growth & Marketplace Velocity
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Candidate registrations and job listings volume
                    </p>
                  </div>
                  <BarChart3 size={18} className="text-[var(--muted-foreground)]" />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#userGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pending Approvals Queue */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-poppins font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <Building2 size={16} className="text-[var(--primary)]" />
                      Pending Verifications
                    </h3>
                    <Badge variant="warning">{pendingCompanies.length} queue</Badge>
                  </div>
                  <div className="space-y-3">
                    {pendingCompanies.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)] py-4 text-center">
                        All companies are verified and reviewed!
                      </p>
                    ) : (
                      pendingCompanies.slice(0, 3).map((comp) => (
                        <div
                          key={comp.id}
                          className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--foreground)] truncate">
                              {comp.name}
                            </p>
                            <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                              {comp.industry} &bull; {comp.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCompanyStatusChange(comp.id, "approved", true)}
                              className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20"
                              title="Approve & Verify"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleCompanyStatusChange(comp.id, "rejected", false)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("companies")}
                  className="w-full mt-4"
                >
                  View All Companies
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. COMPANIES TAB */}
        {activeTab === "companies" && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                  Company Directory & Verification
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Only approved companies can publish jobs to the marketplace.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Search company..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <CustomSelect
                  value={companyFilter}
                  onChange={(val) => setCompanyFilter(String(val))}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "blocked", label: "Blocked" },
                  ]}
                  size="sm"
                  className="w-36"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Industry & Size</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Verified Badge</th>
                    <th className="px-6 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredCompanies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-[var(--border)] p-1 flex items-center justify-center shrink-0 shadow-xs">
                            <img
                              src={getCompanyRealLogo(comp.name, comp.website, comp.logo)}
                              alt={comp.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = getCompanyRealLogo(comp.name, comp.website)
                              }}
                            />
                          </div>
                          <div>
                            <Link
                              to={`/companies/${comp.slug || comp.id}`}
                              className="font-bold text-sm text-[var(--foreground)] hover:text-[var(--primary)] flex items-center gap-1.5"
                            >
                              {comp.name}
                              <ExternalLink size={12} className="text-[var(--muted-foreground)]" />
                            </Link>
                            <span className="text-[11px] text-[var(--muted-foreground)]">
                              /{comp.slug || comp.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                        {comp.industry || "Technology"} &bull; {comp.size || "50-200"}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">
                        {comp.location || "Remote"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            comp.status === "approved"
                              ? "success"
                              : comp.status === "pending"
                                ? "warning"
                                : "error"
                          }
                        >
                          {comp.status || "pending"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleVerified(comp)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            comp.isVerified
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--border)]"
                          }`}
                        >
                          <BadgeCheck size={13} className={comp.isVerified ? "text-blue-500" : ""} />
                          {comp.isVerified ? "Verified" : "Unverified"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {comp.status !== "approved" && (
                            <button
                              onClick={() => handleCompanyStatusChange(comp.id, "approved", true)}
                              className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 font-semibold"
                            >
                              Approve
                            </button>
                          )}
                          {comp.status !== "rejected" && (
                            <button
                              onClick={() => handleCompanyStatusChange(comp.id, "rejected", false)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold"
                            >
                              Reject
                            </button>
                          )}
                          {comp.status !== "blocked" && (
                            <button
                              onClick={() => handleCompanyStatusChange(comp.id, "blocked", false)}
                              className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold flex items-center gap-1"
                            >
                              <Ban size={12} /> Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. MODERATION REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)]">
              <h3 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                Trust & Safety Moderation Queue
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Review flagged job postings and take compliance actions.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle size={36} className="mx-auto text-green-500 mb-2 opacity-80" />
                <p className="font-semibold text-sm text-[var(--foreground)]">No unresolved reports</p>
                <p className="text-xs text-[var(--muted-foreground)]">All job reports have been reviewed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase">
                    <tr>
                      <th className="px-6 py-3.5">Report Reason</th>
                      <th className="px-6 py-3.5">Target Job ID</th>
                      <th className="px-6 py-3.5">Details</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Reported Date</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-[var(--foreground)]">
                          {rep.reason}
                        </td>
                        <td className="px-6 py-4 font-mono text-[var(--muted-foreground)]">
                          <Link to={`/jobs/${rep.jobId}`} className="text-[var(--primary)] hover:underline">
                            {rep.jobId.slice(0, 10)}...
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground)] max-w-xs truncate">
                          {rep.details || "No additional commentary provided"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={rep.status === "reviewed" ? "success" : rep.status === "pending" ? "warning" : "default"}>
                            {rep.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)]">
                          {new Date(rep.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {rep.status !== "reviewed" && (
                              <button
                                onClick={() => handleUpdateReport(rep.id, "reviewed")}
                                className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 font-semibold"
                              >
                                Mark Reviewed
                              </button>
                            )}
                            {rep.status !== "dismissed" && (
                              <button
                                onClick={() => handleUpdateReport(rep.id, "dismissed")}
                                className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)] font-semibold"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. JOBS TAB */}
        {activeTab === "jobs" && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                  All Marketplace Listings
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Monitoring apply modes (Easy Apply vs External ATS) and applicant flow.
                </p>
              </div>
              <Badge variant="primary">{jobs.length} Active Listings</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Job Title</th>
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Apply Mode</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Applications</th>
                    <th className="px-6 py-3.5 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--foreground)]">
                        {job.title}
                      </td>
                      <td className="px-6 py-4 text-[var(--foreground)]">
                        {job.company?.name || "Company"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          job.applyMode === "both"
                            ? "bg-purple-500/10 text-purple-600"
                            : job.applyMode === "external"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {job.applyMode === "both" ? "Easy & External" : job.applyMode === "external" ? "External ATS" : "Easy Apply"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">
                        {job.location || "Remote"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                        {job.applicationCount || 0} applicants
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--primary)] font-semibold hover:bg-[var(--primary)]/10"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. APPLICATIONS TAB (ATS & PLATFORM OVERSIGHT) */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Total Applications</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <FileText size={15} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{allApplications.length}</p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Across all jobs & companies</p>
              </div>

              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Submissions Today</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Calendar size={15} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{appStats?.todayCount || 0}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Past 24 hours velocity</p>
              </div>

              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">In Active Funnel</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <TrendingUp size={15} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {allApplications.filter(
                    (a) =>
                      a.status === "Shortlisted" ||
                      a.status === "Assessment" ||
                      a.status === "Interview" ||
                      a.status === "Interview Scheduled" ||
                      a.status === "Interview Completed"
                  ).length}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Screening & Interview loop</p>
              </div>

              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Selected / Hired</span>
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                    <Award size={15} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{appStats?.hiredCount || 0}</p>
                <p className="text-[11px] text-green-600 font-semibold mt-1">
                  {appStats?.conversionRate || 0}% overall progression
                </p>
              </div>

              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Suspicious Flags</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <AlertOctagon size={15} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {appStats?.suspiciousActivities?.length || 0}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">Velocity & anomaly spikes</p>
              </div>
            </div>

            {/* Suspicious Activity Alerts Banner */}
            {appStats?.suspiciousActivities && appStats.suspiciousActivities.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertOctagon size={18} className="text-amber-600 shrink-0" />
                  <h4 className="font-bold text-sm text-[var(--foreground)]">
                    Application Integrity & Suspicious Activity Alerts ({appStats.suspiciousActivities.length})
                  </h4>
                </div>
                <div className="space-y-2 mt-3">
                  {appStats.suspiciousActivities.map((alert: any) => (
                    <div
                      key={alert.id}
                      className="bg-[var(--card)]/80 rounded-xl p-3 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--foreground)]">{alert.title}</span>
                          <Badge variant={alert.severity === "high" ? "error" : "warning"} size="sm">
                            {alert.severity} priority
                          </Badge>
                        </div>
                        <p className="text-[var(--muted-foreground)]">{alert.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAppSearch(alert.targetId)
                            setShowSuspiciousOnly(true)
                          }}
                        >
                          Investigate Target
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Oversight Notice */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <Shield size={18} className="text-blue-500 shrink-0" />
              <div>
                <span className="font-bold text-[var(--foreground)]">Administrator Privacy & Oversight Policy:</span>{" "}
                Admin monitoring is strictly restricted to platform health, audit trail logs, and bot/spam prevention.
                In accordance with hiring governance, administrative users cannot modify candidate hiring statuses or
                divert hiring decisions away from employer recruiters.
              </div>
            </div>

            {/* Search & Filters Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search by ID (APP-...), candidate name, email, job title, or company..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] cursor-pointer"
                >
                  <option value="all">All Statuses ({allApplications.length})</option>
                  <option value="Applied">Applied</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Screening">Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interview Completed">Interview Completed</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>

                {/* Company Filter */}
                <select
                  value={appCompanyFilter}
                  onChange={(e) => setAppCompanyFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] cursor-pointer"
                >
                  <option value="all">All Employers</option>
                  {uniqueCompanies.map((c) => (
                    <option key={c} value={c.toLowerCase()}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Job Title Filter */}
                <select
                  value={appJobFilter}
                  onChange={(e) => setAppJobFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] cursor-pointer"
                >
                  <option value="all">All Job Titles</option>
                  {uniqueJobs.map((j) => (
                    <option key={j} value={j.toLowerCase()}>
                      {j}
                    </option>
                  ))}
                </select>

                {/* Date Filter */}
                <select
                  value={appDateFilter}
                  onChange={(e) => setAppDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="today">Past 24 Hours</option>
                  <option value="7d">Past 7 Days</option>
                  <option value="30d">Past 30 Days</option>
                </select>

                {/* Suspicious Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSuspiciousOnly(!showSuspiciousOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showSuspiciousOnly
                      ? "bg-amber-500/15 text-amber-600 border-amber-500/40"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--border)]"
                  }`}
                >
                  <AlertOctagon size={14} />
                  <span>Flagged Only</span>
                </button>

                {/* Export Actions */}
                <Button variant="outline" size="sm" onClick={exportApplicationsCSV}>
                  <Download size={13} className="mr-1.5" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportApplicationsJSON}>
                  <FileSpreadsheet size={13} className="mr-1.5" /> JSON
                </Button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Application ID</th>
                      <th className="px-5 py-3.5">Candidate</th>
                      <th className="px-5 py-3.5">Job Posting & Employer</th>
                      <th className="px-5 py-3.5">Qualifications</th>
                      <th className="px-5 py-3.5">Applied Date</th>
                      <th className="px-5 py-3.5">Stage Status</th>
                      <th className="px-5 py-3.5 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-[var(--muted-foreground)]">
                          <FileText size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-sm text-[var(--foreground)]">No applications found</p>
                          <p className="text-xs">Adjust your search query or reset the filter dropdowns.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const code = app.applicationCode || app.applicationNumber || app.id
                        const candName = app.fullName || app.applicant?.name || "Candidate"
                        const candEmail = app.email || app.applicant?.email || "No email"

                        return (
                          <tr key={app.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                            {/* Application ID */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[var(--foreground)]">{code}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(code)
                                    toast.success("Application ID copied to clipboard!")
                                  }}
                                  className="text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer p-0.5 rounded"
                                  title="Copy Application ID"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </td>

                            {/* Candidate */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold flex items-center justify-center shrink-0 text-xs">
                                  {candName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-[var(--foreground)] truncate">{candName}</p>
                                  <p className="text-[11px] text-[var(--muted-foreground)] truncate">{candEmail}</p>
                                </div>
                              </div>
                            </td>

                            {/* Job & Company */}
                            <td className="px-5 py-4">
                              <p className="font-bold text-[var(--foreground)]">{app.job?.title || "Job Listing"}</p>
                              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                                <span>{app.job?.company?.name || "Employer"}</span>
                                <span>&bull;</span>
                                <span>{app.job?.location || "Remote"}</span>
                              </div>
                            </td>

                            {/* Qualifications */}
                            <td className="px-5 py-4 text-[var(--muted-foreground)]">
                              <p className="font-medium text-[var(--foreground)]">
                                {app.totalExperience || app.workExperience || "Not specified"}
                              </p>
                              <p className="text-[11px] truncate max-w-[180px]">
                                {app.highestEducation || app.highestQualification || "General"}
                              </p>
                            </td>

                            {/* Applied Date */}
                            <td className="px-5 py-4 whitespace-nowrap text-[var(--muted-foreground)]">
                              {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recent"}
                            </td>

                            {/* Status Badge */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <Badge variant={getStatusBadgeVariant(app.status)} size="sm">
                                {app.status}
                              </Badge>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleOpenAudit(app)}
                                className="px-2.5 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] font-semibold flex items-center gap-1.5 ml-auto cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Audit</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Read-Only Application Audit Modal */}
            <AnimatePresence>
              {selectedAppForAudit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="p-5 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--card)] z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[var(--primary)]">
                            {selectedAppForAudit.applicationCode ||
                              selectedAppForAudit.applicationNumber ||
                              selectedAppForAudit.id}
                          </span>
                          <Badge variant={getStatusBadgeVariant(selectedAppForAudit.status)} size="sm">
                            {selectedAppForAudit.status}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-base text-[var(--foreground)] mt-0.5">
                          {selectedAppForAudit.job?.title} at {selectedAppForAudit.job?.company?.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedAppForAudit(null)}
                        className="p-1.5 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] cursor-pointer"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>

                    <div className="p-6 space-y-6 text-xs">
                      {/* Governance Disclaimer */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-medium">
                        <Shield size={16} className="shrink-0" />
                        <span>
                          Read-Only Administrator Audit: Hiring decisions and notes are controlled exclusively by authorized employer recruiters.
                        </span>
                      </div>

                      {/* Candidate Profile Details */}
                      <div>
                        <h4 className="font-bold text-sm text-[var(--foreground)] mb-3">Candidate Information</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[var(--muted)]/40 p-4 rounded-xl border border-[var(--border)]">
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Full Name</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.fullName || selectedAppForAudit.applicant?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Email Address</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.email || selectedAppForAudit.applicant?.email || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Phone Number</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.mobileNumber || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Location</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.currentLocation || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Total Experience</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.totalExperience || selectedAppForAudit.workExperience || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Highest Education</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.highestEducation || selectedAppForAudit.highestQualification || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Employment Status</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.currentEmploymentStatus || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Expected Salary</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.expectedSalary || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)] block text-[11px]">Notice Period</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {selectedAppForAudit.noticePeriod || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Candidate Skills */}
                        {(selectedAppForAudit.skills || selectedAppForAudit.applicant?.skills) && (
                          <div className="mt-3">
                            <span className="text-[var(--muted-foreground)] block text-[11px] mb-1.5 font-semibold">
                              Skills
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(selectedAppForAudit.skills || selectedAppForAudit.applicant?.skills || []).map((s) => (
                                <span
                                  key={s}
                                  className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[11px] font-medium text-[var(--foreground)]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Candidate Links */}
                        <div className="flex flex-wrap gap-3 mt-3">
                          {selectedAppForAudit.linkedinUrl && (
                            <a
                              href={selectedAppForAudit.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink size={12} /> LinkedIn Profile
                            </a>
                          )}
                          {selectedAppForAudit.portfolioUrl && (
                            <a
                              href={selectedAppForAudit.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--primary)] hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink size={12} /> Portfolio / GitHub
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Cover Letter */}
                      {selectedAppForAudit.coverLetter && (
                        <div>
                          <h4 className="font-bold text-sm text-[var(--foreground)] mb-2">Candidate Cover Pitch</h4>
                          <div className="p-3.5 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)] whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
                            {selectedAppForAudit.coverLetter}
                          </div>
                        </div>
                      )}

                      {/* Employer Screening Answers */}
                      {selectedAppForAudit.answers && Object.keys(selectedAppForAudit.answers).length > 0 && (
                        <div>
                          <h4 className="font-bold text-sm text-[var(--foreground)] mb-2">Employer Screening Answers</h4>
                          <div className="space-y-2">
                            {Object.entries(selectedAppForAudit.answers).map(([key, val]) => (
                              <div key={key} className="p-3 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)]">
                                <p className="font-semibold text-[var(--muted-foreground)] text-[11px]">{key}</p>
                                <p className="font-bold text-[var(--foreground)] mt-0.5">{String(val)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Lifecycle Audit History */}
                      <div>
                        <h4 className="font-bold text-sm text-[var(--foreground)] mb-3">
                          Lifecycle Status History Audit Trail
                        </h4>
                        {loadingAuditHistory ? (
                          <div className="p-4 text-center text-[var(--muted-foreground)]">
                            <RefreshCw size={16} className="animate-spin mx-auto mb-1" />
                            Loading audit logs...
                          </div>
                        ) : auditHistory.length === 0 ? (
                          <div className="p-3 bg-[var(--muted)]/30 rounded-xl text-[var(--muted-foreground)]">
                            No milestone status changes recorded yet. Initial status: {selectedAppForAudit.status}.
                          </div>
                        ) : (
                          <div className="space-y-2 border-l-2 border-[var(--primary)]/30 pl-4 ml-2">
                            {auditHistory.map((item, idx) => (
                              <div key={item.id || idx} className="relative pb-2">
                                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-[var(--foreground)]">
                                    {item.previousStatus ? `${item.previousStatus} → ` : ""}
                                    {item.newStatus || item.status}
                                  </span>
                                  <span className="text-[var(--muted-foreground)]">
                                    {item.createdAt || item.changedAt
                                      ? new Date(item.createdAt || item.changedAt || "").toLocaleString()
                                      : "Recorded"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                                  Action by: <span className="font-medium text-[var(--foreground)]">{item.changedByName || "Recruiter"}</span>
                                </p>
                                {(item.remarks || item.notes) && (
                                  <p className="text-[11px] bg-[var(--muted)]/60 px-2 py-1 rounded mt-1 text-[var(--foreground)]">
                                    {item.remarks || item.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[var(--border)] flex justify-end bg-[var(--card)] sticky bottom-0">
                      <Button variant="outline" size="sm" onClick={() => setSelectedAppForAudit(null)}>
                        Close Audit View
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
