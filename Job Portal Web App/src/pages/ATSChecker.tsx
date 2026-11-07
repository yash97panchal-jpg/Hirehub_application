import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Edit3,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import toast from "react-hot-toast"
import {
  ATS_ROLE_PROFILES,
  getCustomRoleProfile,
  type RoleSkillProfile,
} from "../data/atsRoleProfiles"

interface ATSResult {
  score: number
  targetRole: RoleSkillProfile
  breakdown: { label: string; score: number; max: number }[]
  matchedSkills: string[]
  missingCoreSkills: string[]
  recommendedInDemandSkills: string[]
  tailoredBullets: { skill: string; bullet: string; explanation: string }[]
  realLifeTips: { title: string; action: string; impact: string }[]
  generalSuggestions: string[]
}

function ScoreGauge({ score }: { score: number }) {
  const pct = score / 100
  const r = 60
  const circ = 2 * Math.PI * r
  const dash = pct * circ * 0.75
  const offset = circ * 0.125

  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444"
  const label = score >= 80 ? "ATS Ready (Pass)" : score >= 60 ? "Average (Needs Tweaks)" : "High Risk of Rejection"

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
        className="mt-2 text-xs px-3.5 py-1 font-semibold"
      >
        {label}
      </Badge>
    </div>
  )
}

export default function ATSChecker() {
  const navigate = useNavigate()
  const [selectedRoleId, setSelectedRoleId] = useState<string>("frontend-developer")
  const [customRoleInput, setCustomRoleInput] = useState<string>("")
  const [isCustomRole, setIsCustomRole] = useState<boolean>(false)

  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState<string>("")
  const [jd, setJD] = useState("")
  const [result, setResult] = useState<ATSResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"file" | "text">("file")

  // Current active role profile
  const currentRoleProfile: RoleSkillProfile = isCustomRole && customRoleInput.trim()
    ? getCustomRoleProfile(customRoleInput.trim())
    : ATS_ROLE_PROFILES.find((p) => p.id === selectedRoleId) || ATS_ROLE_PROFILES[0]

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)")
      return
    }
    const ext = f.name.split(".").pop()?.toLowerCase() || ""
    if (
      ![
        "pdf",
        "docx",
        "doc",
        "txt",
        "md",
        "rtf",
      ].includes(ext)
    ) {
      toast.error("Accepted formats: PDF, DOCX, TXT, MD")
      return
    }
    setFile(f)
    if (ext === "txt" || ext === "md" || f.type.startsWith("text/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (text) {
          setResumeText(text)
        }
      }
      reader.readAsText(f)
    }
    toast.success(`Loaded "${f.name}" ready for ATS analysis`)
  }

  const fillSampleResume = () => {
    setActiveTab("text")
    setResumeText(`JOHN DOE
Software Engineer | Frontend Specialist
john.doe@email.com | github.com/johndoe | linkedin.com/in/johndoe

SUMMARY
Frontend developer with 3+ years experience building web applications using React, JavaScript, and HTML/CSS. Looking for modern engineering roles.

EXPERIENCE
Frontend Developer | Tech Solutions (2023 - Present)
- Developed user interfaces using React and JavaScript.
- Worked with REST APIs to fetch and display application data.
- Collaborated in an Agile team of 6 developers and attended daily standups.
- Managed codebase using Git and GitHub.

SKILLS
Languages: JavaScript (ES6), HTML5, CSS3
Frameworks & Libraries: React, Redux
Tools: Git, VS Code, REST API`)
  }

  const analyze = async () => {
    if (!file && !resumeText.trim()) {
      toast.error("Please upload a resume file or paste your resume text to analyze.")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))

    const activeProfile = isCustomRole && customRoleInput.trim()
      ? getCustomRoleProfile(customRoleInput.trim())
      : ATS_ROLE_PROFILES.find((p) => p.id === selectedRoleId) || ATS_ROLE_PROFILES[0]

    // Evaluate text against must-have skills
    const textToCheck = (resumeText + " " + (file ? file.name : "")).toLowerCase()
    
    // Check which must-have skills are matched
    const matched: string[] = []
    const missingCore: string[] = []

    activeProfile.mustHaveSkills.forEach((skill) => {
      const normalizedSkill = skill.toLowerCase()
      const isPresent =
        textToCheck.includes(normalizedSkill) ||
        textToCheck.includes(normalizedSkill.replace(/[^a-z0-9]/g, "")) ||
        (normalizedSkill.length > 3 && textToCheck.includes(normalizedSkill.split(" ")[0]))
      
      if (isPresent) {
        matched.push(skill)
      } else {
        missingCore.push(skill)
      }
    })

    // In-demand skills recommended to add
    const inDemand = activeProfile.inDemandSkills.slice(0, 4)
    const inDemandMatched = activeProfile.inDemandSkills.filter((s) => textToCheck.includes(s.toLowerCase()))

    // 1. Role Core Keywords (max 25)
    const matchRatio = matched.length / Math.max(activeProfile.mustHaveSkills.length, 1)
    const keywordScore = Math.min(25, Math.round(matchRatio * 25))

    // 2. Modern Tooling & Frameworks (max 20)
    const toolingRatio = inDemandMatched.length / Math.max(activeProfile.inDemandSkills.length, 1)
    const toolingScore = Math.min(20, Math.round(toolingRatio * 14 + (matched.length > 0 ? 6 : 2)))

    // 3. Formatting & Parseability (max 20)
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(textToCheck)
    const hasSections = ["experience", "education", "skill", "summary"].filter((s) => textToCheck.includes(s)).length
    const formatScore = Math.min(20, 10 + (hasEmail ? 4 : 0) + (hasSections >= 2 ? 6 : 2))

    // 4. Quantified Business Metrics (max 15)
    const metricMatches = (textToCheck.match(/\d+[\%kmb\+]|\$\d+|\b\d+\s*(percent|users|engineers|teams|days|months|years|x)\b/g) || []).length
    const metricScore = Math.min(15, Math.max(4, Math.round(4 + Math.min(metricMatches, 5) * 2.2)))

    // 5. Section Hierarchy & Action Verbs (max 12)
    const verbs = ["spearheaded", "architected", "engineered", "developed", "led", "reduced", "scaled", "optimized", "built", "implemented", "designed", "collaborated", "mentored", "automated", "created", "delivered"]
    const matchedVerbs = verbs.filter((v) => textToCheck.includes(v)).length
    const verbScore = Math.min(12, Math.max(4, Math.round(4 + Math.min(matchedVerbs, 8) * 1)))

    // 6. Resume Length & Structure (max 8)
    const wordCount = textToCheck.trim().split(/\s+/).filter(Boolean).length
    const lengthScore = wordCount >= 120 && wordCount <= 1200 ? 8 : wordCount >= 50 ? 6 : 4

    const breakdown = [
      {
        label: `Role Core Keywords (${activeProfile.title})`,
        score: keywordScore,
        max: 25,
      },
      {
        label: "Modern Tooling & Frameworks",
        score: toolingScore,
        max: 20,
      },
      {
        label: "Formatting & Parseability",
        score: formatScore,
        max: 20,
      },
      {
        label: "Quantified Business Metrics",
        score: metricScore,
        max: 15,
      },
      {
        label: "Section Hierarchy & Action Verbs",
        score: verbScore,
        max: 12,
      },
      {
        label: "Resume Length & Structure",
        score: lengthScore,
        max: 8,
      },
    ]

    const totalScore = Math.min(99, Math.max(25, breakdown.reduce((sum, item) => sum + item.score, 0)))

    const suggestions = [
      missingCore.length > 0
        ? `Explicitly weave missing core skills: ${missingCore.slice(0, 3).join(", ")} into your work experience bullet points.`
        : `Strong core skill coverage! Highlight specialized depth in ${matched.slice(0, 2).join(" and ")}.`,
      metricMatches < 3
        ? `Add quantifiable metrics (e.g. 'boosted performance by 35%', 'managed $100k budget') to score full points in business impact.`
        : `Great quantified impact! ATS screeners favor measurable business results.`,
      `Add modern differentiating tools like ${inDemand.slice(0, 2).join(" & ")} to score in the top percentile of applicants.`,
      "Ensure standard section headings: 'Work Experience', 'Technical Skills', 'Education', and 'Projects'.",
    ]

    setResult({
      score: totalScore,
      targetRole: activeProfile,
      breakdown,
      matchedSkills: matched,
      missingCoreSkills: missingCore,
      recommendedInDemandSkills: inDemand,
      tailoredBullets: activeProfile.tailoredBulletExamples,
      realLifeTips: activeProfile.realLifeAdvice,
      generalSuggestions: suggestions,
    })

    setLoading(false)
  }

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedBulletIdx(idx)
    setTimeout(() => setCopiedBulletIdx(null), 2500)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-semibold mb-4">
            <Zap size={15} /> Role-Specific ATS Intelligence
          </div>
          <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
            ATS Resume Checker & Skill Suggester
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto text-sm sm:text-base">
            Select your <span className="text-[var(--foreground)] font-semibold">Target Job Role</span>. Our AI benchmarks your resume against real-world ATS screening filters, identifies critical missing skills, and writes copy-paste bullets to maximize interview callbacks.
          </p>
        </div>

        {!result ? (
          <div className="space-y-8">
            {/* Step 1: Select Target Role */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                    Select Target Job Role
                  </h2>
                </div>
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  Required for real-life keyword matching
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 mb-4">
                {ATS_ROLE_PROFILES.map((profile) => {
                  const isSelected = !isCustomRole && selectedRoleId === profile.id
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(profile.id)
                        setIsCustomRole(false)
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border ${
                        isSelected
                          ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                          : "bg-[var(--muted)]/50 text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <Target size={14} className={isSelected ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} />
                      {profile.title}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setIsCustomRole(true)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border ${
                    isCustomRole
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--muted)]/50 text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  <Edit3 size={14} /> Custom Role…
                </button>
              </div>

              {isCustomRole && (
                <div className="mt-3 p-3.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Type your specific target role:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Cybersecurity Analyst, Mobile iOS Developer, AI Engineer..."
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                </div>
              )}

              {/* Selected Role Insight snippet */}
              <div className="mt-4 p-3 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]/70 flex items-start gap-3">
                <Sparkles size={16} className="text-[var(--primary)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  <span className="font-semibold text-[var(--foreground)]">Role Benchmark Active: </span>
                  {currentRoleProfile.overview}
                </p>
              </div>
            </div>

            {/* Step 2: Upload or Paste Resume */}
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <h2 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                        Provide Resume
                      </h2>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-[var(--muted)] p-1 rounded-lg border border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setActiveTab("file")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          activeTab === "file"
                            ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("text")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          activeTab === "text"
                            ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        Paste Text
                      </button>
                    </div>
                  </div>

                  {activeTab === "file" ? (
                    <div>
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
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                          drag
                            ? "border-[var(--primary)] bg-[var(--muted)] dark:bg-[var(--accent)]/30"
                            : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/40"
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
                        <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] flex items-center justify-center mx-auto mb-3">
                          {file ? (
                            <FileText size={26} className="text-[var(--primary)]" />
                          ) : (
                            <Upload size={26} className="text-[var(--muted-foreground)]" />
                          )}
                        </div>
                        {file ? (
                          <div>
                            <p className="font-semibold text-sm text-[var(--foreground)]">
                              {file.name}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              {(file.size / 1024).toFixed(0)} KB · Ready to benchmark against {currentRoleProfile.title}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-sm text-[var(--foreground)]">
                              Drop your resume here (PDF / DOCX)
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              or click to browse from device (max 5MB)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-between items-center text-xs">
                        <span className="text-[var(--muted-foreground)]">Don't have a PDF ready?</span>
                        <button
                          type="button"
                          onClick={fillSampleResume}
                          className="text-[var(--primary)] font-semibold hover:underline flex items-center gap-1"
                        >
                          <Sparkles size={12} /> Auto-fill candidate demo resume
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={9}
                        placeholder="Paste your resume content here (experience, technical skills, projects)..."
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] p-3 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
                      />
                      <div className="mt-2 flex justify-between items-center text-xs">
                        <button
                          type="button"
                          onClick={fillSampleResume}
                          className="text-[var(--primary)] font-semibold hover:underline"
                        >
                          Insert Sample Resume
                        </button>
                        {resumeText && (
                          <button
                            type="button"
                            onClick={() => setResumeText("")}
                            className="text-[var(--muted-foreground)] hover:text-red-500"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optional Job Description */}
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 flex items-center justify-between">
                      <span>Specific Job Posting / Description</span>
                      <span className="text-[var(--muted-foreground)] font-normal">Optional</span>
                    </label>
                    <textarea
                      value={jd}
                      onChange={(e) => setJD(e.target.value)}
                      rows={3}
                      placeholder="Paste the target job description if you have a specific opening in mind..."
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                    />
                  </div>

                  {/* Analyze Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mt-5 font-semibold text-sm shadow-md"
                    disabled={!file && !resumeText.trim()}
                    isLoading={loading}
                    onClick={analyze}
                  >
                    <Zap size={18} />
                    {loading
                      ? `Benchmarking against ${currentRoleProfile.title}…`
                      : `Analyze Resume for ${currentRoleProfile.title}`}
                  </Button>
                </div>
              </div>

              {/* Sidebar Guide */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
                  <h3 className="font-poppins font-bold text-sm text-[var(--foreground)] mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[var(--primary)]" />
                    How Role-Based ATS Works
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
                    Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo) do not score resumes uniformly. They compare incoming applications against hardcoded semantic dictionaries for each job title.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                      <p className="font-semibold text-[var(--foreground)] mb-1">
                        Must-Have Core Skills
                      </p>
                      <p className="text-[var(--muted-foreground)]">
                        Exact match keywords ATS parsers require to grant a passing score for {currentRoleProfile.title}.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                      <p className="font-semibold text-[var(--foreground)] mb-1">
                        Real-Life Actionable Suggestions
                      </p>
                      <p className="text-[var(--muted-foreground)]">
                        Tailored bullet points crafted with the Google XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-xs">
                      <p className="font-semibold text-[var(--foreground)] mb-1">
                        Competitive Edge Skills
                      </p>
                      <p className="text-[var(--muted-foreground)]">
                        In-demand tools that distinguish your application from hundreds of competing applicants.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Banner */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="flex justify-center">
                  <ScoreGauge score={result.score} />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-[var(--primary)]">
                        Target Role Evaluated
                      </span>
                      <h2 className="font-poppins font-bold text-2xl text-[var(--foreground)] flex items-center gap-2">
                        {result.targetRole.title}
                      </h2>
                    </div>
                    <Badge variant="primary" className="text-xs">
                      {result.targetRole.category}
                    </Badge>
                  </div>

                  {/* Breakdown Bars */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {result.breakdown.map((item) => (
                      <div key={item.label} className="bg-[var(--muted)]/30 p-2.5 rounded-xl border border-[var(--border)]/60">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[var(--foreground)] truncate pr-2">
                            {item.label}
                          </span>
                          <span className="font-bold text-[var(--foreground)] shrink-0">
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

            {/* Role-Based Skills Analysis (Matched vs Missing vs Recommended) */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Matched Skills */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                    Matched Role Skills ({result.matchedSkills.length})
                  </h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  Successfully recognized by ATS parsers for {result.targetRole.title}.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((sk) => (
                    <Badge key={sk} variant="success" className="text-xs">
                      ✓ {sk}
                    </Badge>
                  ))}
                  {result.matchedSkills.length === 0 && (
                    <span className="text-xs text-[var(--muted-foreground)] italic">
                      None detected yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Core Skills (Critical) */}
              <div className="bg-[var(--card)] rounded-2xl border border-red-500/30 p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-red-500" />
                  <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                    Critical Missing Skills ({result.missingCoreSkills.length})
                  </h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  <strong className="text-red-500">Action Required:</strong> Add these exact terms to pass preliminary ATS screening filters.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingCoreSkills.map((sk) => (
                    <Badge key={sk} variant="error" className="text-xs font-semibold">
                      + {sk}
                    </Badge>
                  ))}
                  {result.missingCoreSkills.length === 0 && (
                    <span className="text-xs text-emerald-600 font-medium">
                      All core skills detected!
                    </span>
                  )}
                </div>
              </div>

              {/* In-Demand Competitive Edge */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--primary)]/30 p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-[var(--primary)]" />
                  <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                    In-Demand Skills to Add
                  </h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  High-demand modern skills that place your resume in the top 5% of candidate rankings.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.recommendedInDemandSkills.map((sk) => (
                    <Badge key={sk} variant="primary" className="text-xs">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-Life Concrete Suggestions & Copyable Bullets */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                      Real-Life Bullet Points to Copy into Your Resume
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Specifically engineered for {result.targetRole.title} with high ATS keyword density and quantifiable metrics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {result.tailoredBullets.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] hover:border-[var(--primary)] transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                        {item.skill}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyBullet(item.bullet, idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
                      >
                        {copiedBulletIdx === idx ? (
                          <>
                            <Check size={13} className="text-emerald-500" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Bullet</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--foreground)] font-medium leading-relaxed bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] font-mono">
                      "{item.bullet}"
                    </p>

                    <p className="text-xs text-[var(--muted-foreground)] mt-2 flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--foreground)]">Why ATS Loves This:</span>
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Advice from Real Hiring Managers */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-poppins font-bold text-base text-[var(--foreground)] mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--primary)]" />
                Hiring Manager & ATS Strategic Insights for {result.targetRole.title}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.realLifeTips.map((tip, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)] mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {tip.title}
                      </h4>
                      <p className="text-xs text-[var(--foreground)] mb-2 leading-relaxed">
                        {tip.action}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[var(--border)]/70 text-[11px] text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--primary)]">ATS Impact: </span>
                      {tip.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setResumeText("")
                }}
              >
                Benchmark Another Role or Resume
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/resume-builder")}
                className="font-semibold flex items-center gap-2"
              >
                Apply Changes in Resume Builder
                <ArrowRight size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
