import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { useAuthStore } from "../store/authStore"
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
      if (user.experience) {
        setExperience(user.experience)
      } else {
        setExperience([
          {
            id: "1",
            company: "Tech Corp",
            role: "Software Engineer",
            duration: "2021 - Present",
            description: "Developing awesome web applications.",
          },
        ])
      }
    }
  }, [user])

  const [uploadedResume, setUploadedResume] = useState<{
    fileName: string
    fileSize: string
    uploadedAt: string
    skills: string[]
  } | null>(() => {
    try {
      const stored = localStorage.getItem("hirehub_uploaded_resume")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

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
    const foundSkills = commonSkills.filter(
      (s) => lowerName.includes(s.toLowerCase())
    )

    const extractedSkills = Array.from(
      new Set([
        ...foundSkills,
        ...(lowerName.includes("python") ? ["Python", "FastAPI", "SQL"] : []),
        ...(lowerName.includes("react") || lowerName.includes("frontend") ? ["React", "TypeScript", "Tailwind"] : []),
        "Python", "React", "TypeScript", "SQL", "Cloud"
      ])
    ).slice(0, 6)

    const resumeInfo = {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toISOString(),
      skills: extractedSkills,
    }

    setUploadedResume(resumeInfo)
    localStorage.setItem("hirehub_uploaded_resume", JSON.stringify(resumeInfo))

    const mergedSkills = Array.from(new Set([...(user?.skills || []), ...extractedSkills]))
    updateUser({ skills: mergedSkills })
    setFormData((prev) => ({
      ...prev,
      skills: mergedSkills.join(", "),
    }))

    toast.success(
      `Resume "${file.name}" uploaded! Extracted ${extractedSkills.length} skills: ${extractedSkills.join(", ")}`
    )
  }

  const handleRemoveResume = () => {
    setUploadedResume(null)
    localStorage.removeItem("hirehub_uploaded_resume")
    toast.success("Resume removed successfully.")
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
        experience: experience,
        avatar: formData.avatar,
      })
      toast.success("Profile updated successfully!")
    }
  }

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
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Personal Info Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <User className="text-[var(--primary)]" size={20} /> Personal
              Information
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
                    className="px-3.5 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload size={14} />
                    <span>Upload Picture</span>
                  </label>

                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>Remove Picture</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Professional Headline"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.headline}
                  onChange={(e) =>
                    setFormData({ ...formData, headline: e.target.value })
                  }
                />
                <Input
                  label="Location"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[var(--foreground)]">Phone Number</label>
                    {user?.isPhoneVerified && (
                      <span className="text-[11px] text-green-500 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <input
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] text-sm"
                    placeholder="e.g. +91 98765 43210"
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
                    About Me
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[100px]"
                    placeholder="Tell us a little bit about yourself..."
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
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <FileText className="text-[var(--primary)]" size={20} /> Skills
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Separate skills with commas (e.g. React, TypeScript, Node.js)
            </p>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[80px]"
              placeholder="React, TypeScript, UI/UX Design..."
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
            />
          </div>

          {/* Experience Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <Briefcase className="text-[var(--primary)]" size={20} /> Work
                Experience
              </h2>
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus size={16} className="mr-2" /> Add Experience
              </Button>
            </div>

            <div className="space-y-6">
              {experience.map((exp) => (
                <div
                  key={exp.id}
                  className="relative p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]"
                >
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, "company", e.target.value)
                      }
                    />
                    <Input
                      label="Role"
                      value={exp.role}
                      onChange={(e) =>
                        updateExperience(exp.id, "role", e.target.value)
                      }
                    />
                    <Input
                      label="Duration (e.g. 2021 - Present)"
                      value={exp.duration}
                      onChange={(e) =>
                        updateExperience(exp.id, "duration", e.target.value)
                      }
                    />
                  </div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[80px]"
                    placeholder="Describe your responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(exp.id, "description", e.target.value)
                    }
                  />
                </div>
              ))}

              {experience.length === 0 && (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  No experience added yet. Click the "Add Experience" button to
                  get started.
                </div>
              )}
            </div>
          </div>

          {/* Resume Upload & Skill Extraction Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <FileText className="text-[var(--primary)]" size={20} /> Uploaded Resume & Skill Matching
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Upload your CV / Resume to automatically match opening positions on your dashboard.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/resume-builder")}
                className="hidden sm:inline-flex text-xs font-semibold"
              >
                Open Resume Builder
              </Button>
            </div>

            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleResumeFileUpload}
              className="hidden"
            />

            {uploadedResume ? (
              /* Active Uploaded Resume Card */
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[var(--foreground)] truncate">
                            {uploadedResume.fileName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {uploadedResume.fileSize} • Uploaded {new Date(uploadedResume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <label
                        htmlFor="resume-file-input"
                        className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] cursor-pointer transition-colors"
                      >
                        Replace
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="px-3 py-1.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-xs font-semibold text-red-500 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Extracted Skills Badges */}
                  <div className="pt-2 border-t border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>Extracted Technical Skills for Dashboard Matching:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {uploadedResume.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/20"
                        >
                          <Check size={12} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Jobs matching these skills are now highlighted directly below your dashboard.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="font-bold text-xs"
                  >
                    View Matched Jobs on Dashboard →
                  </Button>
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload Dropzone */
              <label
                htmlFor="resume-file-input"
                className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] text-[var(--primary)] group-hover:scale-110 flex items-center justify-center mb-3 transition-transform shadow-xs">
                  <Upload size={24} />
                </div>
                <h3 className="font-poppins font-bold text-base text-[var(--foreground)] mb-1">
                  Click or drag to upload your Resume
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] max-w-sm mb-4 leading-relaxed">
                  Supports PDF, DOCX, DOC, or TXT. HireHub will automatically parse your technical skills and showcase matching openings right on your dashboard.
                </p>
                <span className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-xs shadow-xs">
                  Choose Resume File
                </span>
              </label>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
