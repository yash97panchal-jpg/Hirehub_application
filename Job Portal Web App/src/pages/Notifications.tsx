import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Mail,
  AlertCircle,
  CheckCircle,
  Trash2,
  ArrowUpRight,
  X,
  Sparkles,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import { useNotificationStore } from "../store/notificationStore"
import type { Notification } from "../types"

function formatNotificationTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffSec < 60) return "Just now"
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}h ago`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  } catch {
    return "Recently"
  }
}

export default function Notifications() {
  const navigate = useNavigate()
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount,
  } = useNotificationStore()

  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "application" | "message"
  >("all")

  const totalUnread = unreadCount()

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "unread") return !n.isRead
      if (activeFilter === "application")
        return n.type === "application" || n.type === "interview"
      if (activeFilter === "message") return n.type === "message"
      return true
    })
  }, [notifications, activeFilter])

  const getIcon = (type: string) => {
    switch (type) {
      case "application":
      case "interview":
        return <Briefcase className="text-[var(--primary)]" size={18} />
      case "message":
        return <Mail className="text-emerald-500" size={18} />
      case "job_match":
        return <Sparkles className="text-amber-500" size={18} />
      case "alert":
        return <AlertCircle className="text-red-500" size={18} />
      default:
        return <Bell className="text-[var(--primary)]" size={18} />
    }
  }

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 sm:pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-3 sm:px-6">
        {/* Top Navigation Bar: Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Updates</span>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            {totalUnread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs py-1.5 px-3"
              >
                <CheckCircle size={13} className="mr-1.5 text-emerald-500" />
                <span>Mark all as read</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Clear all notifications from your feed?")) {
                    clearAll()
                  }
                }}
                className="p-2 text-xs text-[var(--muted-foreground)] hover:text-red-500 rounded-xl hover:bg-red-500/10 border border-[var(--border)] transition-colors"
                title="Clear all notifications"
                aria-label="Clear all notifications"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-5"
        >
          {/* Header Title & Badges */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <h1 className="font-poppins text-lg sm:text-2xl font-bold text-[var(--foreground)] leading-tight">
                  Notifications
                </h1>
                <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-0.5">
                  Stay updated on your job applications, interviews, and team messages
                </p>
              </div>
            </div>

            {totalUnread > 0 && (
              <Badge variant="primary" className="text-xs shrink-0">
                {totalUnread} New
              </Badge>
            )}
          </div>

          {/* Filter Pills: Horizontally Scrollable on Mobile View */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { id: "all", label: "All", count: notifications.length },
              { id: "unread", label: "Unread", count: totalUnread },
              {
                id: "application",
                label: "Applications",
                count: notifications.filter(
                  (n) => n.type === "application" || n.type === "interview"
                ).length,
              },
              {
                id: "message",
                label: "Messages",
                count: notifications.filter((n) => n.type === "message").length,
              },
            ].map((f) => {
              const isActive = activeFilter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 text-xs ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                  }`}
                >
                  <span>{f.label}</span>
                  {f.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[var(--muted)] text-[var(--foreground)]"
                      }`}
                    >
                      {f.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Notification List */}
          <div className="space-y-2.5 sm:space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-[var(--background)] rounded-2xl border border-[var(--border)] p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center mx-auto text-[var(--muted-foreground)]">
                  <Bell size={24} className="opacity-50" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--foreground)]">
                    {activeFilter === "unread"
                      ? "No Unread Notifications"
                      : "No Notifications Yet"}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1">
                    {activeFilter === "unread"
                      ? "You are completely caught up! New alerts and interview invites will appear here."
                      : "Updates regarding your applications, matches, and messages will arrive here."}
                  </p>
                </div>
                {activeFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveFilter("all")}
                    className="mt-2 text-xs"
                  >
                    View All Notifications
                  </Button>
                )}
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredNotifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative group ${
                      notif.isRead
                        ? "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40 hover:bg-[var(--card)]"
                        : "border-[var(--primary)]/60 bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10 shadow-xs"
                    }`}
                  >
                    {/* Icon Pill */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.isRead
                          ? "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)]"
                          : "bg-[var(--card)] border border-[var(--primary)]/30 shadow-xs"
                      }`}
                    >
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-xs sm:text-sm text-[var(--foreground)] leading-snug ${
                            notif.isRead ? "font-medium" : "font-bold"
                          }`}
                        >
                          {notif.title}
                        </h3>

                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed break-words">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--muted-foreground)]">
                        <span>{formatNotificationTime(notif.createdAt)}</span>

                        {notif.link && (
                          <>
                            <span>•</span>
                            <span className="text-[var(--primary)] font-semibold flex items-center gap-0.5 hover:underline">
                              <span>View details</span>
                              <ArrowUpRight size={12} />
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete / Dismiss Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif.id)
                      }}
                      className="absolute top-3 right-3 p-1 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100"
                      title="Dismiss notification"
                      aria-label="Dismiss notification"
                    >
                      <X size={14} />
                    </button>
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
