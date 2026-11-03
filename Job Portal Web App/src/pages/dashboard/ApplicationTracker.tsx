import { useMemo } from "react"
import { motion } from "framer-motion"
import { Briefcase, ChevronDown, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { mockJobs } from "../../data/mockData"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { useApplicationStore } from "../../store/applicationStore"
import { isLocalhost } from "../../utils/env"

const demoApplications = [
  {
    id: "demo-1",
    job: mockJobs[0],
    status: "Shortlisted",
    date: "Oct 5, 2026",
    nextStep: "Technical Interview",
  },
  {
    id: "demo-2",
    job: mockJobs[1],
    status: "Viewed",
    date: "Sep 28, 2026",
    nextStep: "Waiting for update",
  },
  {
    id: "demo-3",
    job: mockJobs[2],
    status: "Applied",
    date: "Sep 15, 2026",
    nextStep: "Application under review",
  },
]

export default function ApplicationTracker() {
  const { applications: storeApplications } = useApplicationStore()

  // On localhost, if no real application submitted yet, show demo applications for testing
  // On live host, strictly show real applications
  const applications = useMemo(() => {
    if (storeApplications.length > 0) {
      return storeApplications.map((app) => ({
        id: app.id,
        job: app.job,
        status: app.status || "Applied",
        date: app.appliedAt
          ? new Date(app.appliedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently",
        nextStep:
          app.status === "Shortlisted"
            ? "Technical Interview"
            : "Application under review",
      }))
    }
    return isLocalhost() ? demoApplications : []
  }, [storeApplications])

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
            <Briefcase className="text-[var(--primary)]" />
            Application Tracker
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Monitor the status of your {applications.length} active
            applications.
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
          {applications.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase
                size={44}
                className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-40"
              />
              <h3 className="text-base font-bold text-[var(--foreground)]">
                No Applications Yet
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto mb-6">
                You haven't submitted any job applications yet. Discover roles
                matching your skills and apply today.
              </p>
              <Link to="/jobs">
                <Button variant="primary" size="sm">
                  Explore Jobs <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--muted)]/50 border-b border-[var(--border)]">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Role / Company
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Date Applied
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Status
                    </th>
                    <th className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      Next Steps
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {applications.map((app, i) => (
                    <motion.tr
                      key={app.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="hover:bg-[var(--muted)]/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0">
                            {app.job?.company?.logo ? (
                              <img
                                src={app.job.company.logo}
                                alt={app.job.company.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Briefcase
                                size={20}
                                className="text-[var(--muted-foreground)]"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--foreground)]">
                              {app.job?.title || "Job Title"}
                            </div>
                            <div className="text-sm text-[var(--muted-foreground)]">
                              {app.job?.company?.name || "Company"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--foreground)]">
                        {app.date}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            app.status === "Shortlisted"
                              ? "success"
                              : app.status === "Viewed"
                                ? "warning"
                                : "default"
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">
                        {app.nextStep}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <ChevronDown size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
