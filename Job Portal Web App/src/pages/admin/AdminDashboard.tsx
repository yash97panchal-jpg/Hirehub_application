import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
import { companyService, moderationService } from "../../lib/supabase"
import { getCompanyRealLogo } from "../../data/companyLogos"
import type { Company, JobReport } from "../../types"
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
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "reports" | "jobs">("overview")
  const { jobs } = useJobStore()
  const { applications } = useApplicationStore()

  // Real data state
  const [companies, setCompanies] = useState<Company[]>([])
  const [reports, setReports] = useState<JobReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [companySearch, setCompanySearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string>("all")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [comps, reps] = await Promise.all([
        companyService.getCompanies(),
        moderationService.getReports(),
      ])
      setCompanies(comps)
      setReports(reps)
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
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
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
          {(["overview", "companies", "reports", "jobs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab === "companies" ? `Companies (${companies.length})` : tab === "reports" ? `Moderation Reports (${reports.length})` : tab}
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
                  value: applications.length.toString(),
                  change: "Easy Apply tracker",
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
      </div>
    </div>
  )
}
