import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  ExternalLink,
  Zap,
  Globe,
  AlertCircle,
  Clock,
  Building2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import CustomSelect from "../../components/ui/CustomSelect"
import { useJobStore } from "../../store/jobStore"
import { useAuthStore } from "../../store/authStore"
import { jobService, companyService } from "../../lib/supabase"
import { getCompanyRealLogo } from "../../data/companyLogos"
import type { ApplyMode, JobType, RemoteType, ScreeningQuestion } from "../../types"

const steps = ["Role Basics", "Apply Mode & Screening", "Requirements & Perks", "Review & Post"]

export default function PostJob() {
  const navigate = useNavigate()
  const { addJob } = useJobStore()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    type: "Full-time" as JobType,
    remoteType: "Hybrid" as RemoteType,
    category: "Engineering",
    location: "",
    address: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    applyMode: "easy" as ApplyMode,
    externalApplyUrl: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    skillsInput: "React, TypeScript, Node.js",
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status: "published" as "published" | "draft",
  })

  // Screening Questions Builder
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([
    {
      id: "q-1",
      question: "How many years of professional experience do you have with this tech stack?",
      type: "text",
      required: true,
    },
    {
      id: "q-2",
      question: "Are you authorized to work in this location without sponsorship?",
      type: "yes_no",
      required: true,
    },
  ])

  const addQuestion = () => {
    setScreeningQuestions([
      ...screeningQuestions,
      {
        id: "q-" + Date.now(),
        question: "",
        type: "text",
        required: false,
      },
    ])
  }

  const removeQuestion = (id: string) => {
    setScreeningQuestions(screeningQuestions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, updates: Partial<ScreeningQuestion>) => {
    setScreeningQuestions(
      screeningQuestions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    )
  }

  const nextStep = () => {
    setFormError("")
    if (currentStep === 0) {
      if (!formData.title.trim() || !formData.location.trim()) {
        setFormError("Job title and location are required.")
        return
      }
    }
    if (currentStep === 1) {
      if (
        (formData.applyMode === "external" || formData.applyMode === "both") &&
        (!formData.externalApplyUrl.trim() || !formData.externalApplyUrl.startsWith("https://"))
      ) {
        setFormError("External apply URL must be a valid, secure HTTPS link (e.g. https://careers.company.com/job/123)")
        return
      }
    }
    setCurrentStep((p) => Math.min(p + 1, steps.length - 1))
  }

  const prevStep = () => {
    setFormError("")
    setCurrentStep((p) => Math.max(p - 1, 0))
  }

  const handlePublish = async (statusOverride?: "published" | "draft") => {
    const status = statusOverride || formData.status
    setIsSubmitting(true)

    try {
      const skillsArray = formData.skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const responsibilitiesArray = formData.responsibilities
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean)

      const requirementsArray = formData.requirements
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean)

      const benefitsArray = formData.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean)

      const defaultCompany = {
        id: user?.companyId || "comp-stripe",
        name: user?.name ? `${user.name}'s Company` : "Stripe",
        slug: user?.name ? "user-company" : "stripe",
        logo: getCompanyRealLogo(user?.name ? `${user.name}'s Company` : "Stripe", "https://stripe.com"),
        banner: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&h=300&fit=crop&auto=format",
        about: "Leading global technology infrastructure and enterprise software engineering.",
        industry: "Technology",
        size: "50-200",
        location: formData.location || "San Francisco, CA",
        rating: 4.9,
        reviewCount: 14,
        isVerified: true,
        status: "approved" as const,
      }

      const created = await jobService.createJob(
        {
          company: defaultCompany,
          title: formData.title,
          type: formData.type,
          remoteType: formData.remoteType,
          category: formData.category,
          location: formData.location,
          address: formData.address || formData.location,
          salaryMin: Number(formData.salaryMin) || undefined,
          salaryMax: Number(formData.salaryMax) || undefined,
          currency: formData.currency,
          description: formData.description || "Exciting opportunity to join our rapidly expanding team.",
          responsibilities: responsibilitiesArray.length > 0 ? responsibilitiesArray : ["Deliver core features"],
          requirements: requirementsArray.length > 0 ? requirementsArray : ["Demonstrated technical capability"],
          benefits: benefitsArray.length > 0 ? benefitsArray : ["Healthcare and wellness perks"],
          skills: skillsArray,
          experience: "1-3 years",
          isRemote: formData.remoteType === "Remote",
          status,
          applyMode: formData.applyMode,
          externalApplyUrl:
            formData.applyMode === "external" || formData.applyMode === "both"
              ? formData.externalApplyUrl
              : undefined,
          screeningQuestions: screeningQuestions.filter((q) => q.question.trim()),
          expiresAt: formData.expiresAt,
          source: "posted",
        },
        user?.id || "user-recruiter"
      )

      addJob(created)
      toast.success(
        status === "draft"
          ? "Job saved as draft successfully!"
          : "Job posted to marketplace successfully!"
      )
      navigate("/recruiter")
    } catch (err: any) {
      toast.error(err.message || "Failed to publish job.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
            Post a New Job Opening
          </h1>
          <Button variant="outline" onClick={() => handlePublish("draft")} disabled={isSubmitting}>
            <Save size={16} className="mr-2" /> Save Draft
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    index <= currentStep
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {index < currentStep ? <CheckCircle size={18} /> : index + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-medium ${
                    index <= currentStep
                      ? "text-[var(--foreground)] font-semibold"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-28 h-0.5 mx-2 -mt-4 transition-colors ${
                    index < currentStep ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error notification banner */}
        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Container */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 md:p-8 shadow-sm space-y-6"
        >
          {/* STEP 1: ROLE BASICS */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Role Overview & Placement
              </h2>

              <Input
                label="Job Title *"
                placeholder="e.g. Senior Full Stack Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Employment Type
                  </label>
                  <CustomSelect
                    value={formData.type}
                    onChange={(val) => setFormData({ ...formData, type: val as any })}
                    options={["Full-time", "Part-time", "Contract", "Internship", "Freelance"]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Workplace Setup
                  </label>
                  <CustomSelect
                    value={formData.remoteType}
                    onChange={(val) => setFormData({ ...formData, remoteType: val as any })}
                    options={["Remote", "Hybrid", "On-site"]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Category
                  </label>
                  <CustomSelect
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: String(val) })}
                    options={["Engineering", "Design", "Product", "Marketing", "Finance", "Operations", "Data Science", "HR"]}
                    size="sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Location City / Region *"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <Input
                  label="Office Street Address (for GIS map)"
                  placeholder="e.g. 100 Market St, Suite 400"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Minimum Salary (Annual USD)"
                  type="number"
                  placeholder="e.g. 120000"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                />
                <Input
                  label="Maximum Salary (Annual USD)"
                  type="number"
                  placeholder="e.g. 180000"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: APPLY METHOD SELECTOR & SCREENING QUESTIONS BUILDER */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
                  Application Flow & Candidate Intake
                </h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Configure how candidates submit their applications for this role.
                </p>
              </div>

              {/* Apply Mode 3-Way Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Choose Application Method:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      mode: "easy" as ApplyMode,
                      title: "Easy Apply",
                      desc: "In-app 1-click submission with stored/uploaded resume and screening answers.",
                      icon: Zap,
                    },
                    {
                      mode: "external" as ApplyMode,
                      title: "Apply on My Website",
                      desc: "Directs candidates to your Greenhouse, Lever, Workable, or company portal.",
                      icon: ExternalLink,
                    },
                    {
                      mode: "both" as ApplyMode,
                      title: "Both Options",
                      desc: "Gives candidates the choice to apply either inside HireHub or on your website.",
                      icon: Globe,
                    },
                  ].map((opt) => (
                    <div
                      key={opt.mode}
                      onClick={() => setFormData({ ...formData, applyMode: opt.mode })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.applyMode === opt.mode
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-[var(--border)] hover:border-[var(--border)]/80"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <opt.icon
                          size={18}
                          className={formData.applyMode === opt.mode ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}
                        />
                        <h4 className="font-bold text-sm text-[var(--foreground)]">{opt.title}</h4>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* External URL Input (conditional) */}
              {(formData.applyMode === "external" || formData.applyMode === "both") && (
                <div className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-2">
                  <Input
                    label="Company / ATS External Application URL *"
                    type="url"
                    placeholder="https://careers.yourcompany.com/jobs/senior-engineer"
                    value={formData.externalApplyUrl}
                    onChange={(e) => setFormData({ ...formData, externalApplyUrl: e.target.value })}
                    required
                  />
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Must start with <code className="text-[var(--primary)]">https://</code>. HireHub logs candidate clicks and prompts them to confirm submission upon return.
                  </p>
                </div>
              )}

              {/* Screening Questions Builder (for Easy Apply & Both) */}
              {(formData.applyMode === "easy" || formData.applyMode === "both") && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--foreground)]">
                        Screening Questions (Optional)
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Add qualifying questions candidates must answer during Easy Apply.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" type="button" onClick={addQuestion}>
                      <Plus size={14} className="mr-1" /> Add Question
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {screeningQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-[var(--muted)]/30 border border-[var(--border)] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-[var(--foreground)]">Question {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(q.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          placeholder="e.g. Do you have experience managing AWS / GCP clusters?"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                        />
                        <div className="flex items-center gap-4 text-xs">
                          <div className="w-32">
                            <CustomSelect
                              value={q.type}
                              onChange={(val) => updateQuestion(q.id, { type: val as any })}
                              options={[
                                { value: "text", label: "Free Text" },
                                { value: "yes_no", label: "Yes / No" },
                              ]}
                              size="sm"
                            />
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[var(--foreground)]">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                              className="accent-[var(--primary)]"
                            />
                            Required response
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: REQUIREMENTS & PERKS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Job Details & Candidate Profile
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Full Job Description *
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline mission, expectations, and day-to-day impact..."
                  className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Key Responsibilities (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="• Architect sub-second distributed query engines&#10;• Mentor intermediate engineers&#10;• Lead sprint design reviews"
                  className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Required Qualifications (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="• 4+ years of TypeScript/React development&#10;• Experience with Postgres database indexing&#10;• Excellent cross-functional communication"
                  className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <Input
                label="Required Skills (Comma-separated keywords for ATS & AI matcher)"
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
              />

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Benefits & Perks (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="• 100% covered health, dental, and vision insurance&#10;• 401(k) matching up to 5%&#10;• Annual learning & conference stipend"
                  className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & POST */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Review & Confirm Listing
              </h2>

              <div className="p-5 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins text-xl font-bold text-[var(--foreground)]">
                    {formData.title || "Untitled Role"}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold uppercase">
                    {formData.applyMode} Apply
                  </span>
                </div>

                <p className="text-xs text-[var(--muted-foreground)]">
                  {formData.type} · {formData.remoteType} · {formData.location}
                </p>

                <div className="flex gap-4 text-xs pt-1 border-t border-[var(--border)]">
                  <span>Compensation: <strong>${formData.salaryMin} - ${formData.salaryMax}</strong></span>
                  <span>Expires: <strong>{formData.expiresAt}</strong></span>
                </div>

                {formData.externalApplyUrl && (
                  <div className="text-xs text-[var(--muted-foreground)] truncate">
                    External Apply: <span className="font-mono text-[var(--primary)]">{formData.externalApplyUrl}</span>
                  </div>
                )}
              </div>

              {/* Status Picker: Published vs Draft */}
              <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[var(--foreground)]">Posting Status</h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Published openings are immediately discoverable on the marketplace.
                  </p>
                </div>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val as any })}
                  options={[
                    { value: "published", label: "Publish to Marketplace" },
                    { value: "draft", label: "Save as Draft" },
                  ]}
                  size="sm"
                  className="w-48 shrink-0"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="button" variant="primary" onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                isLoading={isSubmitting}
                onClick={() => handlePublish()}
                className="font-bold px-6"
              >
                {formData.status === "draft" ? "Save Job Draft" : "Post Job to Marketplace"}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
