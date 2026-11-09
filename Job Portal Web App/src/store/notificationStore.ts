import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Notification } from "../types"
import { mockNotifications } from "../data/mockData"

interface NotificationState {
  notifications: Notification[]
  unreadCount: () => number
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead"> &
      Partial<Pick<Notification, "id" | "createdAt" | "isRead">>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,

      unreadCount: () => get().notifications.filter((n) => !n.isRead).length,

      addNotification: (notification) => {
        const newNotif: Notification = {
          id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: notification.type || "system",
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead ?? false,
          link: notification.link,
          createdAt: notification.createdAt || new Date().toISOString(),
        }

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }))
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }))
      },

      deleteNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearAll: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: "hirehub-notifications-v3",
    }
  )
)
