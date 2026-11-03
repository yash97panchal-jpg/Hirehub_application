import { motion } from "framer-motion"
import { Bell, Plus, Settings } from "lucide-react"
import Button from "../../components/ui/Button"

const alerts = [
  {
    id: 1,
    keyword: "Frontend Developer",
    location: "Remote",
    frequency: "Daily",
    active: true,
  },
  {
    id: 2,
    keyword: "React Engineer",
    location: "San Francisco, CA",
    frequency: "Weekly",
    active: true,
  },
  {
    id: 3,
    keyword: "UI/UX Designer",
    location: "New York, NY",
    frequency: "Instant",
    active: false,
  },
]

export default function JobAlerts() {
  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
              <Bell className="text-[var(--primary)]" />
              Job Alerts
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your active alerts to get notified about new opportunities.
            </p>
          </div>
          <Button variant="primary">
            <Plus size={16} className="mr-2" />
            Create Alert
          </Button>
        </div>

        <div className="grid gap-4">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  {alert.keyword}
                </h3>
                <div className="text-[var(--muted-foreground)] flex items-center gap-4 mt-2">
                  <span>{alert.location}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
                  <span>{alert.frequency}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 border-t border-[var(--border)] sm:border-0 pt-4 sm:pt-0">
                <div className="flex items-center gap-2 mr-4">
                  <div
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                      alert.active ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        alert.active ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {alert.active ? "On" : "Off"}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings size={18} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
