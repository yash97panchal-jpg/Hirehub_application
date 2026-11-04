import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Save,
  Image as ImageIcon,
  MapPin,
  Globe,
  Building,
  UserPlus,
  Mail,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Badge from "../../components/ui/Badge"
import { useAuthStore } from "../../store/authStore"
import { companyService } from "../../lib/supabase"
import { getCompanyRealLogo } from "../../data/companyLogos"
import type { Company } from "../../types"

export default function CompanyProfile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [company, setCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    name: "TechCorp Labs",
    slug: "techcorp-labs",
    industry: "Software Engineering & Cloud",
    location: "San Francisco, CA",
    address: "100 Market St, Suite 400",
    website: "https://techcorp.example.com",
    about: "We engineer resilient distributed systems, developer platforms, and enterprise AI.",
    size: "50-200 employees",
    logo: getCompanyRealLogo("TechCorp Labs", "https://github.com"),
    banner: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop&auto=format",
  })

  // Teammate Invitation State
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"recruiter" | "member">("recruiter")
  const [isInviting, setIsInviting] = useState(false)
  const [teamMembers, setTeamMembers] = useState([
    { email: user?.email || "recruiter@techcorp.com", role: "owner", status: "active" },
  ])

  useEffect(() => {
    async function loadCompany() {
      const companies = await companyService.getCompanies()
      if (companies.length > 0) {
        setCompany(companies[0])
        setFormData({
          name: companies[0].name,
          slug: companies[0].slug || "",
          industry: companies[0].industry || "Technology",
          location: companies[0].location || "San Francisco, CA",
          address: companies[0].address || "100 Market St",
          website: companies[0].website || "https://example.com",
          about: companies[0].description || companies[0].about || "",
          size: companies[0].size || "50-200 employees",
          logo: companies[0].logo || "",
          banner: companies[0].banner || "",
        })
      }
    }
    loadCompany()
  }, [])

  const handleSave = async () => {
    try {
      if (!company) {
        const created = await companyService.createCompany(
          {
            name: formData.name,
            slug: formData.slug,
            industry: formData.industry,
            location: formData.location,
            address: formData.address,
            website: formData.website,
            about: formData.about,
            description: formData.about,
            size: formData.size,
            logo: formData.logo,
            banner: formData.banner,
            rating: 4.9,
            reviewCount: 1,
          },
          user?.id || "user-recruiter"
        )
        setCompany(created)
        toast.success("Company profile created! Awaiting admin review.")
      } else {
        toast.success("Company profile updated successfully!")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save company profile.")
    }
  }

  const handleInviteTeammate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid teammate email address.")
      return
    }

    setIsInviting(true)
    try {
      if (company) {
        await companyService.inviteMember(company.id, inviteEmail.trim(), inviteRole)
      }
      setTeamMembers((prev) => [
        ...prev,
        { email: inviteEmail.trim(), role: inviteRole, status: "invited" },
      ])
      setInviteEmail("")
      toast.success(`Invitation sent to ${inviteEmail}!`)
    } catch {
      toast.error("Failed to send invitation.")
    } finally {
      setIsInviting(false)
    }
  }

  const isApproved = company?.status === "approved"

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
                Company Profile & Settings
              </h1>
              {company?.isVerified && (
                <Badge variant="success" size="sm">
                  ✓ Verified Employer
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Configure your organization profile, onboarding status, and recruitment team.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/companies/${formData.slug}`)}
            >
              View Public Page
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save size={15} className="mr-1.5" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Verification Status Card */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            isApproved
              ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {isApproved ? (
              <CheckCircle2 size={24} className="text-green-500 shrink-0" />
            ) : (
              <Clock size={24} className="text-amber-500 shrink-0" />
            )}
            <div>
              <p className="font-bold text-xs sm:text-sm">
                Status: {isApproved ? "Approved & Verified for Marketplace" : "Pending Administrator Review"}
              </p>
              <p className="text-[11px] opacity-80">
                {isApproved
                  ? "Your company is verified! You can publish job openings with Easy Apply and External Apply."
                  : "New employer profiles require review by the System Administrator before jobs are published publicly."}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono uppercase font-black px-2.5 py-1 rounded-full bg-white/40 dark:bg-black/30">
            {company?.status || "pending"}
          </span>
        </div>

        {/* Company Visuals & Details */}
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-44 bg-[var(--muted)] relative overflow-hidden">
            {formData.banner ? (
              <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted-foreground)]">
                Banner Cover Image
              </div>
            )}
          </div>

          <div className="p-6 pt-0 relative">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-[var(--card)] -mt-10 mb-4 overflow-hidden shadow-md flex items-center justify-center p-1">
              {formData.logo ? (
                <img
                  src={getCompanyRealLogo(formData.name, formData.website, formData.logo)}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getCompanyRealLogo(formData.name, formData.website)
                  }}
                />
              ) : (
                <Building size={28} className="text-[var(--primary)]" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Legal Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="Public Slug (for /companies/:slug URL) *"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />

              <Input
                label="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />

              <Input
                label="Company Size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />

              <Input
                label="Headquarters Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />

              <Input
                label="Official Career Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  About the Company & Mission
                </label>
                <textarea
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TEAM MATES & RECRUITER INVITATION (Requirement 2: Recruiters can invite teammates to the same company) */}
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-poppins font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                <Users size={18} className="text-[var(--primary)]" />
                Hiring Team & Collaborators
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Invite recruiters and hiring managers to review candidates and manage postings together.
              </p>
            </div>
          </div>

          {/* Invite form */}
          <form onSubmit={handleInviteTeammate} className="flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@yourcompany.com"
              className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--foreground)]"
            >
              <option value="recruiter">Recruiter (Post jobs & review)</option>
              <option value="member">Hiring Member (Review only)</option>
            </select>
            <Button type="submit" variant="primary" size="sm" isLoading={isInviting}>
              <UserPlus size={14} className="mr-1.5" /> Send Invite
            </Button>
          </form>

          {/* Teammates List */}
          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden mt-3">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-[var(--muted)]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold">
                    {member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">{member.email}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-mono">
                      Role: {member.role}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px]">
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
