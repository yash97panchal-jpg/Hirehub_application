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
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
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
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">
          Please log in to view your profile.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save size={16} className="mr-2" /> Save Changes
          </Button>
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

            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="flex-shrink-0 relative">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="avatar-upload"
                  className="w-32 h-32 rounded-full bg-[var(--muted)] flex items-center justify-center relative overflow-hidden group cursor-pointer block border-2 border-[var(--border)]"
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-[var(--primary)] font-bold">
                      {formData.name.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                    <Camera className="text-white" size={24} />
                  </div>
                </label>
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

          {/* Resume Versions Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <FileText className="text-[var(--primary)]" size={20} /> Resume
              Versions
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--primary)]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      Software Engineer Resume
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Updated 2 days ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/resume-builder")}
                  >
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--primary)]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      Frontend Developer Resume
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Updated 1 week ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/resume-builder")}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
