import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
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
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { mockStats } from "../../data/mockData"
import { useJobStore } from "../../store/jobStore"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { useAuthStore } from "../../store/authStore"

const funnelData = [
  { stage: "Applied", count: 142 },
  { stage: "Viewed", count: 98 },
  { stage: "Shortlisted", count: 43 },
  { stage: "Interview", count: 18 },
  { stage: "Offered", count: 5 },
]

const weeklyData = [
  { day: "Mon", applications: 14 },
  { day: "Tue", applications: 22 },
  { day: "Wed", applications: 18 },
  { day: "Thu", applications: 31 },
  { day: "Fri", applications: 27 },
  { day: "Sat", applications: 8 },
  { day: "Sun", applications: 5 },
]

const recentApplicants = [
  {
    name: "Alex Johnson",
    role: "Senior Frontend Engineer",
    avatar: "AJ",
    score: 87,
    status: "Shortlisted",
  },
  {
    name: "Maria Garcia",
    role: "Senior Frontend Engineer",
    avatar: "MG",
    score: 79,
    status: "Viewed",
  },
  {
    name: "David Kim",
    role: "Product Manager",
    avatar: "DK",
    score: 92,
    status: "Interview",
  },
  {
    name: "Sarah Lee",
    role: "UX/UI Designer",
    avatar: "SL",
    score: 81,
    status: "Applied",
  },
]

const statusVariant: Record<string, any> = {
  Shortlisted: "success",
  Interview: "primary",
  Viewed: "warning",
  Applied: "default",
  Offered: "accent",
  Rejected: "error",
}

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { jobs: storeJobs } = useJobStore()
  const [activeTab, setActiveTab] =
    useState<"overview" | "jobs" | "applicants">("overview")
  const activeJobs = storeJobs.slice(0, 4)

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)]">
              Recruiter Dashboard
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your jobs and applicants.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/recruiter/company-profile")}
            >
              Company Profile
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/recruiter/post-job")}
            >
              <Plus size={16} className="mr-2" /> Post New Job
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--muted)] rounded-xl mb-8 w-fit">
          {(["overview", "jobs", "applicants"] as const).map((tab) => (
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

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Active Jobs",
              value: storeJobs.length,
              icon: Briefcase,
              color: "var(--primary)",
              bg: "bg-[var(--muted)] ",
              change: storeJobs.length > 0 ? `+${storeJobs.length} active` : "0 posted",
            },
            {
              label: "Total Applicants",
              value: storeJobs.length > 0 ? 142 : 0,
              icon: Users,
              color: "#22C55E",
              bg: "bg-green-100 dark:bg-green-900/30",
              change: storeJobs.length > 0 ? "+23 today" : "0 new",
            },
            {
              label: "Shortlisted",
              value: storeJobs.length > 0 ? 43 : 0,
              icon: Star,
              color: "#F59E0B",
              bg: "bg-yellow-100 dark:bg-yellow-900/30",
              change: storeJobs.length > 0 ? "+8 this week" : "0 new",
            },
            {
              label: "Interviews",
              value: 18,
              icon: CheckCircle,
              color: "#8B5CF6",
              bg: "bg-purple-100 dark:bg-purple-900/30",
              change: "3 scheduled",
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
              <p className="font-poppins text-3xl font-bold text-[var(--foreground)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                {stat.label}
              </p>
              <p
                className="text-xs font-medium mt-2"
                style={{ color: stat.color }}
              >
                {stat.change}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Hiring Funnel */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] h-full">
              <h3 className="font-poppins font-semibold text-[var(--foreground)] mb-5">
                Hiring Funnel
              </h3>
              <ResponsiveContainer width="100%" height={220}>
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
                    width={72}
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

          {/* Weekly Applications */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)] h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                  Applications This Week
                </h3>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-500">
                  <TrendingUp size={14} /> +18% vs last week
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={weeklyData}
                  margin={{ left: -16, right: 8, top: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
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
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
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
                    fill="url(#appGrad)"
                    dot={{
                      r: 4,
                      fill: "var(--primary)",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                  Active Jobs
                </h3>
                <Link
                  to="/recruiter/jobs"
                  className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight size={13} />
                </Link>
              </div>
              {activeJobs.length === 0 ? (
                <div className="p-8 text-center text-[var(--muted-foreground)]">
                  <p className="text-sm font-medium">No active jobs posted yet.</p>
                  <Link
                    to="/recruiter/post-job"
                    className="inline-block mt-3 text-xs text-[var(--primary)] font-semibold hover:underline bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg"
                  >
                    + Post your first job
                  </Link>
                </div>
              ) : (
                activeJobs.map((job, i) => (
                  <div
                    key={job.id}
                    className={`p-4 flex items-center gap-4 ${
                      i < activeJobs.length - 1
                        ? "border-b border-[var(--border)]"
                        : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                        {job.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Users size={11} /> {job.applicationCount} applied
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Eye size={11} /> {job.applicationCount * 8} views
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                          <Clock size={11} />{" "}
                          {Math.floor(
                            (Date.now() - new Date(job.postedAt).getTime()) /
                              86400000,
                          )}
                          d ago
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--muted)] transition-colors">
                        <MoreHorizontal
                          size={15}
                          className="text-[var(--muted-foreground)]"
                        />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applicants */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <h3 className="font-poppins font-semibold text-[var(--foreground)]">
                  Recent Applicants
                </h3>
                <Link
                  to="/recruiter/applicants"
                  className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight size={13} />
                </Link>
              </div>
              {recentApplicants.map((a, i) => (
                <div
                  key={i}
                  className={`p-4 flex items-center gap-3 ${
                    i < recentApplicants.length - 1
                      ? "border-b border-[var(--border)]"
                      : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {a.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {a.role}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-[var(--primary)]">
                      {a.score}% ATS
                    </span>
                    <Badge variant={statusVariant[a.status]} size="sm">
                      {a.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
