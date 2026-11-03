import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import { mockNotifications } from "../data/mockData"
import { isLocalhost } from "../utils/env"

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(() =>
    isLocalhost() ? mockNotifications : []
  )
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate real-time connection
    const timer = setTimeout(() => setIsConnected(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const markRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "application":
        return <Briefcase className="text-[var(--primary)]" size={20} />
      case "message":
        return <Mail className="text-green-500" size={20} />
      case "alert":
        return <AlertCircle className="text-red-500" size={20} />
      default:
        return <Bell className="text-[var(--primary)]" size={20} />
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
                  Live connection
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />{" "}
                  Connecting...
                </>
              )}
            </span>
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCircle size={14} className="mr-2" /> Mark all as read
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-[var(--primary)]" size={24} />
            <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
              Notifications
            </h1>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <Badge variant="primary" className="ml-auto">
                {notifications.filter((n) => !n.isRead).length} New
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-[var(--background)] rounded-2xl border border-[var(--border)] p-6">
                <Bell size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-30" />
                <h4 className="font-bold text-sm text-[var(--foreground)]">No notifications</h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  You are all caught up! Updates regarding applications and messages will show up here.
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => markRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                      notif.isRead
                        ? "border-[var(--border)] bg-[var(--background)] opacity-70"
                        : "border-[var(--primary)] bg-[var(--primary)]/5 dark:bg-[var(--accent)]/30"
                    }`}
                  >
                    <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      <h3
                        className={`text-sm ${
                          notif.isRead ? "font-medium" : "font-bold"
                        } text-[var(--foreground)]`}
                      >
                        {notif.title}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        {notif.message}
                      </p>
                      <span className="text-xs text-[var(--muted-foreground)] mt-2 block">
                        {notif.createdAt}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
