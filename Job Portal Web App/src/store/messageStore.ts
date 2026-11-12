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
    message: Omit<ChatMessage, "id" | "timestamp" | "isRead" | "conversationId">,
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
          }))
        } catch (err: any) {
          console.warn("Could not fetch messages for conversation:", err)
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
        }

        const currentList = get().messages[conversationId] || []

        // Optimistic UI update
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

          // Replace optimistic message with actual persisted record from Supabase
          set((state) => {
            const list = state.messages[conversationId] || []
            const replaced = list.map((m) => (m.id === tempId ? persistedMsg : m))
            return {
              messages: {
                ...state.messages,
                [conversationId]: replaced,
              },
            }
          })
        } catch (err: any) {
          console.error("Failed to persist message:", err)
          // Mark optimistic message or revert if failed
        }
      },

      markAsRead: async (conversationId, currentUserId) => {
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
          } catch (err) {
            console.warn("Could not mark messages as read on server:", err)
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
              [message.conversationId]: [...list, message],
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
    }),
    {
      name: "hirehub-messages-v3",
    }
  )
)
