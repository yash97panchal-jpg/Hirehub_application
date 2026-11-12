import { create } from "zustand"
import { persist } from "zustand/middleware"
import { messageService } from "../lib/supabase"
import type { ChatMessage, Conversation } from "../types"

export type { ChatMessage, Conversation }

interface MessageState {
  conversations: Conversation[]
  messages: Record<string, ChatMessage[]> // conversationId -> messages
  isLoading: boolean
  error: string | null
  activeConversationId: string | null

  setActiveConversationId: (id: string | null) => void
  fetchConversations: (userId: string) => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  sendMessage: (
    conversationId: string,
    message: Omit<ChatMessage, "id" | "timestamp" | "isRead" | "conversationId" | "status">,
    receiverId?: string
  ) => Promise<void>
  markAsRead: (conversationId: string, currentUserId?: string) => Promise<void>
  scheduleInterview: (
    conversationId: string,
    interview: { jobTitle: string; date: string; time: string; meetLink: string },
    senderId?: string
  ) => Promise<void>
  addConversation: (conversation: Conversation) => void
  handleRealtimeIncoming: (message: ChatMessage, currentUserId?: string) => void
  handleRealtimeUpdate: (message: ChatMessage) => void
  reset: () => void
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      isLoading: false,
      error: null,
      activeConversationId: null,

      setActiveConversationId: (id) => set({ activeConversationId: id }),

      fetchConversations: async (userId: string) => {
        if (!userId) return
        set({ isLoading: true, error: null })
        try {
          const convs = await messageService.getConversations(userId)
          set({ conversations: convs, isLoading: false })
        } catch (err: any) {
          set({ error: err.message || "Failed to load conversations", isLoading: false })
        }
      },

      fetchMessages: async (conversationId: string) => {
        if (!conversationId) return
        try {
          const msgs = await messageService.getMessages(conversationId)
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: msgs,
            },
            error: null,
          }))
        } catch (err: any) {
          console.warn("Could not fetch messages for conversation:", err)
          set({ error: err?.message || "Failed to load messages from server." })
        }
      },

      sendMessage: async (conversationId, msgData, receiverId) => {
        const tempId = "temp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6)
        const optimisticMsg: ChatMessage = {
          id: tempId,
          conversationId,
          ...msgData,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isRead: false,
          status: "sending",
        }

        const currentList = get().messages[conversationId] || []

        // Optimistic UI update with sending status
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...currentList, optimisticMsg],
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: msgData.content, lastTimestamp: "Just now" }
              : c
          ),
          error: null,
        }))

        try {
          const persistedMsg = await messageService.sendMessage({
            conversationId,
            senderId: msgData.senderId,
            senderName: msgData.senderName,
            senderRole: msgData.senderRole,
            content: msgData.content,
            receiverId,
            interviewInvite: msgData.interviewInvite,
          })

          // Replace optimistic message with actual persisted record from Supabase (status: sent)
          set((state) => {
            const list = state.messages[conversationId] || []
            const replaced = list.map((m) =>
              m.id === tempId ? { ...persistedMsg, status: "sent" as const } : m
            )
            return {
              messages: {
                ...state.messages,
                [conversationId]: replaced,
              },
            }
          })
        } catch (err: any) {
          console.error("Failed to persist message:", err)
          // Mark message as failed in UI state instead of false success
          set((state) => {
            const list = state.messages[conversationId] || []
            const failedList = list.map((m) =>
              m.id === tempId ? { ...m, status: "failed" as const } : m
            )
            return {
              messages: {
                ...state.messages,
                [conversationId]: failedList,
              },
              error: err?.message || "Failed to send message.",
            }
          })
          throw err
        }
      },

      markAsRead: async (conversationId, currentUserId) => {
        const prevState = get()
        const prevMessages = prevState.messages[conversationId] || []
        const prevConversations = prevState.conversations

        // Optimistic mark
        set((state) => {
          const currentMessages = (state.messages[conversationId] || []).map((m) =>
            m.senderId !== currentUserId ? { ...m, isRead: true } : m
          )
          const updatedConversations = state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          )
          return {
            conversations: updatedConversations,
            messages: {
              ...state.messages,
              [conversationId]: currentMessages,
            },
          }
        })

        if (currentUserId) {
          try {
            await messageService.markAsRead(conversationId, currentUserId)
          } catch (err: any) {
            console.warn("Could not mark messages as read on server:", err)
            // BUG-015: Rollback optimistic state on server failure
            set((state) => ({
              conversations: prevConversations,
              messages: {
                ...state.messages,
                [conversationId]: prevMessages,
              },
              error: err?.message || "Failed to mark messages as read.",
            }))
            throw err
          }
        }
      },

      scheduleInterview: async (conversationId, interview, senderId) => {
        const inviteContent = `Interview Scheduled: ${interview.jobTitle} on ${interview.date} at ${interview.time}. Meeting link: ${interview.meetLink}`
        await get().sendMessage(
          conversationId,
          {
            senderId: senderId || "scheduler",
            senderName: "HireHub Interview Scheduler",
            senderRole: "recruiter",
            content: inviteContent,
            interviewInvite: interview,
          }
        )
      },

      addConversation: (conversation) => {
        set((state) => {
          const exists = state.conversations.some((c) => c.id === conversation.id)
          if (exists) return state
          return {
            conversations: [conversation, ...state.conversations],
          }
        })
      },

      handleRealtimeIncoming: (message, currentUserId) => {
        set((state) => {
          const list = state.messages[message.conversationId] || []
          // Deduplication: prevent adding if identical ID or temporary message already present
          if (list.some((m) => m.id === message.id)) {
            return state
          }

          const isOtherSender = message.senderId !== currentUserId
          const isActiveConv = state.activeConversationId === message.conversationId

          const updatedConversations = state.conversations.map((c) => {
            if (c.id === message.conversationId) {
              return {
                ...c,
                lastMessage: message.content,
                lastTimestamp: message.timestamp || "Just now",
                unreadCount: isOtherSender && !isActiveConv ? c.unreadCount + 1 : c.unreadCount,
              }
            }
            return c
          })

          return {
            messages: {
              ...state.messages,
              [message.conversationId]: [...list, { ...message, status: "sent" as const }],
            },
            conversations: updatedConversations,
          }
        })
      },

      handleRealtimeUpdate: (message) => {
        set((state) => {
          const list = state.messages[message.conversationId] || []
          const updated = list.map((m) => (m.id === message.id ? { ...m, ...message } : m))
          return {
            messages: {
              ...state.messages,
              [message.conversationId]: updated,
            },
          }
        })
      },

      reset: () => {
        set({
          conversations: [],
          messages: {},
          isLoading: false,
          error: null,
          activeConversationId: null,
        })
        try {
          localStorage.removeItem("hirehub-messages-v3")
        } catch {}
      },
    }),
    {
      name: "hirehub-messages-v3",
    }
  )
)
