import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  X,
  Send,
  Sparkles,
  FileText,
  Lock,
  LogIn,
  UserPlus,
  ArrowRight,
  Briefcase,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
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
  requiresAuth?: boolean
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
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Chat States
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Resume Matcher States
  const [resumeText, setResumeText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])

  // Initialize or update welcome message based on auth status
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([
        {
          id: "m-welcome",
          sender: "bot",
          text: "Welcome to HireHub Assistant! To apply for jobs, track status, or analyze resumes with AI, you need an account.\n\n• If your account exists: Please Log In.\n• If you are new: Please Create an Account.",
          time: "Just now",
          requiresAuth: true,
          suggestions: [
            "Log In to My Account",
            "Create Free Candidate Account",
            "How do I apply for jobs?",
            "What is Easy Apply vs External Apply?",
          ],
        },
      ])
    } else {
      setMessages([
        {
          id: "m-welcome",
          sender: "bot",
          text: `Welcome back, ${user?.name || "Job Seeker"}! I can help you find verified openings, guide your applications, or analyze your resume against all active roles.`,
          time: "Just now",
          suggestions: [
            "How do I apply for jobs?",
            "What is Easy Apply vs External Apply?",
            "Find remote software engineering jobs",
            "Go to Application Tracker",
          ],
        },
      ])
    }
  }, [isAuthenticated, user?.name])

  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, activeTab])

  // Handle User Chat Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim()
    if (!text) return

    // Direct navigation if user clicked auth suggestion
    if (text === "Log In to My Account" || text === "Log In Now") {
      setIsOpen(false)
      navigate("/login")
      return
    }
    if (
      text === "Create Free Candidate Account" ||
      text === "Create Free Account" ||
      text === "Create Account"
    ) {
      setIsOpen(false)
      navigate("/register")
      return
    }

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
      let requiresAuth = false

      // If NOT logged in, require login / account creation first!
      if (!isAuthenticated) {
        botReply =
          "Authentication Required:\nTo apply for jobs, track applications, or use HireHub career features, you must be signed in.\n\n• If your account exists: Please Log In.\n• If not: Please Create an Account to get started."
        requiresAuth = true
        suggestions = [
          "Log In to My Account",
          "Create Free Candidate Account",
          "What is Easy Apply vs External Apply?",
        ]
      } else if (lower.includes("how do i apply") || lower.includes("how to apply")) {
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
          `I understand you're asking about "${text}". You can explore all verified jobs on the Jobs page, switch to the 'Resume Matcher' tab above to match your skills with a percentage score, or ask me any question!`
        suggestions = ["Switch to Resume Matcher", "How do I apply for jobs?", "What is Easy Apply?"]
      }

      const botMsg: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions,
        requiresAuth,
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  // Handle Resume Match Analysis
  const handleAnalyzeResume = () => {
    if (!isAuthenticated) {
      toast.error("Please log in or create an account to match your resume.")
      navigate("/login")
      setIsOpen(false)
      return
    }

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
    if (!isAuthenticated) {
      toast.error("Please log in or create an account first.")
      navigate("/login")
      setIsOpen(false)
      return
    }
    setResumeText(
      `Full Stack Software Engineer with 4+ years of experience in React, TypeScript, Node.js, Python, and PostgreSQL. Familiar with Tailwind CSS, Docker, GraphQL, PyTorch, and distributed cloud microservices on AWS/GCP.`
    )
  }

  // Handle Apply button click in Matcher
  const handleApplyClick = (jobId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in or create an account to apply.")
      navigate(`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`)
      setIsOpen(false)
      return
    }
    navigate(`/jobs/${jobId}`)
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Launcher Button with Vibrant Brand Accent */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] text-white shadow-xl hover:shadow-2xl flex items-center justify-center border-2 border-white/30 transition-all cursor-pointer"
        aria-label="Open HireHub Career AI Bot"
      >
        <span className="relative">
          {isOpen ? <X size={24} /> : <Bot size={24} />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
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
            className="fixed bottom-20 md:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[420px] h-[570px] max-h-[84vh] bg-white dark:bg-[#101F3E] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header: Authoritative Deep Navy Brand Authority */}
            <div className="p-4 bg-gradient-to-r from-[#101F3E] via-[#1E3563] to-[#101F3E] text-white border-b border-slate-700/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F97316] shadow-xs">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-sm text-white flex items-center gap-1.5">
                    <span>HireHub AI Career Bot</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Application Guide & Skill Matcher
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0 bg-slate-50 dark:bg-[#0B132B]">
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
                  activeTab === "chat"
                    ? "border-[#F97316] text-[#EA580C] dark:text-[#F97316] bg-orange-50/70 dark:bg-orange-950/30"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare size={14} /> Career Q&A Support
              </button>
              <button
                onClick={() => setActiveTab("matcher")}
                className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
                  activeTab === "matcher"
                    ? "border-[#F97316] text-[#EA580C] dark:text-[#F97316] bg-orange-50/70 dark:bg-orange-950/30"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sparkles size={14} /> Resume Job Matcher
              </button>
            </div>

            {/* TAB 1: CONVERSATIONAL ASSISTANT */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] dark:bg-[#090F1E]">
                {/* Guest Warning Notice when not logged in */}
                {!isAuthenticated && (
                  <div className="bg-orange-50 dark:bg-orange-950/50 border-b border-orange-200 dark:border-orange-800/80 px-3.5 py-2 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#EA580C] dark:text-orange-300 font-semibold truncate">
                      <Lock size={13} className="shrink-0" />
                      <span className="truncate">Sign in required to apply & track</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          navigate("/login")
                        }}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors cursor-pointer"
                      >
                        Log In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          navigate("/register")
                        }}
                        className="text-[11px] font-bold px-2 py-1 rounded-md border border-orange-300 dark:border-orange-700 bg-white dark:bg-[#101F3E] text-[#EA580C] dark:text-orange-300 hover:bg-orange-50 transition-colors cursor-pointer"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Messages Area */}
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
                            ? "bg-[#F97316] text-white font-medium rounded-br-sm shadow-xs"
                            : "bg-white dark:bg-[#101F3E] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-xs whitespace-pre-line"
                        }`}
                      >
                        {m.text}

                        {/* Interactive Auth Prompt Buttons */}
                        {m.requiresAuth && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="font-bold shadow-xs text-xs py-1 px-3"
                              onClick={() => {
                                setIsOpen(false)
                                navigate("/login")
                              }}
                            >
                              <LogIn size={13} className="mr-1" /> Log In
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-bold text-xs py-1 px-3"
                              onClick={() => {
                                setIsOpen(false)
                                navigate("/register")
                              }}
                            >
                              <UserPlus size={13} className="mr-1" /> Create Account
                            </Button>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
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
                                  if (!isAuthenticated) {
                                    toast.error("Please log in to view your applications.")
                                    navigate("/login?redirect=/tracker")
                                    setIsOpen(false)
                                  } else {
                                    navigate("/tracker")
                                    setIsOpen(false)
                                  }
                                } else {
                                  handleSendMessage(sug)
                                }
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#F97316] hover:text-white border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors text-left shadow-2xs cursor-pointer"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#101F3E] border border-slate-200 dark:border-slate-700 w-20 shadow-xs">
                      <div className="w-2 h-2 rounded-full bg-[#F97316] animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-[#F97316] animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-[#F97316] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="p-3 bg-white dark:bg-[#101F3E] border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      !isAuthenticated
                        ? "Ask about applying or sign in..."
                        : "Ask about applying, roles, or verification..."
                    }
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090F1E] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-9 h-9 rounded-xl bg-[#F97316] text-white flex items-center justify-center hover:bg-[#EA580C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    aria-label="Send message"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: RESUME JOB MATCHER WITH MATCH PERCENTAGE */}
            {activeTab === "matcher" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC] dark:bg-[#090F1E]">
                {!isAuthenticated ? (
                  /* Auth Gate Card */
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#101F3E] border border-orange-200 dark:border-orange-800 text-center space-y-3.5 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-[#EA580C] dark:text-orange-300 flex items-center justify-center mx-auto border border-orange-200/80 dark:border-orange-800/80">
                      <Lock size={22} />
                    </div>
                    <div>
                      <h4 className="font-poppins font-bold text-sm text-slate-900 dark:text-white">
                        Account Required to Match & Apply
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        To calculate your resume match score and submit 1-click applications to verified employers, you must be signed in.
                      </p>
                      <p className="text-xs font-semibold text-[#EA580C] dark:text-orange-300 mt-2">
                        If your account exists, please Log In. If not, please Create an Account.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 max-w-xs mx-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full font-bold justify-center"
                        onClick={() => {
                          setIsOpen(false)
                          navigate("/login")
                        }}
                      >
                        <LogIn size={14} className="mr-1.5" /> Log In
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-bold justify-center"
                        onClick={() => {
                          setIsOpen(false)
                          navigate("/register")
                        }}
                      >
                        <UserPlus size={14} className="mr-1.5" /> Create Account
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Authenticated Resume Input Area */
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#101F3E] border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <FileText size={14} className="text-[#F97316]" />
                        Paste or Type Your Resume Summary:
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSampleResume}
                        className="text-[11px] font-semibold text-[#EA580C] dark:text-orange-300 hover:underline cursor-pointer"
                      >
                        Load Sample
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer with 5 years experience in React, TypeScript, Tailwind CSS, GraphQL, and performance optimization..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090F1E] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] resize-none"
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
                )}

                {/* Match Results */}
                {matchResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Top Matched Open Roles ({matchResults.length})
                      </h4>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Sorted by Fit
                      </span>
                    </div>

                    {matchResults.map(({ job, score, matchedSkills, missingSkills }) => (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#101F3E] border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 hover:border-[#F97316]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/jobs/${job.id}`}
                              onClick={() => setIsOpen(false)}
                              className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-[#F97316] hover:underline"
                            >
                              {job.title}
                            </Link>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {job.company.name} · {job.location}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-black ${
                                score >= 85
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : score >= 70
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                    : "bg-orange-500/15 text-[#EA580C] dark:text-orange-400 border border-orange-500/30"
                              }`}
                            >
                              {score}% MATCH
                            </span>
                          </div>
                        </div>

                        {/* Matched skills pill */}
                        {matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center text-[10px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
                              Matched:
                            </span>
                            {matchedSkills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Missing skills pill */}
                        {missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center text-[10px]">
                            <span className="text-amber-600 dark:text-amber-400 font-semibold mr-1">
                              Recommended:
                            </span>
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

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/80">
                          <span className="text-[11px] font-semibold text-[#EA580C] dark:text-orange-300 uppercase">
                            {job.applyMode === "both"
                              ? "Easy Apply & External"
                              : job.applyMode === "external"
                                ? "Apply on Website"
                                : "Easy Apply"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplyClick(job.id)}
                            className="text-xs font-bold text-[#F97316] hover:text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Apply Now <ArrowRight size={12} />
                          </button>
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
