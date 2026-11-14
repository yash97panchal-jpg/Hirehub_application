import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  X,
  RotateCcw,
  Briefcase,
  Building2,
  Wand2,
} from "lucide-react"
import Button from "../ui/Button"
import { useAuthStore } from "../../store/authStore"
import toast from "react-hot-toast"

interface AICoverLetterModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle?: string
  companyName?: string
  jobDescription?: string
}

export default function AICoverLetterModal({
  isOpen,
  onClose,
  jobTitle = "Senior Software Engineer",
  companyName = "Technology Solutions",
  jobDescription = "",
}: AICoverLetterModalProps) {
  const { user } = useAuthStore()

  const [role, setRole] = useState(jobTitle)
  const [company, setCompany] = useState(companyName)
  const [tone, setTone] = useState<"confident" | "enthusiastic" | "executive" | "concise">("confident")
  const [focusArea, setFocusArea] = useState<"technical" | "leadership" | "culture">("technical")
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const candidateName = user?.name || "Candidate"
  const candidateSkills = (user?.skills && user.skills.length > 0)
    ? user.skills.slice(0, 4).join(", ")
    : "React, TypeScript, Node.js, Cloud Architecture"

  const generateCoverLetter = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const today = new Date().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      const toneIntros = {
        confident: `I am writing with great enthusiasm to express my interest in the ${role} position at ${company}. With a demonstrated track record of architecting scalable applications and driving technical excellence, I am confident in my ability to deliver immediate value to your engineering team.`,
        enthusiastic: `I was thrilled to see the opening for ${role} at ${company}! Having followed your team's innovative trajectory and user-centric approach, I could not imagine a more compelling environment to apply my passion for engineering and product craft.`,
        executive: `As an experienced software leader specializing in high-throughput distributed systems, I am pleased to submit my application for the ${role} position at ${company}. Throughout my career, I have focused on aligning engineering execution with strategic company objectives.`,
        concise: `I am writing to apply for the ${role} position at ${company}. With deep expertise across modern web engineering (${candidateSkills}), I am prepared to contribute from day one.`,
      }

      const bodyTechnical = `In my previous work, I have specialized in building robust software solutions utilizing ${candidateSkills}. I have engineered resilient APIs, optimized client performance to achieve 95+ Web Vitals, and collaborated closely with cross-functional product teams to deliver complex features on accelerated timelines. Your emphasis on high code quality and engineering velocity closely matches my daily practices.`

      const bodyLeadership = `Beyond technical implementation, I pride myself on mentoring colleagues, fostering an inclusive code review culture, and driving architectural decisions that balance speed with long-term maintainability. At ${company}, I look forward to partnering with your talented engineers to elevate team standards and accelerate product delivery.`

      const bodyCulture = `What excites me most about ${company} is your dedication to customer impact and transparent collaboration. I thrive in mission-driven cultures where engineers are encouraged to innovate boldly and take ownership of user problems end-to-end.`

      const selectedBody =
        focusArea === "technical"
          ? bodyTechnical
          : focusArea === "leadership"
            ? `${bodyTechnical}\n\n${bodyLeadership}`
            : `${bodyTechnical}\n\n${bodyCulture}`

      const closing = `Thank you for your time and consideration. I would welcome the opportunity to discuss how my technical experience, problem-solving mindset, and dedication can help ${company} achieve its next phase of growth.\n\nSincerely,\n${candidateName}\n${user?.email || "candidate@hirehub.app"}\n${user?.phone || "+1 (555) 019-2834"}`

      const fullLetter = `${today}\n\nHiring Team\n${company}\n\nDear Hiring Committee,\n\n${toneIntros[tone]}\n\n${selectedBody}\n\n${closing}`

      setGeneratedLetter(fullLetter)
      setIsGenerating(false)
      toast.success("AI tailored cover letter generated!")
    }, 600)
  }

  const handleCopy = () => {
    if (!generatedLetter) return
    navigator.clipboard.writeText(generatedLetter)
    setCopied(true)
    toast.success("Cover letter copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!generatedLetter) return
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Cover_Letter_${company.replace(/\s+/g, "_")}_${role.replace(/\s+/g, "_")}.txt`
    link.click()
    toast.success("Cover letter downloaded!")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-[#F7941D] flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-[var(--foreground)]">
                AI Cover Letter Assistant
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Generate a personalized, ATS-friendly cover letter in seconds.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Target Job Title
              </label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Company Name
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          {/* Tone & Focus Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                Letter Tone
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["confident", "enthusiastic", "executive", "concise"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
                      tone === t
                        ? "bg-[var(--primary)] text-white shadow-xs"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                Key Emphasis
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "technical", label: "Technical Skills" },
                  { id: "leadership", label: "Team & Leadership" },
                  { id: "culture", label: "Culture & Values" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFocusArea(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                      focusArea === f.id
                        ? "bg-[var(--primary)] text-white shadow-xs"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            variant="primary"
            onClick={generateCoverLetter}
            isLoading={isGenerating}
            className="w-full font-bold text-xs"
          >
            <Wand2 size={15} className="mr-2" />
            {generatedLetter ? "Regenerate Cover Letter" : "Generate Tailored Cover Letter"}
          </Button>

          {/* Output Display */}
          {generatedLetter && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]">Generated Letter Preview:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
                    {copied ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs">
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <textarea
                rows={10}
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] font-mono leading-relaxed focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
