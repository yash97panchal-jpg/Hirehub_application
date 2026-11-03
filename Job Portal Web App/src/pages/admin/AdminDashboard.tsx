import { useState } from "react"
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
  ChevronRight,
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
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { mockStats } from "../../data/mockData"
import { useJobStore } from "../../store/jobStore"
import { useApplicationStore } from "../../store/applicationStore"

const growthData = [
  { month: "Apr", users: 62000, jobs: 8200 },
  { month: "May", users: 68000, jobs: 9100 },
  { month: "Jun", users: 72000, jobs: 10400 },
  { month: "Jul", users: 76000, jobs: 11200 },
  { month: "Aug", users: 80000, jobs: 11800 },
  { month: "Sep", users: 85000, jobs: 12400 },
]

const categoryData = mockStats?.jobsByCategory ? mockStats.jobsByCategory.slice(0, 5) : []
const COLORS = [
  "var(--primary)",
  "var(--accent)",
  "#22C55E",
  "#F59E0B",
  "#8B5CF6",
]

const pendingRecruiters = [
  {
    name: "Innovation Labs",
    email: "hr@innovationlabs.com",
    company: "Innovation Labs Inc",
    submittedAt: "2026-09-30",
  },
  {
    name: "DataStream Corp",
    email: "recruit@datastream.io",
    company: "DataStream Corp",
    submittedAt: "2026-09-29",
  },
  {
    name: "CloudPeak Solutions",
    email: "jobs@cloudpeak.com",
    company: "CloudPeak Solutions",
    submittedAt: "2026-09-28",
  },
]

const recentActivity = [
  {
    action: "New recruiter registered",
    subject: "TechFlow Inc",
    time: "2 min ago",
    type: "recruiter",
  },
  {
    action: "Job posted",
    subject: "Senior React Developer at Meta",
    time: "15 min ago",
    type: "job",
  },
  {
    action: "Report submitted",
    subject: "Job listing flagged",
    time: "1 hr ago",
    type: "report",
  },
  {
    action: "User verified",
    subject: "alex.johnson@gmail.com",
    time: "2 hr ago",
    type: "user",
  },
  {
    action: "Company approved",
    subject: "GreenTech Ventures",
    time: "3 hr ago",
    type: "company",
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] =
    useState<"overview" | "recruiters" | "reports">("overview")

  const { jobs } = useJobStore()
  const { applications } = useApplicationStore()

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Shield size={24} className="text-[var(--primary)]" />
            <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)]">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-[var(--muted-foreground)]">
            Platform overview and management.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--muted)] rounded-xl mb-8 w-fit">
          {(["overview", "recruiters", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: "85,000",
              change: "+3,200 this month",
              icon: Users,
              color: "var(--primary)",
              bg: "bg-[var(--muted)] ",
            },
            {
              label: "Active Jobs",
              value: "12,400",
              change: "+840 this week",
              icon: Briefcase,
              color: "#22C55E",
              bg: "bg-green-100 dark:bg-green-900/30",
            },
            {
              label: "Companies",
              value: "3,200",
              change: "+120 this month",
              icon: Building2,
              color: "#F59E0B",
              bg: "bg-yellow-100 dark:bg-yellow-900/30",
            },
            {
              label: "Applications",
              value: "284k",
              change: "+18k this month",
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
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <p className="font-poppins text-2xl font-bold text-[var(--foreground)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                {stat.label}
              </p>
              <p className="text-xs font-medium mt-2 text-green-500 flex items-center gap-1">
                <TrendingUp size={11} /> {stat.change}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-poppins font-semibold text-[var(--foreground)] mb-5">
              Platform Growth
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={growthData}
                margin={{ left: -16, right: 8, top: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--accent)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: any, name: any) => [
                    Number(v).toLocaleString(),
                    name === "users" ? "Users" : "Jobs",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#userGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#jobGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />{" "}
                Users
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <div className="w-3 h-3 rounded-full bg-[var(--accent)]" /> Jobs
              </div>
            </div>
          </div>

          {/* Category Pie */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-poppins font-semibold text-[var(--foreground)] mb-4">
              Jobs by Category
            </h3>
            <PieChart width={200} height={160} className="mx-auto">
              <Pie
                data={categoryData}
                cx={100}
                cy={80}
                innerRadius={45}
                outerRadius={75}
                dataKey="count"
                paddingAngle={3}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <ul className="space-y-1.5 mt-2">
              {categoryData.map((cat, i) => (
                <li
                  key={cat.category}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-[var(--foreground)]">
                      {cat.category}
                    </span>
                  </div>
                  <span className="font-semibold text-[var(--muted-foreground)]">
                    {cat.count.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Recruiter Approvals */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h3 className="font-poppins font-semibold text-[var(--foreground)] flex items-center gap-2">
                <AlertTriangle size={16} className="text-[var(--warning)]" />
                Pending Approvals
                <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {pendingRecruiters.length}
                </span>
              </h3>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            {pendingRecruiters.map((r, i) => (
              <div
                key={i}
                className={`p-4 flex items-center gap-4 ${
                  i < pendingRecruiters.length - 1
                    ? "border-b border-[var(--border)]"
                    : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center shrink-0">
                  <Building2
                    size={18}
                    className="text-[var(--muted-foreground)]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {r.company}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {r.email}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors">
                    <CheckCircle size={15} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors">
                    <XCircle size={15} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)] transition-colors">
                    <Eye size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h3 className="font-poppins font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Activity size={16} className="text-[var(--primary)]" /> Recent
                Activity
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      act.type === "recruiter"
                        ? "bg-[var(--muted)] "
                        : act.type === "job"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : act.type === "report"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-[var(--muted)]"
                    }`}
                  >
                    {act.type === "recruiter" ? (
                      <Building2 size={14} className="text-[var(--primary)]" />
                    ) : act.type === "job" ? (
                      <Briefcase size={14} className="text-green-500" />
                    ) : act.type === "report" ? (
                      <AlertTriangle size={14} className="text-red-500" />
                    ) : (
                      <Users
                        size={14}
                        className="text-[var(--muted-foreground)]"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--foreground)]">
                      {act.action}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {act.subject}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs and Applications */}
        <div className="mt-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]">
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="font-poppins font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Briefcase size={16} className="text-[var(--primary)]" /> All Job Posts & Applications
            </h3>
          </div>
          <div className="p-0 max-h-[600px] overflow-y-auto">
            {jobs.length === 0 ? (
              <div className="p-6 text-center text-[var(--muted-foreground)]">
                No jobs posted yet.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3">Job & Recruiter</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Posted Date</th>
                    <th className="px-6 py-3">Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {jobs.map((job) => {
                    const jobApplications = applications.filter((app) => app?.job?.id === job.id);
                    return (
                      <tr key={job.id} className="hover:bg-[var(--muted)]/50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[var(--foreground)]">{job.title || "Untitled Position"}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{job.type || "Full-time"} &bull; {job.location || "Remote"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-[var(--foreground)]">{job.company?.name || "Unknown Company"}</p>
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)]">
                          {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="px-6 py-4">
                          {jobApplications.length > 0 ? (
                            <div className="space-y-2">
                              {jobApplications.map((app) => (
                                <div key={app.id} className="flex items-center gap-2 text-xs p-2 bg-[var(--background)] rounded border border-[var(--border)]">
                                  <div className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center shrink-0">
                                    <Users size={12} className="text-[var(--primary)]" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-[var(--foreground)]">{app.applicant?.name || "Candidate"}</p>
                                    <p className="text-[var(--muted-foreground)]">{app.status || "Applied"}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--muted-foreground)]">No applications yet</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
