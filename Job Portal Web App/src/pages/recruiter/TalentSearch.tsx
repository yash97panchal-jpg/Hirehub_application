import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  CheckCircle,
  Mail,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import CustomSelect from "../../components/ui/CustomSelect"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

interface Candidate {
  id: string
  name: string
  headline: string
  location: string
  experience: string
  education: string
  atsScore: number
  skills: string[]
  about: string
  openToWork: boolean
  salaryExpectation: string
}

const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Alex Rivera",
    headline: "Senior Frontend Engineer | React 19, TypeScript, Next.js",
    location: "San Francisco, CA (Open to Remote)",
    experience: "5+ years",
    education: "B.S. in Computer Science, UC Berkeley",
    atsScore: 96,
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Zustand", "GraphQL"],
    about: "Passionate UI engineer with 5 years crafting scalable design systems and high-throughput web applications.",
    openToWork: true,
    salaryExpectation: "$150k - $175k",
  },
  {
    id: "cand-2",
    name: "Devon Chen",
    headline: "Fullstack Cloud Engineer | Node.js, Go, AWS, Docker",
    location: "New York, NY",
    experience: "4 years",
    education: "M.S. in Software Engineering, NYU",
    atsScore: 92,
    skills: ["Node.js", "Go", "AWS", "PostgreSQL", "Docker", "Kubernetes"],
    about: "Specialized in microservices architecture, serverless cloud functions, and database query optimization.",
    openToWork: true,
    salaryExpectation: "$140k - $160k",
  },
  {
    id: "cand-3",
    name: "Aanya Patel",
    headline: "Lead Product Designer | Figma, Design Systems, UX Research",
    location: "Bengaluru, India (Remote)",
    experience: "6 years",
    education: "B.Des in Interaction Design, NID",
    atsScore: 94,
    skills: ["Figma", "UI/UX", "User Research", "Wireframing", "Prototyping", "Design Systems"],
    about: "Built user journeys and enterprise design languages for top fintech and SaaS products globally.",
    openToWork: true,
    salaryExpectation: "$90k - $120k",
  },
  {
    id: "cand-4",
    name: "Marcus Aurelius Smith",
    headline: "AI & Machine Learning Engineer | PyTorch, LLMs, LangChain",
    location: "Austin, TX",
    experience: "3 years",
    education: "B.S. in Data Science, UT Austin",
    atsScore: 89,
    skills: ["Python", "PyTorch", "OpenAI API", "LangChain", "Vector DBs", "RAG"],
    about: "Focusing on enterprise generative AI pipelines, fine-tuning open source models and multi-agent systems.",
    openToWork: false,
    salaryExpectation: "$160k - $190k",
  },
  {
    id: "cand-5",
    name: "Sofia Rodriguez",
    headline: "DevOps & Platform Engineer | Terraform, CI/CD, Linux",
    location: "Berlin, Germany (Remote)",
    experience: "4 years",
    education: "B.Sc. in Computer Systems, TU Berlin",
    atsScore: 91,
    skills: ["Terraform", "GitHub Actions", "Docker", "Linux", "ArgoCD", "Prometheus"],
    about: "Automating cloud infrastructure, zero-downtime deployment pipelines, and observability monitoring.",
    openToWork: true,
    salaryExpectation: "$110k - $135k",
  },
]

export default function TalentSearch() {
  const [search, setSearch] = useState("")
  const [selectedExp, setSelectedExp] = useState("All")
  const [selectedSkill, setSelectedSkill] = useState("All")
  const [invitedIds, setInvitedIds] = useState<string[]>([])

  const allSkills = ["All", "React", "TypeScript", "Node.js", "Python", "AWS", "Figma", "Docker"]

  const filtered = mockCandidates.filter((cand) => {
    const query = search.toLowerCase()
    const matchesSearch =
      cand.name.toLowerCase().includes(query) ||
      cand.headline.toLowerCase().includes(query) ||
      cand.location.toLowerCase().includes(query) ||
      cand.skills.some((s) => s.toLowerCase().includes(query))

    const matchesExp = selectedExp === "All" || cand.experience.includes(selectedExp)
    const matchesSkill = selectedSkill === "All" || cand.skills.includes(selectedSkill)

    return matchesSearch && matchesExp && matchesSkill
  })

  const handleInvite = (candidate: Candidate) => {
    if (invitedIds.includes(candidate.id)) {
      toast("Invitation already sent to this candidate.")
      return
    }
    setInvitedIds([...invitedIds, candidate.id])
    toast.success(`Exclusive job invitation dispatched to ${candidate.name}!`)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5 mb-1">
              <Sparkles size={14} /> HireHub Candidate Sourcing & Talent Pool
            </span>
            <h1 className="font-poppins text-3xl font-extrabold text-[var(--foreground)]">
              Talent Database & Candidate Search
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Directly discover, filter, and invite top pre-vetted engineers and designers.
            </p>
          </div>
          <Link to="/recruiter/post-job">
            <Button variant="primary" size="md">
              + Post New Job Opening
            </Button>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[var(--card)] p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-sm mb-8 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search by candidate name, skill (e.g. React, Python), location, or job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--border)] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--muted-foreground)]">Experience:</span>
              {["All", "3 years", "4 years", "5+ years"].map((exp) => (
                <button
                  key={exp}
                  onClick={() => setSelectedExp(exp)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedExp === exp
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <span className="font-semibold text-xs text-[var(--muted-foreground)]">Skill Filter:</span>
              <CustomSelect
                value={selectedSkill}
                onChange={(val) => setSelectedSkill(String(val))}
                options={allSkills}
                size="sm"
                className="w-44"
              />
            </div>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cand) => {
            const isInvited = invitedIds.includes(cand.id)
            return (
              <motion.div
                key={cand.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm hover:border-[var(--primary)]/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-1.5">
                          {cand.name}
                          {cand.openToWork && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Open to Work" />
                          )}
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {cand.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant={cand.atsScore > 90 ? "success" : "default"} size="sm">
                      {cand.atsScore}% Match
                    </Badge>
                  </div>

                  <p className="text-xs font-medium text-[var(--primary)] mb-2">
                    {cand.headline}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
                    {cand.about}
                  </p>

                  <div className="space-y-1.5 text-xs text-[var(--muted-foreground)] mb-4 pb-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={13} className="text-[var(--primary)] shrink-0" />
                      <span>Experience: {cand.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-[var(--primary)] shrink-0" />
                      <span className="truncate">{cand.education}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cand.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--muted)] text-[var(--foreground)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant={isInvited ? "secondary" : "primary"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleInvite(cand)}
                  >
                    {isInvited ? "✓ Invitation Sent" : "Invite to Apply"}
                  </Button>
                  <Link to="/messages">
                    <Button variant="outline" size="sm" className="px-2.5" title="Message Candidate">
                      <Mail size={14} />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-[var(--card)] rounded-2xl border border-[var(--border)] mt-4">
            <Search size={40} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-30" />
            <h3 className="font-bold text-base text-[var(--foreground)]">No candidates found</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Try broadening your keyword search or resetting the skill filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
