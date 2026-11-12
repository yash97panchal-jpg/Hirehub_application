import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  HelpCircle,
  Loader2,
  Zap,
  Lock,
  Sparkles,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Clock,
  DollarSign,
  Globe,
  Eye,
  Check,
  Plus,
  Trash2,
} from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import type { Job, User, Application } from "../../types"
import { applicationService, storageService } from "../../lib/supabase"
import { emailService, type SentEmailRecord } from "../../services/emailService"
import { triggerConfetti } from "../../utils/confetti"
import toast from "react-hot-toast"

interface EasyApplyModalProps {
  job: Job
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (app?: Application, emailRecord?: SentEmailRecord | null) => void
}

export default function EasyApplyModal({
  job,
  user,
  isOpen,
  onClose,
  onSuccess,
}: EasyApplyModalProps) {
  const navigate = useNavigate()

  // Steps: 1: Contact, 2: Education & Experience, 3: Resume & Cover Letter, 4: Screening Questions, 5: Review & Submit
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Step 1: Personal & Contact Details
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [currentLocation, setCurrentLocation] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")

  // Step 2: Academic & Professional Profile
  const [highestEducation, setHighestEducation] = useState("Bachelor's Degree")
  const [collegeUniversity, setCollegeUniversity] = useState("")
  const [totalExperience, setTotalExperience] = useState("1-3 years")
  const [currentEmploymentStatus, setCurrentEmploymentStatus] = useState("Employed Full-time")
  const [currentCompany, setCurrentCompany] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [expectedSalary, setExpectedSalary] = useState("")
  const [noticePeriod, setNoticePeriod] = useState("30 Days")

  // Step 3: Resume & Cover Letter
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumePath, setResumePath] = useState("")
  const [resumeName, setResumeName] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)

  // Step 4: Screening Questions
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [draftLoaded, setDraftLoaded] = useState(false)

  const questions = job.screeningQuestions || []

  // Initialize data from User Profile and check for saved drafts
  useEffect(() => {
    if (!isOpen) return

    if (user) {
      // Check for saved draft
      const draft = applicationService.getDraft(job.id, user.id)
      if (draft) {
        setFullName(draft.fullName || user.name || "")
        setEmail(draft.email || user.email || "")
        setMobileNumber(draft.mobileNumber || user.phone || "")
        setCurrentLocation(draft.currentLocation || user.location || "")
        setLinkedinUrl(draft.linkedinUrl || user.linkedin || "")
        setPortfolioUrl(draft.portfolioUrl || "")
        setHighestEducation(draft.highestEducation || "Bachelor's Degree")
        setCollegeUniversity(draft.collegeUniversity || "")
        setTotalExperience(draft.totalExperience || "1-3 years")
        setCurrentEmploymentStatus(draft.currentEmploymentStatus || "Employed Full-time")
        setCurrentCompany(draft.currentCompany || "")
        setSkills(draft.skills || user.skills || [])
        setExpectedSalary(draft.expectedSalary || "")
        setNoticePeriod(draft.noticePeriod || "30 Days")
        setCoverLetter(draft.coverLetter || "")
        setAnswers(draft.answers || {})
        setResumePath(draft.resumePath || user.resumeUrl || "/sample-resume.pdf")
        setResumeName(draft.resumeName || "Profile_Resume.pdf")
        setDraftLoaded(true)
        toast.success("Restored your saved draft for this job.")
      } else {
        // Prepopulate from user profile
        setFullName(user.name || "")
        setEmail(user.email || "")
        setMobileNumber(user.phone || "+1 (555) 349-2041")
        setCurrentLocation(user.location || "San Francisco, CA")
        setLinkedinUrl(user.linkedin || "")
        setHighestEducation("Bachelor's Degree")
        setTotalExperience("1-3 years")
        setCurrentEmploymentStatus("Employed Full-time")
        setSkills(user.skills && user.skills.length > 0 ? [...user.skills] : ["React", "TypeScript", "Problem Solving"])
        setResumePath(user.resumeUrl || "/sample-resume.pdf")
        setResumeName(user.name ? `${user.name.replace(/\s+/g, "_")}_Resume.pdf` : "Candidate_Resume.pdf")
      }
    }
  }, [isOpen, user, job.id])

  // Add / remove skills
  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setErrorMsg("")
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File exceeds 5MB size limit.")
      }
      if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
        throw new Error("Only PDF and DOCX documents are accepted.")
      }
      setResumeFile(file)
      setResumeName(file.name)

      // Upload to storage service
      if (user) {
        const path = await storageService.uploadResume(file, user.id)
        setResumePath(path)
      } else {
        setResumePath(file.name)
      }
      toast.success("Resume uploaded and validated!")
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process resume")
      toast.error(err.message || "Failed to process resume")
    }
  }

  // AI pitch generator
  const handleGenerateCoverLetter = () => {
    setIsGeneratingCoverLetter(true)
    setTimeout(() => {
      const generated = `Dear Hiring Team at ${job.company.name},

I am writing to express my strong interest in the ${job.title} position (${job.location}). With extensive expertise in ${skills.slice(0, 3).join(", ") || "software engineering"}, I am confident in my ability to immediately add value to your initiatives.

Throughout my ${totalExperience} of experience, I have developed a proven track record of architecting reliable systems, collaborating effectively across disciplines, and delivering high-impact solutions. I am particularly drawn to ${job.company.name}'s mission and culture of technical excellence.

Thank you for your consideration. I look forward to the opportunity to discuss how my qualifications align with your requirements.

Sincerely,
${fullName || "Candidate"}`
      setCoverLetter(generated)
      setIsGeneratingCoverLetter(false)
      toast.success("AI generated a customized cover letter pitch!")
    }, 600)
  }

  // Save current progress as draft
  const handleSaveDraft = () => {
    if (!user) return
    const draftPayload = {
      fullName,
      email,
      mobileNumber,
      currentLocation,
      linkedinUrl,
      portfolioUrl,
      highestEducation,
      collegeUniversity,
      totalExperience,
      currentEmploymentStatus,
      currentCompany,
      skills,
      expectedSalary,
      noticePeriod,
      coverLetter,
      answers,
      resumePath,
      resumeName,
    }
    applicationService.saveDraft(job.id, user.id, draftPayload)
    toast.success("Application saved as draft. You can resume anytime!")
  }

  // Answer change handler
  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }))
  }

  // Step validation
  const validateStep = (currentStep: number): boolean => {
    setErrorMsg("")
    if (currentStep === 1) {
      if (!fullName.trim()) {
        setErrorMsg("Please provide your full name.")
        return false
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address.")
        return false
      }
      if (!mobileNumber.trim()) {
        setErrorMsg("Please provide your mobile number.")
        return false
      }
      if (!currentLocation.trim()) {
        setErrorMsg("Please provide your current city/location.")
        return false
      }
      if (linkedinUrl.trim() && !linkedinUrl.startsWith("http")) {
        setErrorMsg("LinkedIn URL must start with https://")
        return false
      }
      if (portfolioUrl.trim() && !portfolioUrl.startsWith("http")) {
        setErrorMsg("Portfolio/GitHub URL must start with https://")
        return false
      }
      return true
    }

    if (currentStep === 2) {
      if (!highestEducation.trim()) {
        setErrorMsg("Please specify your highest education qualification.")
        return false
      }
      if (!totalExperience.trim()) {
        setErrorMsg("Please select your total work experience.")
        return false
      }
      if (!currentEmploymentStatus.trim()) {
        setErrorMsg("Please select your current employment status.")
        return false
      }
      if (skills.length === 0) {
        setErrorMsg("Please add at least one relevant skill.")
        return false
      }
      return true
    }

    if (currentStep === 3) {
      if (!resumePath && !resumeFile) {
        setErrorMsg("Please upload or select a valid resume document.")
        return false
      }
      return true
    }

    if (currentStep === 4) {
      for (const q of questions) {
        if (q.required && !answers[q.id]?.trim()) {
          setErrorMsg(`Please answer required employer question: "${q.question}"`)
          return false
        }
      }
      return true
    }

    return true
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((s) => (s + 1) as any)
    }
  }

  // Final Submit Application
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to complete your application.")
      return
    }

    if (!validateStep(4)) return

    setIsSubmitting(true)
    setErrorMsg("")

    try {
      const newApp = await applicationService.submitApplication({
        jobId: job.id,
        userId: user.id,
        resumeFile: resumePath || "sample-resume.pdf",
        resumeName: resumeName || "Resume.pdf",
        coverLetter: coverLetter.trim() || undefined,
        answers,
        job,
        applicant: user,
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        currentLocation: currentLocation.trim(),
        highestEducation,
        highestQualification: highestEducation,
        collegeUniversity: collegeUniversity.trim() || undefined,
        skills,
        workExperience: totalExperience,
        totalExperience,
        currentCompany: currentCompany.trim() || undefined,
        currentEmploymentStatus,
        noticePeriod,
        expectedSalary: expectedSalary.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
      })

      let emailRecord: SentEmailRecord | null = null
      try {
        emailRecord = await emailService.sendApplicationConfirmation({
          applicant: { ...user, name: fullName, email },
          job,
          applicationId: newApp.applicationNumber || newApp.id,
        })
      } catch (emailErr) {
        console.warn("Could not dispatch confirmation email:", emailErr)
      }

      triggerConfetti()
      toast.success(`Application submitted! ID: ${newApp.applicationNumber || newApp.id}`)
      onSuccess(newApp, emailRecord)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application.")
      toast.error(err.message || "Failed to submit application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Unauthenticated Candidate Gate
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 text-center space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center mx-auto shadow-inner">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
              Sign In Required to Apply
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              You must be logged into a verified candidate account to submit an application for <strong className="text-[var(--foreground)]">{job.title}</strong> at {job.company.name}.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              className="w-full font-bold justify-center"
              onClick={() => {
                onClose()
                navigate(`/login?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`)
              }}
            >
              Log In to Continue
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => {
                onClose()
                navigate(`/register?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`)
              }}
            >
              Create Free Candidate Account
            </Button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors pt-1 block mx-auto cursor-pointer"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold uppercase tracking-wider inline-flex items-center">
                <Zap size={11} className="mr-1 fill-current" /> Complete Job Application
              </span>
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Step {step} of 5</span>
              {draftLoaded && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Draft Restored
                </span>
              )}
            </div>
            <h2 className="font-poppins font-bold text-lg text-[var(--foreground)] mt-1">
              {job.title}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {job.company.name} · {job.location} · {job.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1.5 rounded-xl hover:bg-[var(--muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[var(--muted)] h-1.5">
          <div
            className="bg-gradient-to-r from-[#F97316] to-orange-500 h-1.5 transition-all duration-300 rounded-r-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step Tabs Header */}
        <div className="grid grid-cols-5 border-b border-[var(--border)] bg-[var(--card)] text-[11px] font-semibold text-center divide-x divide-[var(--border)]">
          {[
            { s: 1, label: "Contact Info" },
            { s: 2, label: "Qualifications" },
            { s: 3, label: "Resume & Note" },
            { s: 4, label: "Questions" },
            { s: 5, label: "Review" },
          ].map((item) => (
            <div
              key={item.s}
              className={`py-2 px-1 transition-colors ${
                step === item.s
                  ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                  : step > item.s
                  ? "text-emerald-500 font-medium"
                  : "text-[var(--muted-foreground)] opacity-70"
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: PERSONAL & CONTACT INFORMATION */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                  1. Candidate Personal & Contact Information
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Confirm your contact details so the hiring team can reach you directly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Candidate Full Name *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  required
                />
                <Input
                  label="Email Address *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  required
                />
                <Input
                  label="Mobile Number *"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +1 (555) 349-2041"
                  required
                />
                <Input
                  label="Current Location (City, Country) *"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  required
                />
                <Input
                  label="LinkedIn Profile URL (Optional)"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
                <Input
                  label="Portfolio / GitHub URL (Optional)"
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL & ACADEMIC QUALIFICATIONS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                  2. Qualifications & Experience
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Highlight your background, employment status, and primary skill set.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Highest Education *
                  </label>
                  <select
                    value={highestEducation}
                    onChange={(e) => setHighestEducation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="High School / Diploma">High School / Diploma</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                    <option value="Bootcamp / Self-Taught">Bootcamp / Self-Taught</option>
                  </select>
                </div>

                <Input
                  label="College / University / Institute"
                  value={collegeUniversity}
                  onChange={(e) => setCollegeUniversity(e.target.value)}
                  placeholder="e.g. Stanford University"
                />

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Total Work Experience *
                  </label>
                  <select
                    value={totalExperience}
                    onChange={(e) => setTotalExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-8 years">5-8 years</option>
                    <option value="8+ years">8+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Current Employment Status *
                  </label>
                  <select
                    value={currentEmploymentStatus}
                    onChange={(e) => setCurrentEmploymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="Employed Full-time">Employed Full-time</option>
                    <option value="Employed Part-time">Employed Part-time</option>
                    <option value="Serving Notice Period">Serving Notice Period</option>
                    <option value="Actively Looking / Unemployed">Actively Looking / Unemployed</option>
                    <option value="Student / Intern">Student / Intern</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>

                <Input
                  label="Current / Most Recent Company"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                    Notice Period (Optional)
                  </label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Expected Salary (Optional)"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. $140,000 / year or ₹18 LPA"
                  />
                </div>
              </div>

              {/* Skills Tags input */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-[var(--foreground)]">
                  Candidate Skills * (Add your key technical or domain skills)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    placeholder="Type skill and press Add (e.g. React, Python, Product Strategy)"
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold border border-[var(--primary)]/20"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-[var(--muted-foreground)] italic">
                      No skills added yet. Add at least one skill.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESUME & COVER LETTER */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                  3. Resume Document & Cover Note
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Select your existing profile resume or upload an updated copy (PDF/DOCX, max 5MB).
                </p>
              </div>

              {/* Resume Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    !resumeFile
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--border)]/80"
                  }`}
                  onClick={() => setResumeFile(null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--foreground)] truncate">
                        {resumeName || "Profile Resume Document"}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        PDF Format · Verified Document
                      </p>
                    </div>
                  </div>
                  {!resumeFile && <CheckCircle size={18} className="text-[var(--primary)] shrink-0" />}
                </div>

                {/* Upload New File */}
                <div className="relative p-4 border-2 border-dashed border-[var(--border)] rounded-2xl text-center hover:border-[var(--primary)] transition-colors flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={22} className="text-[var(--muted-foreground)] mb-1" />
                  <p className="text-xs font-semibold text-[var(--foreground)] truncate max-w-[200px]">
                    {resumeFile ? resumeFile.name : "Upload New Resume File"}
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">PDF or DOCX up to 5MB</p>
                </div>
              </div>

              {/* Cover Letter Section with AI Assist */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[var(--foreground)]">
                    Cover Letter / Introduction (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingCoverLetter}
                    className="text-xs font-semibold text-[#F97316] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={13} />
                    {isGeneratingCoverLetter ? "Generating AI Pitch..." : "Generate with AI"}
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Share why your background and skill set make you a great fit for this position..."
                  className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 4: EMPLOYER SCREENING QUESTIONS */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                  4. Employer-Defined Screening Questions
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Answer the specific questions set by {job.company.name}'s recruiting team.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/20 rounded-2xl border border-[var(--border)]">
                  No additional screening questions required for this position. Click Next to review your application.
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="space-y-2 p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)]"
                  >
                    <label className="block text-xs font-bold text-[var(--foreground)]">
                      {idx + 1}. {q.question} {q.required && <span className="text-red-500">*</span>}
                    </label>
                    {q.type === "yes_no" ? (
                      <div className="flex gap-4 pt-1">
                        {["Yes", "No"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs text-[var(--foreground)] cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className="accent-[var(--primary)]"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : q.type === "multiple_choice" && q.options && q.options.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs text-[var(--foreground)] cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className="accent-[var(--primary)]"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Your answer..."
                        className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 5: PREVIEW & REVIEW SCREEN */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[var(--foreground)]">
                  5. Review Your Complete Application
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Verify your submitted information before final transmission to the employer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--muted)]/20 border border-[var(--border)] space-y-3.5 text-xs">
                {/* Contact Section */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--foreground)]">{fullName}</h4>
                    <p className="text-[var(--muted-foreground)]">{email} · {mobileNumber}</p>
                    <p className="text-[var(--muted-foreground)]">{currentLocation}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[var(--primary)] font-bold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {/* Professional Qualifications */}
                <div className="space-y-1 border-b border-[var(--border)] pb-2.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--foreground)]">Academic & Work Experience:</span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[var(--primary)] font-bold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-[var(--muted-foreground)]">
                    <strong>Education:</strong> {highestEducation} {collegeUniversity ? `(${collegeUniversity})` : ""}
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    <strong>Experience:</strong> {totalExperience} · {currentEmploymentStatus} {currentCompany ? `@ ${currentCompany}` : ""}
                  </p>
                  {expectedSalary && (
                    <p className="text-[var(--muted-foreground)]">
                      <strong>Expected Salary:</strong> {expectedSalary}
                    </p>
                  )}
                  {noticePeriod && (
                    <p className="text-[var(--muted-foreground)]">
                      <strong>Notice Period:</strong> {noticePeriod}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-[var(--muted)] font-semibold text-[11px] text-[var(--foreground)]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resume & Cover Note */}
                <div className="space-y-1 border-b border-[var(--border)] pb-2.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--foreground)]">Resume Document:</span>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs text-[var(--primary)] font-bold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-[var(--primary)] font-semibold flex items-center gap-1.5">
                    <FileText size={14} /> {resumeFile ? resumeFile.name : resumeName || "Profile Resume Document"}
                  </p>
                  {coverLetter && (
                    <div className="mt-2">
                      <span className="text-[var(--muted-foreground)] block">Cover Note Pitch:</span>
                      <p className="text-[var(--foreground)] italic mt-0.5 line-clamp-3 bg-[var(--card)] p-2.5 rounded-xl border border-[var(--border)]">
                        "{coverLetter}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Screening Answers */}
                {questions.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-[var(--foreground)]">Employer Screening Responses:</span>
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="text-xs text-[var(--primary)] font-bold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    {questions.map((q) => (
                      <div key={q.id} className="text-[11px] text-[var(--muted-foreground)]">
                        <strong>Q: {q.question}</strong> — <span className="text-[var(--foreground)]">{answers[q.id] || "No answer"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[var(--muted-foreground)] text-center">
                By submitting, your application will be securely recorded in the platform database and delivered directly to {job.company.name}'s recruitment team.
              </p>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between gap-2">
          {/* Left actions */}
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as any)}
              >
                <ArrowLeft size={14} className="mr-1" /> Previous
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              title="Save in-progress application as draft"
            >
              <Save size={13} className="mr-1" /> Save Draft
            </Button>
          </div>

          {/* Right actions */}
          {step < 5 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              className="font-bold"
            >
              Next Step <ArrowRight size={14} className="ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSubmit}
              className="font-bold px-6 shadow-md"
            >
              Confirm & Submit Application
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
