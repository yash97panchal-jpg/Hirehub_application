import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  X,
  Target,
  Send,
  Award,
  Layers,
  Code,
  Users,
} from "lucide-react"
import Button from "../ui/Button"
import toast from "react-hot-toast"

interface InterviewPrepModalProps {
  isOpen: boolean
  onClose: () => void
}

interface QuestionItem {
  id: string
  category: "Technical" | "System Design" | "Behavioral"
  question: string
  difficulty: "Medium" | "Hard"
  tips: string
  sampleAnswer: string
  keywords: string[]
}

const PREP_QUESTIONS: QuestionItem[] = [
  {
    id: "q-1",
    category: "Technical",
    question: "How do React 19 Actions and concurrent features optimize rendering performance?",
    difficulty: "Medium",
    tips: "Focus on automatic state transitions, pending states via useTransition/useActionState, and non-blocking asynchronous updates.",
    sampleAnswer: "React 19 Actions simplify async state transitions by automatically handling pending states, errors, optimistic updates, and sequential form submissions. By leveraging useTransition, low-priority background updates do not block user typing or animations, ensuring seamless 60fps UX even during large state trees reconciliation.",
    keywords: ["useTransition", "useActionState", "Optimistic Updates", "Non-blocking", "Concurrent Mode"],
  },
  {
    id: "q-2",
    category: "System Design",
    question: "Design a high-throughput Job Notification and Alert service processing 100K alerts/minute.",
    difficulty: "Hard",
    tips: "Discuss event-driven architecture, Redis Pub/Sub, Kafka topic partitioning, rate limiting, and batch email dispatch.",
    sampleAnswer: "The architecture decouples job creation from alert generation via Kafka. An indexing worker identifies candidate matches using Postgres pg_trgm indices and produces notification payloads into priority queues. Workers consume messages in batches, de-duplicate rapid events with Redis TTL keys, and deliver via webhook/email provider pools with exponential backoff.",
    keywords: ["Kafka", "Redis", "Partitioning", "Idempotency", "Rate Limiting", "Batching"],
  },
  {
    id: "q-3",
    category: "Behavioral",
    question: "Tell me about a time you had a technical disagreement with a teammate or stakeholder. How did you resolve it?",
    difficulty: "Medium",
    tips: "Use the STAR method (Situation, Task, Action, Result). Emphasize data-driven trade-off analysis and constructive alignment.",
    sampleAnswer: "Situation: At my previous company, our team debated whether to rewrite our API layer with GraphQL or optimize existing REST endpoints. Task: I was responsible for proposing a scalable path without slowing Q3 release goals. Action: I benchmarked query latencies and payload sizes for both options, and hosted a collaborative architectural review. We compromised by adopting GraphQL for client dashboards while keeping high-speed REST microservices. Result: We cut payload overhead by 40% and delivered the release on schedule with full engineering consensus.",
    keywords: ["STAR Method", "Data-driven", "Collaboration", "Trade-offs", "Consensus"],
  },
  {
    id: "q-4",
    category: "Technical",
    question: "How do you secure Supabase / PostgreSQL databases against unauthorized multi-tenant data access?",
    difficulty: "Hard",
    tips: "Explain Row Level Security (RLS), auth.uid() scoping, security definer triggers, and avoiding exposed service-role keys in client bundles.",
    sampleAnswer: "Database security relies on defense-in-depth: 1) Enable RLS on every table. 2) Restrict SELECT/INSERT/UPDATE via auth.uid() matching user_id or validated company membership. 3) Prevent non-admin role escalation using BEFORE UPDATE triggers. 4) Use signed URLs with 1-hour expiration for private files. 5) Strictly keep service-role credentials server-side in Edge Functions, only shipping public anon keys to the browser.",
    keywords: ["Row Level Security", "RLS", "auth.uid()", "Role Escalation Trigger", "Signed URLs"],
  },
]

export default function InterviewPrepModal({ isOpen, onClose }: InterviewPrepModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Technical" | "System Design" | "Behavioral">("All")
  const [activeQuestion, setActiveQuestion] = useState<QuestionItem>(PREP_QUESTIONS[0])
  const [userPracticeAnswer, setUserPracticeAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null)

  const filteredQuestions = selectedCategory === "All"
    ? PREP_QUESTIONS
    : PREP_QUESTIONS.filter((q) => q.category === selectedCategory)

  const handleEvaluatePractice = () => {
    if (!userPracticeAnswer.trim()) {
      toast.error("Please enter your practice response first.")
      return
    }

    const lower = userPracticeAnswer.toLowerCase()
    const hitKeywords = activeQuestion.keywords.filter((kw) => lower.includes(kw.toLowerCase()))
    const missing = activeQuestion.keywords.filter((kw) => !lower.includes(kw.toLowerCase()))

    const score = Math.round((hitKeywords.length / activeQuestion.keywords.length) * 100)
    setPracticeFeedback(
      `Score: ${score}% match. You successfully covered ${hitKeywords.length} key concept(s) (${hitKeywords.join(", ")}). ${
        missing.length > 0 ? `Consider expanding on: ${missing.join(", ")}.` : "Outstanding, comprehensive coverage!"
      }`
    )
    toast.success("AI practice response evaluated!")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-[var(--foreground)]">
                Interactive Interview Preparation Suite
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Practice real engineering, system design, and STAR behavioral questions with AI model answers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Question List Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[var(--border)] p-4 overflow-y-auto space-y-3 bg-[var(--background)]">
            <div className="flex flex-wrap gap-1">
              {(["All", "Technical", "System Design", "Behavioral"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              {filteredQuestions.map((q) => {
                const isSelected = activeQuestion.id === q.id
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuestion(q)
                      setShowAnswer(false)
                      setUserPracticeAnswer("")
                      setPracticeFeedback(null)
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-xs"
                        : "border-[var(--border)] hover:border-[var(--primary)]/40 bg-[var(--card)]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                      <span className="text-[var(--primary)] uppercase">{q.category}</span>
                      <span className="px-1.5 py-0.5 rounded-sm bg-[var(--muted)] text-[var(--muted-foreground)]">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-2">
                      {q.question}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Practice & Model Answer Pane */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* Question Header Card */}
            <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[var(--primary)] text-white text-[10px] font-bold uppercase">
                  {activeQuestion.category}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] font-semibold">
                  Difficulty: {activeQuestion.difficulty}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] leading-snug">
                {activeQuestion.question}
              </h3>
              <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300 pt-1">
                <Lightbulb size={14} className="shrink-0 mt-0.5" />
                <span><strong>Interviewer Tip:</strong> {activeQuestion.tips}</span>
              </div>
            </div>

            {/* Practice Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--foreground)] flex items-center justify-between">
                <span>Your Practice Answer (Type or outline your response):</span>
                <span className="text-[11px] text-[var(--muted-foreground)] font-normal">
                  STAR method recommended
                </span>
              </label>
              <textarea
                rows={4}
                value={userPracticeAnswer}
                onChange={(e) => setUserPracticeAnswer(e.target.value)}
                placeholder="Structure your answer: 1) Context / Situation 2) The core challenge 3) Specific actions you took 4) Measurable outcome..."
                className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEvaluatePractice}
                  className="text-xs font-bold"
                >
                  <Sparkles size={14} className="mr-1.5" /> Evaluate My Answer
                </Button>
                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  {showAnswer ? "Hide Model Answer" : "Reveal Model Answer & Keywords →"}
                </button>
              </div>
            </div>

            {/* AI Practice Feedback */}
            {practiceFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200"
              >
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={15} /> AI Practice Assessment:
                </p>
                <p className="leading-relaxed">{practiceFeedback}</p>
              </motion.div>
            )}

            {/* Revealed Model Answer */}
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-[var(--card)] border border-emerald-500/40 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Award size={15} /> Recommended Model Answer:
                  </span>
                </div>
                <p className="text-xs text-[var(--foreground)] leading-relaxed italic">
                  "{activeQuestion.sampleAnswer}"
                </p>
                <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] mr-1">
                    Key Terminology & Concepts:
                  </span>
                  {activeQuestion.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--foreground)] text-[11px] font-semibold"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
