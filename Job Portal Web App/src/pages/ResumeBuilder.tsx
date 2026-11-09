import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Mail,
  Phone,
  MapPin,
  Link2,
  Globe,
  Briefcase,
  GraduationCap,
  Wrench,
  FileText,
  RotateCcw,
  Eye,
  Edit3,
  Award,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { useAuthStore } from "../store/authStore"

interface Experience {
  id: string
  company: string
  role: string
  dates: string
  location?: string
  description: string
}

interface Education {
  id: string
  school: string
  degree: string
  dates: string
  location?: string
  gpa?: string
}

const SAMPLE_RESUME = {
  personal: {
    name: "Alex Rivera",
    title: "Senior Full Stack & Frontend Engineer",
    email: "alex.rivera@hirehub.app",
    phone: "+1 (415) 890-2341",
    location: "San Francisco, CA (Open to Remote)",
    linkedin: "linkedin.com/in/alexrivera-dev",
    website: "alexrivera.dev",
    summary:
      "Results-driven Senior Software Engineer with 6+ years of experience architecting high-performance web applications, distributed systems, and real-time user experiences. Proven track record reducing load times by 42% and scaling platforms to 1.5M+ active users using React, TypeScript, and Node.js.",
  },
  experience: [
    {
      id: "exp-1",
      company: "Stripe",
      role: "Senior Frontend Engineer",
      dates: "2022 - Present",
      location: "San Francisco, CA",
      description:
        "• Spearheaded the redesign of the core customer dashboard in React 19 and Next.js, boosting user engagement by 35%.\n• Architected reusable component library used by 24 engineers across 5 squads, enforcing 100% TypeScript type safety.\n• Optimized Web Vitals and client bundle size, improving Lighthouse performance score from 68 to 98.",
    },
    {
      id: "exp-2",
      company: "Cloudflare",
      role: "Full Stack Software Engineer",
      dates: "2019 - 2022",
      location: "Austin, TX",
      description:
        "• Engineered REST & GraphQL APIs handling 12,000+ requests/sec using Node.js, Express, and PostgreSQL.\n• Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time by 60%.\n• Mentored 4 junior engineers through code reviews and bi-weekly architecture brown bags.",
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science & Engineering",
      dates: "2015 - 2019",
      location: "Berkeley, CA",
      gpa: "3.85 GPA · Magna Cum Laude",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "GraphQL",
    "PostgreSQL",
    "Docker",
    "AWS",
    "System Design",
    "Git",
    "REST APIs",
  ],
}

const POPULAR_SKILL_SUGGESTIONS = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Tailwind CSS",
  "Python",
  "AWS",
  "Docker",
  "PostgreSQL",
  "GraphQL",
  "Git",
  "Figma",
  "System Design",
  "Agile",
]

const SUMMARY_TEMPLATES = [
  {
    role: "Frontend Engineer",
    text: "Passionate Frontend Developer with 4+ years of experience specializing in React, TypeScript, and responsive design systems. Dedicated to crafting pixel-perfect, accessible, and high-performance digital products.",
  },
  {
    role: "Full Stack Engineer",
    text: "Versatile Full Stack Engineer with expertise in modern JavaScript frameworks, distributed backend architectures, and relational databases. Strong background in microservices and scalable cloud solutions.",
  },
  {
    role: "Product Manager",
    text: "Data-informed Product Manager experienced in guiding cross-functional teams from ideation to delivery. Proven success boosting product adoption and driving revenue growth through user-centric roadmaps.",
  },
]

export default function ResumeBuilder() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [personal, setPersonal] = useState(SAMPLE_RESUME.personal)
  const [experience, setExperience] = useState<Experience[]>(SAMPLE_RESUME.experience)
  const [education, setEducation] = useState<Education[]>(SAMPLE_RESUME.education)
  const [skillsList, setSkillsList] = useState<string[]>(SAMPLE_RESUME.skills)
  const [skillsInput, setSkillsInput] = useState("")

  const [template, setTemplate] = useState<"modern" | "executive" | "creative" | "minimal">("modern")
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor")
  const [activeSection, setActiveSection] = useState<"personal" | "experience" | "education" | "skills">("personal")

  // Load user data or saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("hirehub_resume_draft")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.personal) setPersonal(parsed.personal)
        if (parsed.experience) setExperience(parsed.experience)
        if (parsed.education) setEducation(parsed.education)
        if (parsed.skillsList) setSkillsList(parsed.skillsList)
        if (parsed.template) setTemplate(parsed.template)
        return
      } catch (e) {
        // Fallback to default sample
      }
    }

    if (user && user.name) {
      setPersonal((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        linkedin: user.linkedin || prev.linkedin,
        summary: user.about || user.headline || prev.summary,
      }))
      if (user.skills && user.skills.length > 0) {
        setSkillsList(user.skills)
      }
    }
  }, [user])

  const handleSaveDraft = () => {
    localStorage.setItem(
      "hirehub_resume_draft",
      JSON.stringify({ personal, experience, education, skillsList, template }),
    )
    toast.success("Resume draft saved successfully!")
  }

  const handleLoadSample = () => {
    setPersonal(SAMPLE_RESUME.personal)
    setExperience(SAMPLE_RESUME.experience)
    setEducation(SAMPLE_RESUME.education)
    setSkillsList(SAMPLE_RESUME.skills)
    toast.success("Sample resume loaded!")
  }

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the resume fields?")) {
      setPersonal({
        name: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        website: "",
        summary: "",
      })
      setExperience([])
      setEducation([])
      setSkillsList([])
      toast("Resume cleared. Fill in your details or click 'Load Sample'.")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Experience handlers
  const addExperience = () => {
    const newExp: Experience = {
      id: "exp-" + Date.now(),
      company: "",
      role: "",
      dates: "",
      location: "",
      description: "",
    }
    setExperience([...experience, newExp])
    toast.success("New experience position added")
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const removeExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id))
    toast("Experience removed")
  }

  // Education handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: "edu-" + Date.now(),
      school: "",
      degree: "",
      dates: "",
      location: "",
      gpa: "",
    }
    setEducation([...education, newEdu])
    toast.success("New education entry added")
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id))
    toast("Education removed")
  }

  // Skills handlers
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (!trimmed) return
    if (!skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed])
    }
    setSkillsInput("")
  }

  const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddSkill(skillsInput)
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter((s) => s !== skill))
  }

  // Parse multiline description into clean bullet points
  const renderBulletPoints = (text: string, dotColor: string = "bg-[var(--primary)]") => {
    if (!text) return null
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    return (
      <ul className="space-y-1.5 mt-2 text-xs leading-relaxed text-gray-700">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-\*]\s*/, "")
          return (
            <li key={idx} className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 mt-1.5`} />
              <span>{cleanLine}</span>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-16 print:pt-0 print:pb-0 print:bg-white text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 print:px-0 print:max-w-none">
        {/* TOP BAR / CONTROLS (Hidden during printing) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 print:hidden bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} className="mr-1.5" /> Back
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] leading-tight tracking-tight">
                AI Resume Builder
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">
                Structured ATS-compliant resume formatting
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Template / Format selector - Full width on phone with smooth horizontal scroll so it never spills out of screen */}
            <div className="w-full sm:w-auto flex items-center gap-1 bg-[var(--muted)] p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase px-2 shrink-0">
                Format:
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { id: "modern", label: "Modern ATS" },
                  { id: "executive", label: "Executive" },
                  { id: "creative", label: "Creative" },
                  { id: "minimal", label: "Minimal" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all shrink-0 text-xs font-medium ${
                      template === t.id
                        ? "bg-[var(--card)] text-[var(--primary)] font-bold shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={handleLoadSample}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-xs font-medium text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                title="Fill with high-scoring sample engineer resume"
              >
                <Sparkles size={13} className="text-[var(--primary)]" />
                Sample
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-xs text-[var(--muted-foreground)] hover:text-red-500 transition-colors shrink-0"
                title="Clear all fields"
              >
                <RotateCcw size={14} />
              </button>

              <Button variant="outline" size="sm" onClick={handleSaveDraft} className="flex-1 sm:flex-initial">
                <Save size={14} className="mr-1.5" /> Save
              </Button>

              <Button variant="primary" size="sm" onClick={handlePrint} className="flex-1 sm:flex-initial font-bold">
                <Printer size={14} className="mr-1.5" /> Print / PDF
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW TOGGLE (Editor vs Preview) */}
        <div className="flex lg:hidden mb-4 p-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] print:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              mobileTab === "editor" ? "bg-[var(--card)] text-[var(--primary)] shadow-sm" : "text-[var(--muted-foreground)]"
            }`}
          >
            <Edit3 size={14} /> Edit Information
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              mobileTab === "preview" ? "bg-[var(--card)] text-[var(--primary)] shadow-sm" : "text-[var(--muted-foreground)]"
            }`}
          >
            <Eye size={14} /> Live Resume Preview
          </button>
        </div>

        {/* MAIN SPLIT WORKSPACE: Form Editor (Left) & Real Document Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:gap-0">
          {/* ============================================================= */}
          {/* LEFT: Structured Information Editor Form                     */}
          {/* ============================================================= */}
          <div
            className={`lg:col-span-5 space-y-6 print:hidden ${
              mobileTab === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Section Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm text-xs font-semibold">
              {[
                { id: "personal", label: "Personal", icon: FileText },
                { id: "experience", label: "Experience", icon: Briefcase },
                { id: "education", label: "Education", icon: GraduationCap },
                { id: "skills", label: "Skills", icon: Wrench },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    activeSection === tab.id
                      ? "bg-[var(--primary)] text-[#180C22] font-bold shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <tab.icon size={15} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: Personal & Contact Details */}
            {activeSection === "personal" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <h2 className="font-poppins font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                    <FileText size={17} className="text-[var(--primary)]" />
                    Personal & Contact Info
                  </h2>
                  <span className="text-[10px] text-[var(--muted-foreground)]">Step 1 of 4</span>
                </div>

                <div className="space-y-3.5">
                  <Input
                    label="Full Name"
                    value={personal.name}
                    onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                    placeholder="e.g. Alex Rivera"
                  />

                  <Input
                    label="Professional Title / Headline"
                    value={personal.title}
                    onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Email Address"
                      type="email"
                      value={personal.email}
                      onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                      placeholder="alex@hirehub.app"
                    />
                    <Input
                      label="Phone Number"
                      value={personal.phone}
                      onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Location (City, Country)"
                      value={personal.location}
                      onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                    <Input
                      label="LinkedIn Profile"
                      value={personal.linkedin}
                      onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>

                  <Input
                    label="Website / Portfolio (Optional)"
                    value={personal.website}
                    onChange={(e) => setPersonal({ ...personal, website: e.target.value })}
                    placeholder="myportfolio.dev"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[var(--foreground)]">
                        Professional Summary
                      </label>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        High-scoring ATS pitch
                      </span>
                    </div>

                    {/* Pre-fill Summary template dropdown */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="text-[10px] text-[var(--muted-foreground)] self-center">
                        Templates:
                      </span>
                      {SUMMARY_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.role}
                          type="button"
                          onClick={() => setPersonal({ ...personal, summary: tmpl.text })}
                          className="px-2 py-0.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white text-[10px] text-[var(--foreground)] transition-colors border border-[var(--border)]"
                        >
                          + {tmpl.role}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={4}
                      value={personal.summary}
                      onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] leading-relaxed resize-none"
                      placeholder="Write 2-3 impactful sentences highlighting your core engineering achievements, years of experience, and key technical proficiencies..."
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="primary" size="sm" onClick={() => setActiveSection("experience")}>
                    Next: Work Experience →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Work Experience Details */}
            {activeSection === "experience" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <h2 className="font-poppins font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                      <Briefcase size={17} className="text-[var(--primary)]" />
                      Work Experience ({experience.length})
                    </h2>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                      Start lines with • or - to create crisp bullet points
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addExperience}>
                    <Plus size={14} className="mr-1" /> Add Position
                  </Button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--primary)]">
                          Position #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete position"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          label="Company Name"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          placeholder="Acme Corp"
                        />
                        <Input
                          label="Job Role / Title"
                          value={exp.role}
                          onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                          placeholder="Senior Developer"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          label="Dates Active"
                          value={exp.dates}
                          onChange={(e) => updateExperience(exp.id, "dates", e.target.value)}
                          placeholder="2022 - Present"
                        />
                        <Input
                          label="Location"
                          value={exp.location || ""}
                          onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                          placeholder="San Francisco, CA or Remote"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[var(--foreground)] mb-1 block">
                          Key Responsibilities & Measurable Impact
                        </label>
                        <textarea
                          rows={4}
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y leading-relaxed"
                          placeholder="• Led development of core React features resulting in 28% higher retention&#10;• Optimized API latency by 140ms through Redis caching&#10;• Mentored 3 engineers and conducted sprint planning"
                        />
                      </div>
                    </div>
                  ))}

                  {experience.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/20">
                      <p className="text-xs text-[var(--muted-foreground)] mb-2">No work positions added yet.</p>
                      <Button variant="outline" size="sm" onClick={addExperience}>
                        <Plus size={14} className="mr-1" /> Add Your First Experience
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setActiveSection("personal")}>
                    ← Personal Info
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setActiveSection("education")}>
                    Next: Education →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Education Details */}
            {activeSection === "education" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <h2 className="font-poppins font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                      <GraduationCap size={17} className="text-[var(--primary)]" />
                      Education & Degrees ({education.length})
                    </h2>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                      Academic background, university, and certifications
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addEducation}>
                    <Plus size={14} className="mr-1" /> Add Degree
                  </Button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {education.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--primary)]">
                          Degree #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete education"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <Input
                        label="School / University"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        placeholder="e.g. UC Berkeley, MIT, Stanford"
                      />

                      <Input
                        label="Degree & Major"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        placeholder="e.g. B.S. in Computer Science"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          label="Graduation Years"
                          value={edu.dates}
                          onChange={(e) => updateEducation(edu.id, "dates", e.target.value)}
                          placeholder="e.g. 2016 - 2020"
                        />
                        <Input
                          label="Honors / GPA / Location"
                          value={edu.gpa || ""}
                          onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                          placeholder="e.g. 3.9 GPA, Magna Cum Laude"
                        />
                      </div>
                    </div>
                  ))}

                  {education.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/20">
                      <p className="text-xs text-[var(--muted-foreground)] mb-2">No education entries added.</p>
                      <Button variant="outline" size="sm" onClick={addEducation}>
                        <Plus size={14} className="mr-1" /> Add Education
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setActiveSection("experience")}>
                    ← Work Experience
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setActiveSection("skills")}>
                    Next: Skills & Tools →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Skills & Core Competencies */}
            {activeSection === "skills" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-sm space-y-4"
              >
                <div className="pb-3 border-b border-[var(--border)]">
                  <h2 className="font-poppins font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                    <Wrench size={17} className="text-[var(--primary)]" />
                    Skills & Technical Competencies ({skillsList.length})
                  </h2>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                    ATS scanners extract keywords directly from this section
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)] mb-1.5 block">
                    Add New Skill (Press Enter or Comma)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={handleKeyDownSkill}
                      placeholder="e.g. Docker, Kubernetes, Next.js..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <Button variant="primary" size="sm" onClick={() => handleAddSkill(skillsInput)}>
                      <Plus size={14} /> Add
                    </Button>
                  </div>
                </div>

                {/* Popular Skill Suggestions */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-2">
                    Quick Add Popular Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                      const isAdded = skillsList.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => (!isAdded ? handleAddSkill(skill) : handleRemoveSkill(skill))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                            isAdded
                              ? "bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)] font-bold"
                              : "bg-[var(--muted)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          {isAdded ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Current Skills Badge List */}
                <div>
                  <span className="text-xs font-bold text-[var(--foreground)] block mb-2">
                    Active Skills on Resume:
                  </span>
                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] min-h-[70px]">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] shadow-xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-[var(--muted-foreground)] hover:text-red-500 font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {skillsList.length === 0 && (
                      <span className="text-xs text-[var(--muted-foreground)] self-center">
                        No skills added yet. Click any pill above to add.
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setActiveSection("education")}>
                    ← Education
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleSaveDraft()
                      setMobileTab("preview")
                    }}
                  >
                    View Final Preview →
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ============================================================= */}
          {/* RIGHT: High-Standard Document Preview (Live A4 Paper Sheet)   */}
          {/* ============================================================= */}
          <div
            className={`lg:col-span-7 print:col-span-12 ${
              mobileTab === "editor" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Real Paper Container */}
            <div className="bg-neutral-800/20 dark:bg-black/30 p-2 sm:p-6 rounded-3xl border border-[var(--border)] shadow-inner overflow-x-auto">
              <div
                id="printable-resume"
                className={`bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 md:p-12 transition-all w-full min-h-[900px] border border-slate-200 select-text ${
                  template === "creative"
                    ? "border-t-[10px] border-amber-500"
                    : template === "executive"
                      ? "border-l-[10px] border-slate-800 font-serif"
                      : template === "minimal"
                        ? "border-none"
                        : "border-t-[8px] border-indigo-600"
                }`}
                style={{
                  fontFamily:
                    template === "executive"
                      ? "Georgia, Cambria, 'Times New Roman', serif"
                      : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {/* 1. DOCUMENT HEADER (Applicant Identity & Verified Contacts) */}
                <div
                  className={`pb-5 mb-5 border-b ${
                    template === "creative"
                      ? "border-amber-200 text-left"
                      : template === "executive"
                        ? "border-slate-300 text-center"
                        : template === "minimal"
                          ? "border-slate-200 text-left"
                          : "border-slate-200 text-left"
                  }`}
                >
                  <h1
                    className={`font-black tracking-tight leading-tight mb-1 ${
                      template === "executive"
                        ? "text-3xl sm:text-4xl text-slate-900 uppercase"
                        : template === "creative"
                          ? "text-3xl sm:text-4xl text-amber-600"
                          : "text-2xl sm:text-3xl text-slate-950 font-poppins"
                    }`}
                  >
                    {personal.name || "Your Full Name"}
                  </h1>

                  {personal.title && (
                    <p
                      className={`text-sm sm:text-base font-semibold mb-3 ${
                        template === "creative"
                          ? "text-amber-700"
                          : template === "executive"
                            ? "text-slate-600 tracking-wider uppercase text-xs"
                            : "text-indigo-600"
                      }`}
                    >
                      {personal.title}
                    </p>
                  )}

                  {/* Clean Contact Metadata Strip with Icons */}
                  <div
                    className={`flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 mt-2 ${
                      template === "executive" ? "justify-center" : "justify-start"
                    }`}
                  >
                    {personal.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span>{personal.email}</span>
                      </span>
                    )}
                    {personal.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{personal.phone}</span>
                      </span>
                    )}
                    {personal.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{personal.location}</span>
                      </span>
                    )}
                    {personal.linkedin && (
                      <span className="flex items-center gap-1">
                        <Link2 size={12} className="text-blue-600 shrink-0" />
                        <span>{personal.linkedin}</span>
                      </span>
                    )}
                    {personal.website && (
                      <span className="flex items-center gap-1">
                        <Globe size={12} className="text-emerald-600 shrink-0" />
                        <span>{personal.website}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. PROFESSIONAL SUMMARY */}
                {personal.summary && (
                  <div className="mb-6">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        template === "creative"
                          ? "text-amber-700 flex items-center gap-1.5"
                          : template === "executive"
                            ? "text-slate-800 border-b border-slate-300 pb-1"
                            : "text-slate-900 border-b border-slate-200 pb-1"
                      }`}
                    >
                      Professional Summary
                    </h2>
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                      {personal.summary}
                    </p>
                  </div>
                )}

                {/* 3. WORK EXPERIENCE SECTION */}
                {experience.length > 0 && (
                  <div className="mb-6">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                        template === "creative"
                          ? "text-amber-700 flex items-center gap-1.5"
                          : template === "executive"
                            ? "text-slate-800 border-b border-slate-300 pb-1"
                            : "text-slate-900 border-b border-slate-200 pb-1"
                      }`}
                    >
                      Professional Experience
                    </h2>

                    <div className="space-y-4">
                      {experience.map((exp) => (
                        <div key={exp.id} className="text-left">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {exp.role || "Job Title"}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                              {exp.dates}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
                            <span>{exp.company || "Company"}</span>
                            {exp.location && (
                              <>
                                <span>•</span>
                                <span className="font-normal text-slate-500">{exp.location}</span>
                              </>
                            )}
                          </div>

                          {/* Bullet formatting */}
                          {renderBulletPoints(
                            exp.description,
                            template === "creative"
                              ? "bg-amber-500"
                              : template === "executive"
                                ? "bg-slate-700"
                                : "bg-indigo-600",
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. EDUCATION SECTION */}
                {education.length > 0 && (
                  <div className="mb-6">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                        template === "creative"
                          ? "text-amber-700 flex items-center gap-1.5"
                          : template === "executive"
                            ? "text-slate-800 border-b border-slate-300 pb-1"
                            : "text-slate-900 border-b border-slate-200 pb-1"
                      }`}
                    >
                      Education & Credentials
                    </h2>

                    <div className="space-y-3">
                      {education.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {edu.degree || "Degree Name"}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                              {edu.dates}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span className="font-medium">{edu.school || "University"}</span>
                            {edu.gpa && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{edu.gpa}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. SKILLS & TECHNICAL PROFICIENCIES SECTION */}
                {skillsList.length > 0 && (
                  <div>
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${
                        template === "creative"
                          ? "text-amber-700 flex items-center gap-1.5"
                          : template === "executive"
                            ? "text-slate-800 border-b border-slate-300 pb-1"
                            : "text-slate-900 border-b border-slate-200 pb-1"
                      }`}
                    >
                      Skills & Technical Competencies
                    </h2>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skillsList.map((skill) => (
                        <span
                          key={skill}
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                            template === "creative"
                              ? "bg-amber-50 text-amber-900 border border-amber-200"
                              : template === "executive"
                                ? "bg-slate-100 text-slate-900 border border-slate-300"
                                : "bg-slate-100 text-slate-800 border border-slate-200"
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
