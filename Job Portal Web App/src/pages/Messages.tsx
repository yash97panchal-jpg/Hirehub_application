import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Video,
  Calendar,
  Phone,
  Search,
  Check,
  CheckCheck,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Download,
  Clock,
  Building,
  UserCheck,
  X,
  ExternalLink,
  MessageSquare,
  Briefcase,
} from "lucide-react"
import { Link } from "react-router-dom"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import CustomSelect from "../components/ui/CustomSelect"
import { useMessageStore, type ChatMessage } from "../store/messageStore"
import { useAuthStore } from "../store/authStore"
import { messageService } from "../lib/supabase"
import toast from "react-hot-toast"

export default function Messages() {
  const { user } = useAuthStore()
  const {
    conversations,
    messages,
    isLoading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    scheduleInterview,
    handleRealtimeIncoming,
    handleRealtimeUpdate,
  } = useMessageStore()

  const [activeConvId, setActiveConvId] = useState<string>("")
  const [inputText, setInputText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)

  // Schedule state
  const [scheduleData, setScheduleData] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "14:00",
    platform: "Google Meet",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load real user conversations and subscribe to Realtime updates (BUG-003)
  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id)

      const unsubscribe = messageService.subscribeToMessages(
        user.id,
        (incomingMsg) => {
          handleRealtimeIncoming(incomingMsg, user.id)
        },
        (updatedMsg) => {
          handleRealtimeUpdate(updatedMsg)
        }
      )

      return () => {
        unsubscribe()
      }
    }
  }, [user?.id, fetchConversations, handleRealtimeIncoming, handleRealtimeUpdate])

  // Select first conversation if none selected
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id)
    }
  }, [conversations, activeConvId])

  // Fetch messages for selected conversation & mark as read (BUG-008)
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId)
      if (user?.id) {
        markAsRead(activeConvId, user.id)
      }
    }
  }, [activeConvId, user?.id, fetchMessages, markAsRead])

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0]
  const currentMessages = activeConversation ? messages[activeConversation.id] || [] : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMessages])

  // Handle Real Message Sending (BUG-003)
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || !activeConvId) return

    const content = inputText.trim()
    setInputText("")

    try {
      await sendMessage(
        activeConvId,
        {
          senderId: user?.id || "user-current",
          senderName: user?.name || "Candidate",
          senderRole: (user?.role as any) || "job_seeker",
          content,
        },
        activeConversation?.participantId
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to deliver message.")
    }
  }

  // Handle Real Interview Scheduling (BUG-003)
  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConvId) return

    const meetId = Math.random().toString(36).substring(2, 8)
    const meetLink = `https://meet.google.com/hhr-${meetId}`

    try {
      await scheduleInterview(
        activeConvId,
        {
          jobTitle: activeConversation?.jobTitle || "Technical Screen",
          date: scheduleData.date,
          time: scheduleData.time,
          meetLink,
        },
        user?.id
      )

      setIsScheduleModalOpen(false)
      toast.success("Interview scheduled & invite delivered in chat!")
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule interview.")
    }
  }

  // Export .ics calendar invite
  const handleDownloadICS = (msg: ChatMessage) => {
    if (!msg.interviewInvite) return
    const { jobTitle, date, time, meetLink } = msg.interviewInvite
    const icsDate = date.replace(/-/g, "")
    const [h, m] = time.split(":")
    const icsTime = (h || "14").padStart(2, "0") + (m || "00").padStart(2, "0") + "00"
    const endH = String((Number(h || 14) + 1) % 24).padStart(2, "0")
    const icsEndTime = endH + (m || "00").padStart(2, "0") + "00"

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HireHub//Interview Scheduler//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:HireHub Interview: ${jobTitle}
DESCRIPTION:Technical interview for ${jobTitle}. Meeting Link: ${meetLink}
STATUS:CONFIRMED
DTSTART:${icsDate}T${icsTime}
DTEND:${icsDate}T${icsEndTime}
LOCATION:${meetLink}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute("download", `HireHub_Interview_${date}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Calendar invite (.ics) downloaded!")
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.participantCompany && c.participantCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xl flex flex-col md:flex-row">
        
        {/* Left: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[var(--border)] flex flex-col h-full bg-[var(--card)]">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight mb-2.5">Direct Messages</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search recruiters or chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {isLoading && conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                <div className="animate-spin w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected
                        ? "bg-[var(--primary)]/10 dark:bg-[var(--accent)]/30 border-l-4 border-[var(--primary)]"
                        : "hover:bg-[var(--muted)]/50"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {conv.participantName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-[var(--foreground)] truncate">
                          {conv.participantName}
                        </h4>
                        <span className="text-[11px] text-[var(--muted-foreground)] shrink-0">
                          {conv.lastTimestamp}
                        </span>
                      </div>
                      {conv.participantCompany && (
                        <p className="text-xs text-[var(--primary)] font-medium truncate mt-0.5">
                          {conv.participantCompany}
                        </p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)] truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground)] space-y-2">
                <MessageSquare size={32} className="mx-auto opacity-40 mb-1" />
                <p className="font-semibold text-sm text-[var(--foreground)]">No conversations</p>
                <p>When you message employers or recruiters reach out, chats appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col h-full bg-[var(--background)]">
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">
                  {activeConversation.participantName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                    {activeConversation.participantName}
                    <Badge variant="success" size="sm">Active</Badge>
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {activeConversation.participantRole} • {activeConversation.participantCompany}
                  </p>
                </div>
              </div>

              {/* Actions: Video Call & Interview Scheduler */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="text-xs gap-1.5 hidden sm:flex"
                >
                  <Calendar size={14} /> Schedule Interview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="text-xs gap-1.5"
                >
                  <Video size={14} /> Video Call
                </Button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="text-center my-2">
                <span className="text-[11px] px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                  HireHub Encrypted Direct Communications Channel
                </span>
              </div>

              {currentMessages.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--muted-foreground)]">
                  <p className="font-semibold text-sm text-[var(--foreground)] mb-1">Start of Conversation</p>
                  <p>Send a message below to start interacting with {activeConversation.participantName}.</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isMe = msg.senderId === user?.id || (user?.id ? msg.senderId === user.id : msg.senderRole === "job_seeker")
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl p-4 shadow-sm ${
                          isMe
                            ? "bg-[var(--primary)] text-white rounded-br-none"
                            : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-none"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {msg.senderName}
                        </p>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                        {/* If Message is an Interview Invite */}
                        {msg.interviewInvite && (
                          <div className="mt-3 p-3 rounded-xl bg-white/10 dark:bg-black/20 border border-white/20 text-xs space-y-2">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Clock size={14} />
                              <span>{msg.interviewInvite.date} at {msg.interviewInvite.time}</span>
                            </div>
                            <a
                              href={msg.interviewInvite.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:underline"
                            >
                              <Video size={13} /> {msg.interviewInvite.meetLink}
                            </a>
                            <div>
                              <button
                                onClick={() => handleDownloadICS(msg)}
                                className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-xs transition-colors"
                              >
                                <Download size={12} /> Add to Calendar (.ics)
                              </button>
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                            isMe ? "text-white/70" : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isMe && (
                            msg.status === "failed" ? (
                              <span className="text-red-300 text-[10px] font-semibold ml-1">Failed to send</span>
                            ) : msg.status === "sending" ? (
                              <span className="text-white/60 text-[10px] ml-1 italic">Sending...</span>
                            ) : (
                              <CheckCheck size={13} className={msg.isRead ? "text-emerald-300" : "text-white/60"} />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions & Input Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--card)]">
              {/* Quick Canned Responses */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                {[
                  "I'm available for a 20-min call this week.",
                  "Here is my updated portfolio link.",
                  "What is the tech stack for this role?",
                  "Thank you, looking forward to discussing!",
                ].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setInputText(quick)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-colors text-[var(--muted-foreground)]"
                  >
                    {quick}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message or response..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <Button type="submit" variant="primary" size="md" className="rounded-2xl px-4">
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center bg-[var(--background)]">
            <div className="max-w-sm space-y-3">
              <MessageSquare size={48} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
              <h3 className="font-bold text-base text-[var(--foreground)]">No active conversation</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Connect with recruiters or view interview invitations once you apply to jobs.
              </p>
              <Link to="/jobs">
                <Button variant="outline" size="sm" className="mt-2 text-xs">
                  <Briefcase size={14} className="mr-1.5" /> Explore Open Roles
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                <Calendar size={18} className="text-[var(--primary)]" /> Schedule Candidate Interview
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-1 rounded hover:bg-[var(--muted)]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-[var(--foreground)] block mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--foreground)] block mb-1">
                  Interview Time
                </label>
                <input
                  type="time"
                  required
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                  className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--foreground)] block mb-1">
                  Meeting Platform
                </label>
                <CustomSelect
                  value={scheduleData.platform}
                  onChange={(val) => setScheduleData({ ...scheduleData, platform: val })}
                  options={[
                    { label: "Google Meet", value: "Google Meet" },
                    { label: "Zoom", value: "Zoom" },
                    { label: "Microsoft Teams", value: "Microsoft Teams" },
                  ]}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm & Send Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Call Modal Simulation */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col h-[460px]">
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-emerald-400" />
                <span className="font-semibold text-sm">HireHub Secure Interview Video Room</span>
              </div>
              <button onClick={() => setIsVideoModalOpen(false)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-6">
              {isVideoMuted ? (
                <div className="text-center text-slate-500">
                  <VideoOff size={48} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Camera is turned off</p>
                </div>
              ) : (
                <div className="relative w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                  <div className="text-center text-slate-400">
                    <div className="w-20 h-20 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-lg">
                      {activeConversation ? activeConversation.participantName.charAt(0) : "U"}
                    </div>
                    <p className="font-semibold text-sm text-slate-200">
                      {activeConversation ? activeConversation.participantName : "Participant"}
                    </p>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Encrypted Audio/Video Stream Active
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3 rounded-full transition-colors ${
                  isMicMuted ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoMuted ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {isVideoMuted ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg"
              >
                <PhoneOff size={15} /> Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
