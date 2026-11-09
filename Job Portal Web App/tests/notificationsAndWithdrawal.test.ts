import { describe, it, expect, beforeEach } from "vitest"

if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size },
  } as any
}

import { useNotificationStore } from "../src/store/notificationStore"
import { useApplicationStore } from "../src/store/applicationStore"
import type { Application } from "../src/types"

describe("Notifications Store & Application Withdrawal State", () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [
        {
          id: "notif-1",
          type: "application",
          title: "Application Reviewed",
          message: "Your application was reviewed.",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "notif-2",
          type: "message",
          title: "New Message",
          message: "Recruiter sent you a note.",
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ],
    })
  })

  it("calculates unreadCount accurately", () => {
    const { unreadCount } = useNotificationStore.getState()
    expect(unreadCount()).toBe(1)
  })

  it("adds a new notification dynamically and marks as unread", () => {
    const { addNotification, unreadCount } = useNotificationStore.getState()
    addNotification({
      type: "application",
      title: "Application Withdrawn",
      message: "You have withdrawn your application for Senior Engineer.",
      link: "/dashboard/applications",
    })

    const state = useNotificationStore.getState()
    expect(state.notifications[0].title).toBe("Application Withdrawn")
    expect(state.notifications[0].isRead).toBe(false)
    expect(unreadCount()).toBe(2)
  })

  it("marks a single notification as read", () => {
    const { markAsRead, unreadCount } = useNotificationStore.getState()
    markAsRead("notif-1")

    const state = useNotificationStore.getState()
    expect(state.notifications.find((n) => n.id === "notif-1")?.isRead).toBe(true)
    expect(unreadCount()).toBe(0)
  })

  it("marks all notifications as read", () => {
    const { markAllAsRead, unreadCount } = useNotificationStore.getState()
    markAllAsRead()

    const state = useNotificationStore.getState()
    expect(state.notifications.every((n) => n.isRead)).toBe(true)
    expect(unreadCount()).toBe(0)
  })

  it("deletes a single notification", () => {
    const { deleteNotification } = useNotificationStore.getState()
    deleteNotification("notif-1")

    const state = useNotificationStore.getState()
    expect(state.notifications.find((n) => n.id === "notif-1")).toBeUndefined()
    expect(state.notifications.length).toBe(1)
  })

  it("updates application status to Withdrawn with timestamp in application store", () => {
    const dummyApp: Application = {
      id: "app-test-withdraw-1",
      jobId: "job-1",
      job: { id: "job-1", title: "Software Engineer", company: { name: "Stripe" } } as any,
      status: "Applied",
      source: "easy",
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    useApplicationStore.getState().addApplication(dummyApp)
    useApplicationStore.getState().withdrawApplication("app-test-withdraw-1")

    const apps = useApplicationStore.getState().applications
    const withdrawnApp = apps.find((a) => a.id === "app-test-withdraw-1")

    expect(withdrawnApp).toBeDefined()
    expect(withdrawnApp?.status).toBe("Withdrawn")
  })

  it("updates an existing withdrawn application when re-applying", () => {
    const dummyApp: Application = {
      id: "app-test-reapply-1",
      jobId: "job-reapply-1",
      job: { id: "job-reapply-1", title: "Product Designer", company: { name: "Airbnb" } } as any,
      status: "Withdrawn",
      source: "easy",
      appliedAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-02T00:00:00Z",
    }

    useApplicationStore.getState().addApplication(dummyApp)

    // Reapply with new cover letter
    useApplicationStore.getState().addApplication({
      ...dummyApp,
      coverLetter: "Reapplying with updated portfolio!",
    })

    const apps = useApplicationStore.getState().applications
    const matched = apps.filter((a) => a.jobId === "job-reapply-1")

    // Must update the existing entry rather than duplicating
    expect(matched.length).toBe(1)
    expect(matched[0].status).toBe("Applied")
    expect(matched[0].coverLetter).toBe("Reapplying with updated portfolio!")
  })
})
