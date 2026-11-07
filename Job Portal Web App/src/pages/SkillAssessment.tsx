import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import toast from "react-hot-toast"
import { triggerConfetti } from "../utils/confetti"
import { useAuthStore } from "../store/authStore"

interface Question {
  id: number
  question: string
  codeSnippet?: string
  options: string[]
  correctIndex: number
  explanation: string
}

const quizData: Record<string, { title: string; timeMinutes: number; questions: Question[] }> = {
  react: {
    title: "React 19 & Frontend Architecture",
    timeMinutes: 10,
    questions: [
      {
        id: 1,
        question: "What does React 19 Actions primarily simplify?",
        options: [
          "Direct DOM mutations",
          "Handling async transitions and pending form state automatically",
          "Replacing Tailwind CSS utility classes",
          "Replacing Web Workers",
        ],
        correctIndex: 1,
        explanation: "React 19 Actions automatically handle pending states, optimistic updates, and error handling for async operations.",
      },
      {
        id: 2,
        question: "In React, what hook is used to cache computationally intensive values between re-renders?",
        codeSnippet: "const cachedValue = useMemo(() => computeHeavyCalculation(a, b), [a, b])",
        options: ["useEffect", "useCallback", "useMemo", "useRef"],
        correctIndex: 2,
        explanation: "useMemo caches the result of a calculation between re-renders until dependencies change.",
      },
      {
        id: 3,
        question: "Which pattern prevents prop drilling across deeply nested React components?",
        options: [
          "React Context / State Manager (Zustand/Redux)",
          "Inline CSS styles",
          "dangerouslySetInnerHTML",
          "Window session storage only",
        ],
        correctIndex: 0,
        explanation: "React Context or dedicated stores like Zustand eliminate prop drilling by providing central state access.",
      },
      {
        id: 4,
        question: "What is the key benefit of React Server Components (RSC)?",
        options: [
          "Increases bundle size shipped to client",
          "Zero client-side JavaScript bundle overhead for static server components",
          "Forces all state to be stored in localStorage",
          "Disables CSS animations",
        ],
        correctIndex: 1,
        explanation: "RSCs execute strictly on the server and do not add to the client JS bundle.",
      },
    ],
  },
  system_design: {
    title: "Cloud & System Design Fundamentals",
    timeMinutes: 10,
    questions: [
      {
        id: 1,
        question: "Which database type is optimal for transactional consistency (ACID) in financial applications?",
        options: ["Document DB", "Relational Database (PostgreSQL/MySQL)", "Key-Value Store", "Time-series DB"],
        correctIndex: 1,
        explanation: "Relational databases provide strong ACID transaction guarantees essential for financial ledgers.",
      },
      {
        id: 2,
        question: "What mechanism is primarily used to prevent database query stampedes during high traffic spikes?",
        options: ["Distributed Caching with Redis", "Inline loops", "Dropping connections", "Synchronous file writing"],
        correctIndex: 0,
        explanation: "Redis in-memory caching stores hot query results, reducing direct database load.",
      },
    ],
  },
}

export default function SkillAssessment() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [selectedTrack, setSelectedTrack] = useState<string>("react")
  const [isTestActive, setIsTestActive] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [testCompleted, setTestCompleted] = useState(false)

  const activeQuiz = quizData[selectedTrack] || quizData.react
  const questions = activeQuiz.questions

  useEffect(() => {
    let timer: any
    if (isTestActive && !testCompleted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    } else if (timeLeft === 0 && isTestActive) {
      handleFinish()
    }
    return () => clearInterval(timer)
  }, [isTestActive, testCompleted, timeLeft])

  const handleStart = (trackKey: string) => {
    setSelectedTrack(trackKey)
    setCurrentIdx(0)
    setSelectedAnswers({})
    setTimeLeft(600)
    setIsTestActive(true)
    setTestCompleted(false)
  }

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optionIndex,
    })
  }

  const handleFinish = () => {
    setIsTestActive(false)
    setTestCompleted(true)
    const score = calculateScore()
    if (score >= 75) {
      triggerConfetti()
      toast.success("Skill Assessment Completed! Verified Badge added to your profile.")
      const trackSkill = activeQuiz.title.includes("React") ? "React 19" : "System Design"
      const currentSkills = user?.skills || []
      updateUser({
        isVerified: true,
        skills: Array.from(new Set([...currentSkills, trackSkill])),
      })
    } else {
      toast("Assessment completed. Score: " + score + "%")
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {!isTestActive && !testCompleted ? (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="accent" size="md" className="mb-3">
                <Sparkles size={13} className="mr-1" /> Industry Standard Skill Certification
              </Badge>
              <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-[var(--foreground)]">
                HireHub Skill Assessments
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Pass a 10-minute technical assessment to earn a <strong>Verified Skill Badge</strong> displayed on your candidate profile and ATS applications.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  id: "react",
                  title: "React 19 & Frontend Architecture",
                  desc: "Tests state management, hooks, render optimization, and modern React 19 capabilities.",
                  questionsCount: 4,
                  time: "10 mins",
                  level: "Intermediate / Senior",
                },
                {
                  id: "system_design",
                  title: "Cloud & System Design Fundamentals",
                  desc: "Tests ACID properties, microservices, load balancing, caching and high availability.",
                  questionsCount: 2,
                  time: "10 mins",
                  level: "Mid-level / Architect",
                },
              ].map((track) => (
                <div
                  key={track.id}
                  className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-sm hover:border-[var(--primary)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                        <Code size={20} />
                      </div>
                      <Badge variant="default" size="sm">{track.level}</Badge>
                    </div>
                    <h3 className="font-bold text-lg text-[var(--foreground)] mb-1">
                      {track.title}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6 leading-relaxed">
                      {track.desc}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] mb-6 pb-4 border-b border-[var(--border)]">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {track.time}
                      </span>
                      <span>•</span>
                      <span>{track.questionsCount} Multiple Choice Questions</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-bold"
                    onClick={() => handleStart(track.id)}
                  >
                    Start Assessment Now <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : isTestActive ? (
          /* Active Test Canvas */
          <div className="max-w-3xl mx-auto bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)]">{activeQuiz.title}</h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-mono font-bold text-xs">
                <Clock size={14} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Question Body */}
            <div className="mb-8">
              <h4 className="text-base font-semibold text-[var(--foreground)] mb-4">
                {questions[currentIdx].question}
              </h4>

              {questions[currentIdx].codeSnippet && (
                <pre className="p-4 rounded-xl bg-neutral-900 text-emerald-400 font-mono text-xs overflow-x-auto mb-6">
                  {questions[currentIdx].codeSnippet}
                </pre>
              )}

              <div className="space-y-3">
                {questions[currentIdx].options.map((opt, optIndex) => {
                  const isSelected = selectedAnswers[currentIdx] === optIndex
                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectOption(optIndex)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] font-semibold ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)] hover:bg-[var(--muted)]/50 text-[var(--foreground)]"
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isSelected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)]"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={13} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stepper Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                disabled={currentIdx === 0}
              >
                Previous
              </Button>

              {currentIdx < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFinish}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                >
                  Submit & Score Assessment
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Results Screen */
          <div className="max-w-xl mx-auto bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xl p-8 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Award size={44} />
            </div>
            <h3 className="font-poppins font-bold text-2xl text-[var(--foreground)]">
              Assessment Completed!
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-6">
              {activeQuiz.title} Skill Verification
            </p>

            <div className="p-6 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] mb-6 text-center">
              <span className="text-4xl font-extrabold font-poppins text-emerald-500">
                {calculateScore()}%
              </span>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {calculateScore() >= 75
                  ? "✓ Congratulations! You scored in the top 10% and earned the Verified Skill Badge."
                  : "Keep practicing! You can retake the assessment after 24 hours to improve your score."}
              </p>
            </div>

            {calculateScore() >= 75 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-6 flex items-center justify-center gap-1.5">
                <ShieldCheck size={16} /> Verified Badge added to your HireHub Profile
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1 text-xs"
                onClick={() => {
                  setTestCompleted(false)
                  setIsTestActive(false)
                }}
              >
                <RotateCcw size={13} className="mr-1" /> Browse Assessments
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 text-xs"
                onClick={() => navigate("/jobs")}
              >
                Apply to Verified Jobs
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
