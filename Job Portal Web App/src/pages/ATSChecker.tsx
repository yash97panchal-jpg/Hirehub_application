import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"

interface ATSResult {
  score: number
  breakdown: { label: string; score: number; max: number }[]
  matched: string[]
  missing: string[]
  suggestions: string[]
}

const sampleResult: ATSResult = {
  score: 73,
  breakdown: [
    { label: "Keyword Match", score: 18, max: 25 },
    { label: "Skills Section", score: 14, max: 20 },
    { label: "Formatting", score: 16, max: 20 },
    { label: "Section Completeness", score: 12, max: 15 },
    { label: "Action Verbs", score: 8, max: 12 },
    { label: "Resume Length", score: 5, max: 8 },
  ],
  matched: ["React", "TypeScript", "Node.js", "Git", "REST API", "Agile"],
  missing: ["GraphQL", "Docker", "AWS", "PostgreSQL", "CI/CD"],
  suggestions: [
    'Add quantified achievements (e.g., "Reduced load time by 40%")',
    "Include a professional summary at the top",
    "Add missing keywords: GraphQL, Docker, AWS",
    'Use more action verbs like "architected", "optimized", "delivered"',
    "Ensure contact info includes LinkedIn URL and GitHub profile",
    "Resume is slightly long — consider trimming to 1-2 pages",
  ],
}

function ScoreGauge({ score }: { score: number }) {
  const pct = score / 100
  const r = 60
  const circ = 2 * Math.PI * r
  const dash = pct * circ * 0.75
  const offset = circ * 0.125

  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444"
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={r}
            stroke="var(--muted)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
          <motion.circle
            cx="70"
            cy="70"
            r={r}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="font-poppins text-4xl font-black"
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            / 100
          </span>
        </div>
      </div>
      <Badge
        variant={score >= 80 ? "success" : score >= 60 ? "warning" : "error"}
        className="mt-2 text-sm px-4 py-1"
      >
        {label}
      </Badge>
    </div>
  )
}

export default function ATSChecker() {
  const [file, setFile] = useState<File | null>(null)
  const [jd, setJD] = useState("")
  const [result, setResult] = useState<ATSResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      alert("File too large (max 5MB)")
      return
    }
    if (
      ![
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(f.type)
    ) {
      alert("Only PDF or DOCX accepted")
      return
    }
    setFile(f)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2500))
    setResult(sampleResult)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--muted)]  text-[var(--primary)] text-sm font-medium mb-4">
            <Zap size={14} /> AI-Powered Resume Analysis
          </div>
          <h1 className="font-poppins text-4xl font-bold text-[var(--foreground)] mb-3">
            ATS Resume Checker
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
            Upload your resume and optionally paste a job description to get an
            instant ATS compatibility score with personalized improvement tips.
          </p>
        </div>

        {!result ? (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Upload */}
            <div className="lg:col-span-3 space-y-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDrag(true)
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDrag(false)
                  const f = e.dataTransfer.files[0]
                  if (f) handleFile(f)
                }}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  drag
                    ? "border-[var(--primary)] bg-[var(--muted)] dark:bg-blue-900/10"
                    : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] flex items-center justify-center mx-auto mb-4">
                  {file ? (
                    <FileText size={28} className="text-[var(--primary)]" />
                  ) : (
                    <Upload
                      size={28}
                      className="text-[var(--muted-foreground)]"
                    />
                  )}
                </div>
                {file ? (
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {file.name}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {(file.size / 1024).toFixed(0)} KB · Ready to analyze
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      Drop your resume here
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      or click to browse · PDF or DOCX, max 5MB
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Job Description{" "}
                  <span className="text-[var(--muted-foreground)] font-normal">
                    (optional but improves accuracy)
                  </span>
                </label>
                <textarea
                  value={jd}
                  onChange={(e) => setJD(e.target.value)}
                  rows={8}
                  placeholder="Paste the full job description here to get keyword-matched analysis…"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!file}
                isLoading={loading}
                onClick={analyze}
              >
                <Zap size={18} />
                {loading ? "Analyzing Resume…" : "Analyze My Resume"}
              </Button>
            </div>

            {/* What we check */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
                <h3 className="font-poppins font-semibold text-[var(--foreground)] mb-5">
                  What We Analyze
                </h3>
                <ul className="space-y-3">
                  {[
                    {
                      label: "Keyword Match",
                      desc: "Against job description and industry standards",
                    },
                    {
                      label: "Skills Section",
                      desc: "Technical and soft skills presence",
                    },
                    {
                      label: "Formatting",
                      desc: "ATS-parseable structure and readability",
                    },
                    {
                      label: "Completeness",
                      desc: "Contact, summary, experience, education",
                    },
                    {
                      label: "Action Verbs",
                      desc: "Strong verbs and quantified achievements",
                    },
                    {
                      label: "Resume Length",
                      desc: "Optimal 1-2 pages for most roles",
                    },
                  ].map((item) => (
                    <li key={item.label} className="flex gap-3">
                      <CheckCircle
                        size={16}
                        className="text-[var(--primary)] shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score overview */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
              <div className="grid sm:grid-cols-3 gap-8 items-center">
                <div className="flex justify-center">
                  <ScoreGauge score={result.score} />
                </div>
                <div className="sm:col-span-2">
                  <h2 className="font-poppins font-bold text-xl text-[var(--foreground)] mb-4">
                    Score Breakdown
                  </h2>
                  <div className="space-y-3">
                    {result.breakdown.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[var(--foreground)]">
                            {item.label}
                          </span>
                          <span className="text-[var(--muted-foreground)]">
                            {item.score}/{item.max}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background:
                                item.score / item.max >= 0.8
                                  ? "#22C55E"
                                  : item.score / item.max >= 0.6
                                    ? "#F59E0B"
                                    : "#EF4444",
                            }}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(item.score / item.max) * 100}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Keywords */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" /> Matched
                  Keywords ({result.matched.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matched.map((kw) => (
                    <Badge key={kw} variant="success">
                      {kw}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mt-4 mb-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" /> Missing
                  Keywords ({result.missing.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing.map((kw) => (
                    <Badge key={kw} variant="error">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[var(--primary)]" />{" "}
                  Improvement Tips
                </h3>
                <ul className="space-y-2.5">
                  {result.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm text-[var(--foreground)]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center shrink-0 font-bold">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null)
                  setFile(null)
                }}
              >
                Analyze Another Resume
              </Button>
              <Button
                variant="primary"
                onClick={() => (window.location.href = "/resume-builder")}
              >
                Build Optimized Resume
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
