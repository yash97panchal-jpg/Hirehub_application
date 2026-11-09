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
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import CustomSelect from "../components/ui/CustomSelect"
import { useMessageStore, type ChatMessage } from "../store/messageStore"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"

export default function Messages() {
  const { user } = useAuthStore()
  const { conversations, messages, sendMessage, markAsRead, scheduleInterview } = useMessageStore()
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || "")
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

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0]
  const currentMessages = messages[activeConvId] || []

  useEffect(() => {
    if (activeConvId) {
      markAsRead(activeConvId)
    }
  }, [activeConvId, markAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMessages])

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return

    sendMessage(activeConvId, {
      senderId: user?.id || "user-current",
      senderName: user?.name || "Candidate",
      senderRole: (user?.role as any) || "job_seeker",
      content: inputText.trim(),
    })
    setInputText("")

    // Automated recruiter reply simulation after 1.5 seconds if talking to recruiter
    setTimeout(() => {
      if (activeConversation) {
        sendMessage(activeConvId, {
          senderId: activeConversation.participantId,
          senderName: activeConversation.participantName,
          senderRole: "recruiter",
          content: "Thanks for your response! I have updated our team and will share the next steps shortly.",
        })
      }
    }, 1500)
  }

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    const meetId = Math.random().toString(36).substring(2, 8)
    const meetLink = `https://meet.google.com/hhr-${meetId}`

    scheduleInterview(activeConvId, {
      jobTitle: activeConversation?.jobTitle || "Technical Interview",
      date: scheduleData.date,
      time: scheduleData.time,
      meetLink,
    })

    setIsScheduleModalOpen(false)
    toast.success("Interview scheduled & meeting link delivered in chat!")
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
            <h2 className="text-xl font-bold font-poppins text-[var(--foreground)] mb-3">Messages</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search recruiters or chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {filteredConversations.map((conv) => {
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
            })}
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
                    <Badge variant="success" size="sm">Online</Badge>
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
                  <Video size={14} /> Join Video Call
                </Button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="text-center my-2">
                <span className="text-[11px] px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                  Connected on HireHub Secure Candidate Channel
                </span>
              </div>

              {currentMessages.map((msg) => {
                const isMe = msg.senderId === (user?.id || "user-current") || msg.senderRole === "job_seeker"
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
                              <Download size={12} /> Add to Google / Apple Calendar (.ics)
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
                        {isMe && <CheckCheck size={13} className="text-white" />}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
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
            <div>
              <Search size={40} className="mx-auto text-[var(--muted-foreground)] mb-2 opacity-40" />
              <h3 className="font-bold text-base text-[var(--foreground)]">Select a conversation</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Choose a recruiter from the list on the left to start messaging.
              </p>
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
                  Video Platform
                </label>
                <CustomSelect
                  value={scheduleData.platform}
                  onChange={(val) => setScheduleData({ ...scheduleData, platform: String(val) })}
                  options={[
                    { value: "Google Meet", label: "Google Meet (Auto-generated link)" },
                    { value: "Zoom", label: "Zoom Video Meeting" },
                    { value: "HireHub In-App Room", label: "HireHub In-App Meeting Room" },
                  ]}
                  size="sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Confirm & Send Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Live Video Call Room Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] rounded-3xl border border-white/10 shadow-2xl w-full max-w-4xl h-[640px] flex flex-col overflow-hidden text-white animate-in zoom-in-95">
            <div className="p-4 bg-black/40 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h4 className="font-bold text-sm">
                  Live Interview Room • {activeConversation?.participantName}
                </h4>
              </div>
              <Badge variant="success" size="sm">HD Encrypted Call</Badge>
            </div>

            {/* Video Streams Canvas */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-[#0B0F17]">
              {/* Remote Recruiter Stream */}
              <div className="bg-neutral-800/80 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                <div className="w-24 h-24 rounded-full bg-[var(--primary)] text-white text-3xl font-bold flex items-center justify-center shadow-lg">
                  {activeConversation?.participantName.charAt(0)}
                </div>
                <p className="mt-4 font-semibold text-sm">{activeConversation?.participantName}</p>
                <p className="text-xs text-neutral-400">Recruiter Stream (Waiting for connection)</p>
                <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-[11px]">
                  {activeConversation?.participantCompany ? `${activeConversation.participantCompany} Recruiter` : "Lead Technical Interviewer"}
                </div>
              </div>

              {/* Local User Stream */}
              <div className="bg-neutral-900 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {isVideoMuted ? (
                  <div className="flex flex-col items-center">
                    <VideoOff size={40} className="text-red-400 mb-2" />
                    <p className="text-xs text-neutral-400">Your camera is turned off</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-600/30 border border-emerald-500 text-emerald-300 text-2xl font-bold flex items-center justify-center mb-3">
                      {user?.name?.charAt(0) || "You"}
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">Camera Active (Candidate Feed)</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-[11px]">
                  You ({user?.name || "Applicant"})
                </div>
              </div>
            </div>

            {/* Call Controls Bar */}
            <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3.5 rounded-full transition-colors ${
                  isMicMuted ? "bg-red-500/20 text-red-400 border border-red-500" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3.5 rounded-full transition-colors ${
                  isVideoMuted ? "bg-red-500/20 text-red-400 border border-red-500" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title={isVideoMuted ? "Start Video" : "Stop Video"}
              >
                {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
              </button>

              <button
                onClick={() => {
                  setIsVideoModalOpen(false)
                  toast("Interview video session ended.")
                }}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-lg"
              >
                <PhoneOff size={16} /> End Interview Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
