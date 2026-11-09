import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: "job_seeker" | "recruiter" | "admin"
  content: string
  timestamp: string
  isRead: boolean
  interviewInvite?: {
    jobTitle: string
    date: string
    time: string
    meetLink: string
  }
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantRole: string
  participantAvatar?: string
  participantCompany?: string
  jobTitle?: string
  lastMessage: string
  lastTimestamp: string
  unreadCount: number
}

interface MessageState {
  conversations: Conversation[]
  messages: Record<string, ChatMessage[]> // conversationId -> messages
  sendMessage: (conversationId: string, message: Omit<ChatMessage, "id" | "timestamp" | "isRead" | "conversationId">) => void
  markAsRead: (conversationId: string) => void
  scheduleInterview: (conversationId: string, interview: { jobTitle: string; date: string; time: string; meetLink: string }) => void
}

const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    participantId: "rec-1",
    participantName: "Sarah Jenkins",
    participantRole: "Principal Technical Recruiter",
    participantCompany: "Google Cloud",
    jobTitle: "Senior Distributed Systems Engineer",
    lastMessage: "Hi Alex! Your background in Kubernetes and Golang distributed systems is an exceptional match. When are you free for a technical screen?",
    lastTimestamp: "10:45 AM",
    unreadCount: 1,
  },
  {
    id: "conv-2",
    participantId: "rec-2",
    participantName: "Marcus Vance",
    participantRole: "Staff Talent Partner",
    participantCompany: "Stripe",
    jobTitle: "Staff Software Engineer - Payments Infrastructure",
    lastMessage: "We thoroughly reviewed your engineering portfolio and would love to move ahead to the technical architecture discussion.",
    lastTimestamp: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participantId: "rec-3",
    participantName: "Priya Sharma",
    participantRole: "Lead Technical Recruiter",
    participantCompany: "Razorpay",
    jobTitle: "Staff Backend Engineer - High-Throughput Checkout",
    lastMessage: "Thank you for sharing your experience. We are eager to discuss the engineering charter with our VP of Infrastructure.",
    lastTimestamp: "2 days ago",
    unreadCount: 0,
  },
]

const initialMessages: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "m-1",
      conversationId: "conv-1",
      senderId: "rec-1",
      senderName: "Sarah Jenkins",
      senderRole: "recruiter",
      content: "Hello! We noticed your ATS resume match was 94% for our Google Cloud Infrastructure role.",
      timestamp: "10:30 AM",
      isRead: true,
    },
    {
      id: "m-2",
      conversationId: "conv-1",
      senderId: "rec-1",
      senderName: "Sarah Jenkins",
      senderRole: "recruiter",
      content: "Hi Alex! Your background in Kubernetes and Golang distributed systems is an exceptional match. When are you free for a technical screen?",
      timestamp: "10:45 AM",
      isRead: false,
    },
  ],
  "conv-2": [
    {
      id: "m-3",
      conversationId: "conv-2",
      senderId: "rec-2",
      senderName: "Marcus Vance",
      senderRole: "recruiter",
      content: "We thoroughly reviewed your engineering portfolio and would love to move ahead to the technical architecture discussion.",
      timestamp: "Yesterday, 4:15 PM",
      isRead: true,
    },
  ],
  "conv-3": [
    {
      id: "m-4",
      conversationId: "conv-3",
      senderId: "rec-3",
      senderName: "Priya Sharma",
      senderRole: "recruiter",
      content: "Thank you for sharing your experience. We are eager to discuss the engineering charter with our VP of Infrastructure.",
      timestamp: "2 days ago",
      isRead: true,
    },
  ],
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: initialConversations,
      messages: initialMessages,

      sendMessage: (conversationId, msgData) => {
        const newMsg: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          conversationId,
          ...msgData,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isRead: true,
        }

        const currentMessages = get().messages[conversationId] || []
        const updatedConversations = get().conversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: msgData.content,
              lastTimestamp: "Just now",
            }
          }
          return conv
        })

        set({
          messages: {
            ...get().messages,
            [conversationId]: [...currentMessages, newMsg],
          },
          conversations: updatedConversations,
        })
      },

      markAsRead: (conversationId) => {
        const updatedConversations = get().conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
        const currentMessages = (get().messages[conversationId] || []).map((m) => ({
          ...m,
          isRead: true,
        }))

        set({
          conversations: updatedConversations,
          messages: {
            ...get().messages,
            [conversationId]: currentMessages,
          },
        })
      },

      scheduleInterview: (conversationId, interview) => {
        const inviteMsg: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          conversationId,
          senderId: "system",
          senderName: "HireHub Interview Scheduler",
          senderRole: "recruiter",
          content: `Interview Scheduled for ${interview.jobTitle} on ${interview.date} at ${interview.time}. Meeting link: ${interview.meetLink}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isRead: false,
          interviewInvite: interview,
        }

        const currentMessages = get().messages[conversationId] || []
        set({
          messages: {
            ...get().messages,
            [conversationId]: [...currentMessages, inviteMsg],
          },
        })
      },
    }),
    {
      name: "hirehub-messages-v2",
    }
  )
)
