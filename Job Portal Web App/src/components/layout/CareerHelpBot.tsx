import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  X,
  Send,
  Sparkles,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Briefcase,
  HelpCircle,
  MessageSquare,
  Zap,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Button from "../ui/Button"
import Badge from "../ui/Badge"
import { useJobStore } from "../../store/jobStore"
import { useAuthStore } from "../../store/authStore"
import type { Job } from "../../types"

interface Message {
  id: string
  sender: "bot" | "user"
  text: string
  time: string
  suggestions?: string[]
}

interface MatchResult {
  job: Job
  score: number
  matchedSkills: string[]
  missingSkills: string[]
}

export default function CareerHelpBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "matcher">("chat")
  const { jobs } = useJobStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-welcome",
      sender: "bot",
      text: "Welcome to HireHub Assistant. I can help you find jobs, guide your application process, explain Easy Apply vs External Apply, or analyze your resume for role matches.",
      time: "Just now",
      suggestions: [
        "How do I apply for jobs?",
        "What is Easy Apply vs External Apply?",
        "Find remote software engineering jobs",
        "How do recruiters verify companies?",
      ],
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Resume Matcher States
  const [resumeText, setResumeText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])

  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, activeTab])

  // Handle User Chat Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim()
    if (!text) return

    const userMsg: Message = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText("")
    setIsTyping(true)

    setTimeout(() => {
      const lower = text.toLowerCase()
      let botReply = ""
      let suggestions: string[] = []

      if (lower.includes("how do i apply") || lower.includes("how to apply")) {
        botReply =
          "To apply: navigate to any job listing. If the job supports 'Easy Apply', you can submit your saved resume, cover letter, and screening answers directly inside the app with 1 click. If it's an 'External Apply' role, click 'Apply on Company Site' to be safely redirected to the employer's official recruitment portal."
        suggestions = ["Show me Easy Apply jobs", "Switch to Resume Matcher"]
      } else if (lower.includes("easy apply") || lower.includes("external apply")) {
        botReply =
          "HireHub gives companies the choice between two apply methods:\n• Easy Apply: Direct in-app application submission with live status tracking in your Application Tracker.\n• External Apply: Direct link to the employer's Greenhouse/Lever/Workable board. When you return, HireHub will ask if you completed it and log it for you!"
        suggestions = ["Find remote software engineering jobs", "How do I track status?"]
      } else if (lower.includes("remote") || lower.includes("engineer")) {
        const remoteJobs = jobs.filter((j) => j.isRemote || j.remoteType === "Remote").slice(0, 3)
        botReply = `We found ${remoteJobs.length} top remote roles! Some highlights include: ${remoteJobs.map((j) => j.title + " at " + j.company.name).join(", ")}. You can explore all of them on our Jobs page.`
        suggestions = ["Take me to Jobs page", "Check match with my resume"]
      } else if (lower.includes("verify") || lower.includes("recruiter")) {
        botReply =
          "Recruiter trust & verification is strictly monitored! When a recruiter creates a company, it enters 'Pending' status. The HireHub System Administrator reviews company details, website legitimacy, and business records before granting approval and the verified checkmark badge."
        suggestions = ["Contact administrator", "How do I post a job?"]
      } else if (lower.includes("track") || lower.includes("status")) {
        botReply =
          "You can monitor all your submitted applications in real time under 'Application Tracker'. We provide live stages: Applied ➜ Viewed ➜ Shortlisted ➜ Interview ➜ Offered!"
        suggestions = ["Go to Application Tracker", "Browse more jobs"]
      } else {
        botReply =
          `I understand you're asking about "${text}". You can explore all verified jobs on the Jobs page, switch to the 'Resume Matcher' tab above to match your skills with a percentage score, or ask me any customer question!`
        suggestions = ["Switch to Resume Matcher", "How do I apply for jobs?", "What is Easy Apply?"]
      }

      const botMsg: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions,
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  // Handle Resume Match Analysis
  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) return

    setIsAnalyzing(true)
    setTimeout(() => {
      const lowerResume = resumeText.toLowerCase()

      const results: MatchResult[] = jobs.map((job) => {
        const jobSkills = job.skills || []
        const matched = jobSkills.filter((skill) => lowerResume.includes(skill.toLowerCase()))
        const missing = jobSkills.filter((skill) => !lowerResume.includes(skill.toLowerCase()))

        // Score based on skills match + title keywords
        let baseScore = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 75 : 50
        const titleTokens = job.title.toLowerCase().split(/\s+/)
        const titleMatches = titleTokens.filter((token) => token.length > 3 && lowerResume.includes(token))
        baseScore += Math.min(25, titleMatches.length * 8)

        const finalScore = Math.min(98, Math.max(45, Math.round(baseScore)))

        return {
          job,
          score: finalScore,
          matchedSkills: matched,
          missingSkills: missing,
        }
      })

      results.sort((a, b) => b.score - a.score)
      setMatchResults(results.slice(0, 5))
      setIsAnalyzing(false)
    }, 700)
  }

  // Demo Resume Quick Load
  const handleLoadSampleResume = () => {
    setResumeText(
      `Full Stack Software Engineer with 4+ years of experience in React, TypeScript, Node.js, Python, and PostgreSQL. Familiar with Tailwind CSS, Docker, GraphQL, PyTorch, and distributed cloud microservices on AWS/GCP.`
    )
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[var(--primary)] via-purple-600 to-indigo-600 text-white shadow-2xl flex items-center justify-center border-2 border-white/20 hover:shadow-[var(--shadow-glow)] transition-all cursor-pointer"
        aria-label="Open HireHub Career AI Bot"
      >
        <span className="relative">
          {isOpen ? <X size={24} /> : <Bot size={24} />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </span>
      </motion.button>

      {/* Main Bot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-20 md:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] h-[560px] max-h-[82vh] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-[var(--card)] border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)]">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                    <span>HireHub AI Career Bot</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Application Guide & Skill Matcher
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 border-b border-[var(--border)] text-xs font-bold">
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === "chat"
                    ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--muted)]/30"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <MessageSquare size={14} /> Career Q&A Support
              </button>
              <button
                onClick={() => setActiveTab("matcher")}
                className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === "matcher"
                    ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--muted)]/30"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Sparkles size={14} /> Resume Job Matcher
              </button>
            </div>

            {/* TAB 1: CONVERSATIONAL ASSISTANT */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)]/50">
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          m.sender === "user"
                            ? "bg-[var(--primary)] text-white font-medium rounded-br-sm shadow-sm"
                            : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-sm shadow-sm whitespace-pre-line"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)] mt-1 px-1">
                        {m.time}
                      </span>

                      {/* Bot Suggestions */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                          {m.suggestions.map((sug) => (
                            <button
                              key={sug}
                              onClick={() => {
                                if (sug === "Take me to Jobs page") {
                                  navigate("/jobs")
                                  setIsOpen(false)
                                } else if (sug === "Switch to Resume Matcher") {
                                  setActiveTab("matcher")
                                } else if (sug === "Go to Application Tracker") {
                                  navigate("/dashboard/applications")
                                  setIsOpen(false)
                                } else {
                                  handleSendMessage(sug)
                                }
                              }}
                              className="px-2.5 py-1 rounded-xl bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] text-[11px] font-medium text-[var(--foreground)] transition-colors text-left"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] w-20">
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="p-3 bg-[var(--card)] border-t border-[var(--border)] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about applying, roles, or verification..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: RESUME JOB MATCHER WITH MATCH PERCENTAGE */}
            {activeTab === "matcher" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]/50">
                <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      <FileText size={14} className="text-[var(--primary)]" />
                      Paste or Type Your Resume Summary:
                    </label>
                    <button
                      type="button"
                      onClick={handleLoadSampleResume}
                      className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer with 5 years experience in React, TypeScript, Tailwind CSS, GraphQL, and performance optimization..."
                    className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold"
                    isLoading={isAnalyzing}
                    onClick={handleAnalyzeResume}
                    disabled={!resumeText.trim()}
                  >
                    <Sparkles size={14} className="mr-1.5" />
                    Calculate Match Percentage for Open Roles
                  </Button>
                </div>

                {/* Match Results */}
                {matchResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                        Top Matched Open Roles ({matchResults.length})
                      </h4>
                      <span className="text-[11px] text-green-500 font-bold">
                        Sorted by Fit
                      </span>
                    </div>

                    {matchResults.map(({ job, score, matchedSkills, missingSkills }) => (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-2 hover:border-[var(--primary)]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/jobs/${job.id}`}
                              onClick={() => setIsOpen(false)}
                              className="font-bold text-xs sm:text-sm text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                            >
                              {job.title}
                            </Link>
                            <p className="text-[11px] text-[var(--muted-foreground)]">
                              {job.company.name} · {job.location}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                score >= 85
                                  ? "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30"
                                  : score >= 70
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                    : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {score}% MATCH
                            </span>
                          </div>
                        </div>

                        {/* Matched skills pill */}
                        {matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center text-[10px]">
                            <span className="text-green-500 font-semibold mr-1">Matched:</span>
                            {matchedSkills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-medium"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Missing skills pill */}
                        {missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center text-[10px]">
                            <span className="text-amber-500 font-semibold mr-1">Recommended:</span>
                            {missingSkills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              >
                                + {s}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
                          <span className="text-[11px] font-semibold text-[var(--primary)] uppercase">
                            {job.applyMode === "both"
                              ? "Easy Apply & External"
                              : job.applyMode === "external"
                                ? "Apply on Website"
                                : "Easy Apply"}
                          </span>
                          <Link
                            to={`/jobs/${job.id}`}
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                          >
                            Apply Now <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
