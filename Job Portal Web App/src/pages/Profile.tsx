import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Camera,
  User,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  Settings as SettingsIcon,
  Upload,
  Sparkles,
  Check,
  ExternalLink,
  GraduationCap,
  Award,
  ShieldCheck,
  Mail,
  Download,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Badge from "../components/ui/Badge"
import { useAuthStore } from "../store/authStore"
import type { Education, Certification, ResumeVersion } from "../types"
import toast from "react-hot-toast"

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuthStore()

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    location: "",
    about: "",
    skills: "",
    phone: "",
    linkedin: "",
    avatar: "",
  })

  const [experience, setExperience] = useState<any[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isEmailVerified, setIsEmailVerified] = useState(user?.isEmailVerified ?? false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)

  // Multiple Resume Versions Management
  const [resumes, setResumes] = useState<ResumeVersion[]>(() => {
    try {
      const stored = localStorage.getItem("hirehub_user_resumes_v2")
      if (stored) return JSON.parse(stored)
    } catch {}
    return [
      {
        id: "res-1",
        name: "Full Stack Engineer (Default)",
        fileName: "Alex_Johnson_FullStack_Resume.pdf",
        fileSize: "142 KB",
        url: "https://hirehub.app/resumes/demo.pdf",
        uploadedAt: new Date().toISOString(),
        isDefault: true,
        skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
      },
    ]
  })

  const [newResumeTitle, setNewResumeTitle] = useState("")
  const [showAddResumeModal, setShowAddResumeModal] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        headline: user.headline || "",
        location: user.location || "",
        about: user.about || "",
        skills: user.skills ? user.skills.join(", ") : "",
        phone: user.phone || "",
        linkedin: user.linkedin || "",
        avatar: user.avatar || "",
      })
      setIsEmailVerified(user.isEmailVerified ?? true)

      if (user.experience && user.experience.length > 0) {
        setExperience(user.experience)
      } else {
        setExperience([
          {
            id: "1",
            company: "Tech Corp",
            role: "Senior Software Engineer",
            duration: "2021 - Present",
            description: "Architecting high-performance web applications in React and TypeScript.",
          },
        ])
      }

      if (user.education && user.education.length > 0) {
        setEducation(user.education)
      } else {
        setEducation([
          {
            id: "edu-1",
            school: "University of California, Berkeley",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            dates: "2016 - 2020",
            grade: "3.85 GPA",
            description: "Core focus on distributed computing, algorithms, database systems, and human-computer interaction.",
          },
        ])
      }

      if (user.certifications && user.certifications.length > 0) {
        setCertifications(user.certifications)
      } else {
        setCertifications([
          {
            id: "cert-1",
            name: "AWS Certified Solutions Architect – Associate",
            issuer: "Amazon Web Services",
            issueDate: "2024",
            expiryDate: "2027",
            credentialUrl: "https://aws.amazon.com/verification",
          },
        ])
      }
    }
  }, [user])

  const handleVerifyEmail = () => {
    setIsVerifyingEmail(true)
    setTimeout(() => {
      setIsEmailVerified(true)
      setIsVerifyingEmail(false)
      updateUser({ isEmailVerified: true })
      toast.success("Email address successfully verified!")
    }, 800)
  }

  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const commonSkills = [
      "Python", "React", "TypeScript", "JavaScript", "Node.js", "Java", "Go",
      "SQL", "PostgreSQL", "AWS", "Cloud", "Docker", "Kubernetes", "HTML/CSS",
      "Tailwind", "Machine Learning", "FastAPI", "GraphQL", "DevOps", "Figma",
      "C++", "C#", "Django", "Next.js", "Redis", "REST APIs"
    ]

    const lowerName = file.name.toLowerCase()
    const foundSkills = commonSkills.filter((s) => lowerName.includes(s.toLowerCase()))
    const extractedSkills = Array.from(
      new Set([
        ...foundSkills,
        ...(lowerName.includes("python") ? ["Python", "FastAPI", "SQL"] : []),
        ...(lowerName.includes("react") || lowerName.includes("frontend") ? ["React", "TypeScript", "Tailwind"] : []),
        "React", "TypeScript", "SQL", "Cloud"
      ])
    ).slice(0, 6)

    const versionTitle = newResumeTitle.trim() || `Resume Version ${resumes.length + 1}`
    const newResume: ResumeVersion = {
      id: "res-" + Date.now(),
      name: versionTitle,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      isDefault: resumes.length === 0,
      skills: extractedSkills,
    }

    const nextResumes = [newResume, ...resumes]
    setResumes(nextResumes)
    localStorage.setItem("hirehub_user_resumes_v2", JSON.stringify(nextResumes))
    setNewResumeTitle("")
    setShowAddResumeModal(false)

    // Merge skills with user profile
    const mergedSkills = Array.from(new Set([...(user?.skills || []), ...extractedSkills]))
    updateUser({ skills: mergedSkills, resumes: nextResumes })
    setFormData((prev) => ({
      ...prev,
      skills: mergedSkills.join(", "),
    }))

    toast.success(`Resume "${file.name}" added as "${versionTitle}"!`)
  }

  const handleSetDefaultResume = (id: string) => {
    const updated = resumes.map((r) => ({
      ...r,
      isDefault: r.id === id,
    }))
    setResumes(updated)
    localStorage.setItem("hirehub_user_resumes_v2", JSON.stringify(updated))
    updateUser({ resumes: updated })
    toast.success("Default application resume updated!")
  }

  const handleRemoveResumeVersion = (id: string) => {
    if (resumes.length <= 1) {
      toast.error("You must keep at least one resume on file.")
      return
    }
    const updated = resumes.filter((r) => r.id !== id)
    if (!updated.some((r) => r.isDefault) && updated.length > 0) {
      updated[0].isDefault = true
    }
    setResumes(updated)
    localStorage.setItem("hirehub_user_resumes_v2", JSON.stringify(updated))
    updateUser({ resumes: updated })
    toast.success("Resume version removed.")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setFormData((prev) => ({ ...prev, avatar: result }))
        if (user) {
          updateUser({ avatar: result })
        }
        toast.success("Profile picture updated!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }))
    if (user) {
      updateUser({ avatar: "" })
    }
    toast.success("Profile picture removed.")
  }

  const handleSave = () => {
    if (user) {
      updateUser({
        name: formData.name,
        headline: formData.headline,
        location: formData.location,
        about: formData.about,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        phone: formData.phone,
        linkedin: formData.linkedin,
        experience,
        education,
        certifications,
        resumes,
        avatar: formData.avatar,
        isEmailVerified,
      })
      toast.success("Profile saved successfully!")
    }
  }

  // Work Experience CRUD
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now().toString(),
        company: "",
        role: "",
        duration: "",
        description: "",
      },
    ])
  }

  const removeExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id))
  }

  const updateExperience = (id: string, field: string, value: string) => {
    setExperience(
      experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    )
  }

  // Education CRUD
  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: "edu-" + Date.now(),
        school: "",
        degree: "",
        fieldOfStudy: "",
        dates: "",
        grade: "",
        description: "",
      },
    ])
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(
      education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    )
  }

  // Certifications CRUD
  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        id: "cert-" + Date.now(),
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialUrl: "",
      },
    ])
  }

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id))
  }

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(
      certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] text-center shadow-lg">
          <User size={48} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-60" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">Log In Required</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 mb-6">
            Please log in to view and manage your profile details, resume, and preferences.
          </p>
          <Button variant="primary" className="w-full font-bold" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/settings")}
              className="font-bold text-xs"
            >
              <SettingsIcon size={14} className="mr-1.5" /> Settings
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <Save size={16} className="mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Email Verification Banner */}
        <div className="mb-6">
          {isEmailVerified ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    Verified Account & Email ({user.email})
                  </p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                    Your candidate profile has high trust and can receive direct interview invitations.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                Verified
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                    Email Verification Pending ({user.email})
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                    Please confirm your email to ensure you never miss interview invites or employer offers.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                isLoading={isVerifyingEmail}
                onClick={handleVerifyEmail}
                className="text-xs shrink-0"
              >
                Verify Email Now
              </Button>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Personal Info Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <User className="text-[var(--primary)]" size={20} /> Personal Information
            </h2>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-[var(--border)]">
              <div className="relative shrink-0">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="avatar-upload"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[var(--muted)] flex items-center justify-center relative overflow-hidden group cursor-pointer block border-2 border-[var(--border)] shadow-sm hover:border-[var(--primary)] transition-all"
                  title="Click to change profile picture"
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <span className="text-3xl sm:text-4xl text-[var(--primary)] font-black">
                        {formData.name.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-white">
                    <Camera size={22} />
                    <span className="text-[10px] font-bold mt-1">Upload</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left space-y-2">
                <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                  Profile Picture
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] max-w-sm">
                  Upload a high-resolution JPG, PNG or WEBP portrait (recommended 400×400px).
                </p>

                <div className="flex items-center gap-2.5 pt-1">
                  <label
                    htmlFor="avatar-upload"
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] cursor-pointer transition-colors"
                  >
                    Change Photo
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3.5 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-xs font-semibold text-red-500 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Professional Headline"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.headline}
                onChange={(e) =>
                  setFormData({ ...formData, headline: e.target.value })
                }
              />
              <Input
                label="Location"
                placeholder="e.g. San Francisco, CA or Remote"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Phone Number
                  </label>
                  {user?.isPhoneVerified && (
                    <span className="text-[11px] text-green-500 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  )}
                </div>
                <input
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] text-sm"
                  placeholder="e.g. +1 (555) 349-2041"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <Input
                label="LinkedIn Profile"
                placeholder="e.g. linkedin.com/in/username"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  About Me & Bio
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[100px]"
                  placeholder="Tell recruiters about your background, strengths, and career aspirations..."
                  value={formData.about}
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <FileText className="text-[var(--primary)]" size={20} /> Skills & Expertise
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Separate skills with commas (e.g. React, TypeScript, Node.js, GraphQL, PostgreSQL).
            </p>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[80px]"
              placeholder="React, TypeScript, UI/UX Design, Docker..."
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
            />
          </div>

          {/* Work Experience Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Briefcase className="text-[var(--primary)]" size={20} /> Work Experience & Internships
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Highlight your professional track record, impact metrics, and key technologies.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus size={16} className="mr-1.5" /> Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {experience.map((exp) => (
                <div
                  key={exp.id}
                  className="relative p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)] shadow-xs"
                >
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors p-1"
                    title="Delete experience"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-8">
                    <Input
                      label="Company / Employer"
                      placeholder="e.g. Stripe"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, "company", e.target.value)
                      }
                    />
                    <Input
                      label="Job Title / Role"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={exp.role}
                      onChange={(e) =>
                        updateExperience(exp.id, "role", e.target.value)
                      }
                    />
                    <Input
                      label="Duration / Dates"
                      placeholder="e.g. Jan 2022 – Present"
                      value={exp.duration}
                      onChange={(e) =>
                        updateExperience(exp.id, "duration", e.target.value)
                      }
                    />
                  </div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Responsibilities & Key Achievements
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[80px]"
                    placeholder="• Reduced bundle size by 35%...
• Built reusable design system components..."
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(exp.id, "description", e.target.value)
                    }
                  />
                </div>
              ))}

              {experience.length === 0 && (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  No work experience added yet. Click "Add Role" above to get started.
                </div>
              )}
            </div>
          </div>

          {/* Education & Qualifications Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <GraduationCap className="text-[var(--primary)]" size={20} /> Education & Academic Credentials
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Degrees, diplomas, university qualifications, and specialized training programs.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addEducation}>
                <Plus size={16} className="mr-1.5" /> Add Degree
              </Button>
            </div>

            <div className="space-y-6">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="relative p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)] shadow-xs"
                >
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors p-1"
                    title="Delete education"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <Input
                      label="School / University"
                      placeholder="e.g. Stanford University"
                      value={edu.school}
                      onChange={(e) =>
                        updateEducation(edu.id, "school", e.target.value)
                      }
                    />
                    <Input
                      label="Degree (e.g. Bachelor of Science, Master of Science)"
                      placeholder="e.g. B.S. in Computer Science"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                    />
                    <Input
                      label="Major / Field of Study"
                      placeholder="e.g. Software Engineering"
                      value={edu.fieldOfStudy || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "fieldOfStudy", e.target.value)
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Graduation Year / Dates"
                        placeholder="e.g. 2018 - 2022"
                        value={edu.dates}
                        onChange={(e) =>
                          updateEducation(edu.id, "dates", e.target.value)
                        }
                      />
                      <Input
                        label="GPA / Honors (Optional)"
                        placeholder="e.g. 3.9 GPA"
                        value={edu.grade || ""}
                        onChange={(e) =>
                          updateEducation(edu.id, "grade", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Relevant Coursework & Honors
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[60px]"
                    placeholder="Algorithms, Data Structures, Distributed Computing..."
                    value={edu.description || ""}
                    onChange={(e) =>
                      updateEducation(edu.id, "description", e.target.value)
                    }
                  />
                </div>
              ))}

              {education.length === 0 && (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  No education records listed. Click "Add Degree" to showcase your academic background.
                </div>
              )}
            </div>
          </div>

          {/* Certifications & Licensures Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Award className="text-[var(--primary)]" size={20} /> Certifications & Professional Licenses
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Industry certifications (AWS, Google Cloud, Microsoft, Cisco, Scrum, etc.).
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addCertification}>
                <Plus size={16} className="mr-1.5" /> Add Certification
              </Button>
            </div>

            <div className="space-y-4">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="relative p-5 border border-[var(--border)] rounded-2xl bg-[var(--background)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1 w-full">
                    <Input
                      label="Certificate Name"
                      placeholder="e.g. AWS Solutions Architect"
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(cert.id, "name", e.target.value)
                      }
                    />
                    <Input
                      label="Issuing Organization"
                      placeholder="e.g. Amazon Web Services"
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(cert.id, "issuer", e.target.value)
                      }
                    />
                    <Input
                      label="Issue Date"
                      placeholder="e.g. 2024"
                      value={cert.issueDate}
                      onChange={(e) =>
                        updateCertification(cert.id, "issueDate", e.target.value)
                      }
                    />
                    <Input
                      label="Credential Verification URL"
                      placeholder="e.g. https://verify..."
                      value={cert.credentialUrl || ""}
                      onChange={(e) =>
                        updateCertification(cert.id, "credentialUrl", e.target.value)
                      }
                    />
                  </div>
                  <button
                    onClick={() => removeCertification(cert.id)}
                    className="text-red-500 hover:text-red-600 p-2 self-end md:self-center"
                    title="Delete certification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {certifications.length === 0 && (
                <div className="text-center py-6 text-[var(--muted-foreground)]">
                  No certifications added yet. Click "Add Certification" to add your credentials.
                </div>
              )}
            </div>
          </div>

          {/* Multiple Resume Versions Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <FileText className="text-[var(--primary)]" size={20} /> Multiple Resume Versions
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Maintain specialized CVs for different roles (e.g. Frontend, Full Stack, Tech Lead). Choose your active version for 1-click Easy Apply.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/resume-builder")}
                  className="text-xs"
                >
                  Resume Builder
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddResumeModal(true)}
                  className="text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add Resume Version
                </Button>
              </div>
            </div>

            {/* List of Resumes */}
            <div className="space-y-4">
              {resumes.map((res) => (
                <div
                  key={res.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    res.isDefault
                      ? "border-emerald-500/50 bg-emerald-500/5 shadow-xs"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          res.isDefault
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-[var(--primary)]/10 text-[var(--primary)]"
                        }`}
                      >
                        <FileText size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[var(--foreground)] truncate">
                            {res.name}
                          </h3>
                          {res.isDefault ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                              <Star size={10} className="fill-current" /> Default for Easy Apply
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultResume(res.id)}
                              className="text-[11px] text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {res.fileName} • {res.fileSize} • Uploaded {new Date(res.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] text-xs font-semibold flex items-center gap-1"
                        title="View / Download"
                      >
                        <Download size={14} />
                        <span className="hidden sm:inline">View</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveResumeVersion(res.id)}
                        className="p-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                        title="Remove resume"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {res.skills && res.skills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]/60 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[var(--muted-foreground)] mr-1">
                        Parsed Skills:
                      </span>
                      {res.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--foreground)] text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal to Upload New Resume Version */}
            <AnimatePresence>
              {showAddResumeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl"
                  >
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                      Upload New Resume Version
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-4">
                      Give this version a descriptive title (e.g. "Full Stack Developer" or "Engineering Manager") then select your document.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                          Resume Version Label
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. React Frontend Specialist"
                          value={newResumeTitle}
                          onChange={(e) => setNewResumeTitle(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>

                      <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-6 text-center hover:border-[var(--primary)] transition-colors">
                        <Upload size={28} className="mx-auto text-[var(--primary)] mb-2" />
                        <p className="text-xs font-bold text-[var(--foreground)] mb-1">
                          Select PDF or DOCX Document
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)] mb-3">
                          Max size 5 MB
                        </p>
                        <input
                          type="file"
                          id="modal-resume-file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleResumeFileUpload}
                        />
                        <label
                          htmlFor="modal-resume-file"
                          className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer inline-block shadow-sm"
                        >
                          Browse Files
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAddResumeModal(false)
                            setNewResumeTitle("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
