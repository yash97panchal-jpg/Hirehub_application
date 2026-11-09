import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Briefcase,
  Bell,
  Shield,
  Lock,
  ArrowLeft,
  Save,
  Check,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Smartphone,
  Download,
  Trash2,
  AlertTriangle,
  Globe,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Laptop,
  CheckCircle2,
  KeyRound,
  FileText,
  LogOut,
  Upload,
  Camera,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import CustomSelect from "../components/ui/CustomSelect"
import { useAuthStore } from "../store/authStore"
import { useThemeStore } from "../store/themeStore"
import { useSavedJobsStore } from "../store/savedJobsStore"
import { authService } from "../lib/supabase"
import toast from "react-hot-toast"

type SettingsTab = "account" | "preferences" | "notifications" | "security" | "privacy"

interface PreferencesState {
  jobStatus: "actively_looking" | "open_to_offers" | "not_looking"
  targetRole: string
  minSalary: number
  salaryCurrency: string
  preferredTypes: string[]
  preferredLocation: string
  willingToRelocate: boolean
  emailAlerts: boolean
  alertFrequency: "instant" | "daily" | "weekly"
  appUpdates: boolean
  recruiterMessages: boolean
  newsletter: boolean
  browserNotifs: boolean
  visibility: "public" | "applied_only" | "private"
  hideCurrentCompany: boolean
  currentCompany: string
  twoFactorEnabled: boolean
}

const defaultPreferences: PreferencesState = {
  jobStatus: "actively_looking",
  targetRole: "Senior Frontend Engineer",
  minSalary: 130000,
  salaryCurrency: "USD",
  preferredTypes: ["Full-time", "Remote"],
  preferredLocation: "San Francisco, CA or Remote",
  willingToRelocate: true,
  emailAlerts: true,
  alertFrequency: "daily",
  appUpdates: true,
  recruiterMessages: true,
  newsletter: false,
  browserNotifs: true,
  visibility: "public",
  hideCurrentCompany: true,
  currentCompany: "Microsoft",
  twoFactorEnabled: false,
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { savedJobIds } = useSavedJobsStore()

  const [activeTab, setActiveTab] = useState<SettingsTab>("account")

  // User Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "Alex Johnson",
    email: user?.email || "alex.johnson@hirehub.app",
    headline: user?.headline || "Senior Frontend & Full Stack Developer",
    phone: user?.phone || "+1 (555) 349-2041",
    location: user?.location || "San Francisco, CA",
    about:
      user?.about ||
      "Passionate software engineer building high-performance, accessible, and intuitive digital experiences.",
    avatar:
      user?.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&auto=format",
  })

  // Extended Preferences State (persisted to localStorage)
  const [prefs, setPrefs] = useState<PreferencesState>(() => {
    try {
      const saved = localStorage.getItem("hirehub_user_settings")
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences
    } catch {
      return defaultPreferences
    }
  })

  // Password Security Form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  // Sync profileForm when user loads or updates
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        headline: user.headline || prev.headline,
        location: user.location || prev.location,
        phone: user.phone || prev.phone,
        about: user.about || prev.about,
      }))
    }
  }, [user])

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileForm((prev) => ({ ...prev, avatar: result }))
        updateUser({ avatar: result })
        toast.success("Profile picture updated!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setProfileForm((prev) => ({ ...prev, avatar: "" }))
    updateUser({ avatar: "" })
    toast.success("Profile picture removed.")
  }

  // Save profile to store & notify
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileForm.name.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    updateUser({
      name: profileForm.name,
      email: profileForm.email,
      headline: profileForm.headline,
      location: profileForm.location,
      phone: profileForm.phone,
      about: profileForm.about,
      avatar: profileForm.avatar,
    })
    toast.success("Profile updated successfully!")
  }

  // Save preferences to localStorage
  const handleSavePreferences = () => {
    localStorage.setItem("hirehub_user_settings", JSON.stringify(prefs))
    toast.success("Job search preferences saved!")
  }

  // Save notifications
  const handleSaveNotifications = () => {
    localStorage.setItem("hirehub_user_settings", JSON.stringify(prefs))
    toast.success("Notification preferences updated!")
  }

  // Save privacy
  const handleSavePrivacy = () => {
    localStorage.setItem("hirehub_user_settings", JSON.stringify(prefs))
    toast.success("Privacy preferences updated!")
  }

  // Password update handler
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error("Please enter your current password")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    toast.success("Password changed successfully!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  // Download user data export
  const handleExportData = () => {
    const exportData = {
      userProfile: user || profileForm,
      preferences: prefs,
      savedJobIds,
      exportedAt: new Date().toISOString(),
      platform: "HireHub Global Portal",
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hirehub-account-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Your data export has downloaded!")
  }

  // Account deletion (removes all server data from profiles, applications, and storage)
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to permanently delete your HireHub account? All applications, uploaded resumes, and profile data will be permanently wiped from the server.",
    )
    if (!confirmed) return

    if (user?.id) {
      try {
        await authService.deleteAccount(user.id)
      } catch (err: any) {
        console.error("Error executing server deletion:", err)
      }
    }

    localStorage.removeItem("hirehub_user_settings")
    localStorage.removeItem("hirehub-saved-jobs-v1")
    logout()
    toast.success("Your HireHub account and personal data have been permanently erased.")
    navigate("/")
  }

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "account", label: "Account & Profile", icon: User },
    { id: "preferences", label: "Job Preferences", icon: Briefcase },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Log In", icon: Shield },
    { id: "privacy", label: "Privacy & Data", icon: Lock },
  ]

  const employmentTypes = ["Full-time", "Part-time", "Remote", "Contract", "Internship", "Hybrid"]

  return (
    <div className="min-h-screen bg-[var(--background)] pt-20 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 -ml-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1.5" /> Back
            </Button>
            <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
              Settings & Preferences
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Manage your personal credentials, job search targets, notification rules, and security.
            </p>
          </div>

          {/* Controls: Theme Toggle & Sign Out */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout()
                toast.success("Logged out successfully.")
                navigate("/")
              }}
              className="text-red-500 border-red-500/30 hover:bg-red-500/10 font-bold text-xs"
            >
              <LogOut size={14} className="mr-1" /> Log Out
            </Button>

            <div className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] p-1.5 rounded-2xl shadow-xs">
              <span className="text-xs font-semibold text-[var(--muted-foreground)] px-2.5">
                Theme:
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
              >
                {theme === "dark" ? (
                  <>
                    <Moon size={14} className="text-[var(--primary)]" /> Dark Mode
                  </>
                ) : (
                  <>
                    <Sun size={14} className="text-amber-500" /> Light Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Tabs Sidebar + Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-2 shadow-xs sticky top-24 flex lg:flex-col overflow-x-auto gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal w-full ${
                      isActive
                        ? "bg-[var(--primary)] text-white dark:text-[#12051B] font-semibold shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* TAB 1: ACCOUNT & PROFILE */}
              {activeTab === "account" && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <h2 className="font-poppins text-lg font-bold text-[var(--foreground)] mb-1">
                      Personal Profile Information
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6">
                      Your public identity displayed to employers and recruiters.
                    </p>

                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      {/* Avatar preview and file actions */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-[var(--border)]">
                        <input
                          type="file"
                          id="settings-avatar-upload"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          className="hidden"
                          onChange={handleAvatarFileUpload}
                        />
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[var(--muted)] flex items-center justify-center ring-2 ring-[var(--primary)]/30 shrink-0">
                          {profileForm.avatar ? (
                            <img
                              src={profileForm.avatar}
                              alt={profileForm.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-black text-[var(--primary)]">
                              {profileForm.name.charAt(0).toUpperCase() || "U"}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-1.5">
                          <label className="block text-xs font-bold text-[var(--foreground)]">
                            Profile Picture
                          </label>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            Upload a JPG, PNG or WEBP file from your device.
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <label
                              htmlFor="settings-avatar-upload"
                              className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <Upload size={13} />
                              <span>Upload Picture</span>
                            </label>

                            {profileForm.avatar && (
                              <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                <Trash2 size={13} />
                                <span>Remove Picture</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, name: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, email: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                        </div>
                      </div>

                      {/* Professional Headline */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                          Professional Headline
                        </label>
                        <input
                          type="text"
                          value={profileForm.headline}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, headline: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="e.g. Senior Frontend Engineer | React & TypeScript"
                        />
                      </div>

                      {/* Location & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                            />
                            <input
                              type="text"
                              value={profileForm.location}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, location: e.target.value })
                              }
                              className="w-full pl-9 pr-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                              placeholder="City, Country"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                            />
                            <input
                              type="text"
                              value={profileForm.phone}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, phone: e.target.value })
                              }
                              className="w-full pl-9 pr-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* About Bio */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                          About & Summary
                        </label>
                        <textarea
                          rows={3}
                          value={profileForm.about}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, about: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                          placeholder="Brief overview of your career and key technical strengths..."
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button variant="primary" size="md" type="submit">
                          <Save size={16} className="mr-2" />
                          Save Profile Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: JOB SEARCH PREFERENCES */}
              {activeTab === "preferences" && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <h2 className="font-poppins text-lg font-bold text-[var(--foreground)] mb-1">
                      Job Search Status & Target Criteria
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6">
                      Let employers know if you are looking and what roles align with your goals.
                    </p>

                    <div className="space-y-6">
                      {/* Search Status Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-2">
                          Current Career Status
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              id: "actively_looking",
                              title: "Actively Looking",
                              desc: "Ready for interviews immediately",
                              badge: "Priority",
                            },
                            {
                              id: "open_to_offers",
                              title: "Open to Offers",
                              desc: "Casual explorer for right role",
                              badge: "Flexible",
                            },
                            {
                              id: "not_looking",
                              title: "Not Looking",
                              desc: "Hide from candidate searches",
                              badge: "Paused",
                            },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setPrefs({
                                  ...prefs,
                                  jobStatus: item.id as PreferencesState["jobStatus"],
                                })
                              }
                              className={`p-4 rounded-xl border text-left transition-all ${
                                prefs.jobStatus === item.id
                                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] ring-1 ring-[var(--primary)]"
                                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-[var(--foreground)]">
                                  {item.title}
                                </span>
                                {prefs.jobStatus === item.id && (
                                  <CheckCircle2 size={16} className="text-[var(--primary)]" />
                                )}
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Target Role & Compensation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                            Target Job Role
                          </label>
                          <input
                            type="text"
                            value={prefs.targetRole}
                            onChange={(e) => setPrefs({ ...prefs, targetRole: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="e.g. Lead Frontend Architect"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                            Minimum Expected Salary (Annual)
                          </label>
                          <div className="flex gap-2">
                            <CustomSelect
                              value={prefs.salaryCurrency}
                              onChange={(val) =>
                                setPrefs({ ...prefs, salaryCurrency: String(val) })
                              }
                              options={[
                                { value: "USD", label: "USD ($)" },
                                { value: "EUR", label: "EUR (€)" },
                                { value: "GBP", label: "GBP (£)" },
                                { value: "INR", label: "INR (₹)" },
                                { value: "CAD", label: "CAD (CA$)" },
                                { value: "AUD", label: "AUD (AU$)" },
                                { value: "SGD", label: "SGD (S$)" },
                              ]}
                              className="w-32 shrink-0"
                            />
                            <input
                              type="number"
                              step="5000"
                              value={prefs.minSalary}
                              onChange={(e) =>
                                setPrefs({ ...prefs, minSalary: Number(e.target.value) })
                              }
                              className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preferred Employment Types */}
                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-2">
                          Preferred Employment Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {employmentTypes.map((type) => {
                            const selected = prefs.preferredTypes.includes(type)
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  const updated = selected
                                    ? prefs.preferredTypes.filter((t) => t !== type)
                                    : [...prefs.preferredTypes, type]
                                  setPrefs({ ...prefs, preferredTypes: updated })
                                }}
                                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                                  selected
                                    ? "bg-[var(--primary)] text-white dark:text-[#12051B] font-bold shadow-xs"
                                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                }`}
                              >
                                {selected ? `✓ ${type}` : `+ ${type}`}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Target Location & Relocation */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                            Target Cities or Workplaces
                          </label>
                          <input
                            type="text"
                            value={prefs.preferredLocation}
                            onChange={(e) =>
                              setPrefs({ ...prefs, preferredLocation: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="e.g. San Francisco, New York, or Worldwide Remote"
                          />
                        </div>

                        <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prefs.willingToRelocate}
                            onChange={(e) =>
                              setPrefs({ ...prefs, willingToRelocate: e.target.checked })
                            }
                            className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                          />
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            Willing to relocate for the right role
                          </span>
                        </label>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button variant="primary" size="md" onClick={handleSavePreferences}>
                          <Save size={16} className="mr-2" />
                          Save Job Preferences
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: NOTIFICATIONS & ALERTS */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <h2 className="font-poppins text-lg font-bold text-[var(--foreground)] mb-1">
                      Notification Preferences
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6">
                      Customize when and how you receive alerts about jobs and application updates.
                    </p>

                    <div className="space-y-4">
                      {/* Job alerts */}
                      <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--foreground)]">
                            Job Match Alerts
                          </h3>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            Get notified when new jobs match your target titles and required skills.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefs.emailAlerts}
                          onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })}
                          className="w-5 h-5 rounded text-[var(--primary)] accent-[var(--primary)] cursor-pointer mt-0.5"
                        />
                      </div>

                      {/* Frequency */}
                      {prefs.emailAlerts && (
                        <div className="ml-4 pl-4 border-l-2 border-[var(--primary)] space-y-2">
                          <label className="block text-xs font-semibold text-[var(--foreground)]">
                            Alert Frequency
                          </label>
                          <div className="flex gap-2">
                            {(["instant", "daily", "weekly"] as const).map((freq) => (
                              <button
                                key={freq}
                                type="button"
                                onClick={() => setPrefs({ ...prefs, alertFrequency: freq })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                                  prefs.alertFrequency === freq
                                    ? "bg-[var(--primary)] text-white dark:text-[#12051B] font-bold"
                                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)]"
                                }`}
                              >
                                {freq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Application updates */}
                      <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--foreground)]">
                            Application Status Changes
                          </h3>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            Real-time alerts when employers view, shortlist, or schedule interviews.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefs.appUpdates}
                          onChange={(e) => setPrefs({ ...prefs, appUpdates: e.target.checked })}
                          className="w-5 h-5 rounded text-[var(--primary)] accent-[var(--primary)] cursor-pointer mt-0.5"
                        />
                      </div>

                      {/* Recruiter inquiries */}
                      <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--foreground)]">
                            Recruiter Inquiries
                          </h3>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            Receive notifications when verified hiring managers review your resume.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefs.recruiterMessages}
                          onChange={(e) =>
                            setPrefs({ ...prefs, recruiterMessages: e.target.checked })
                          }
                          className="w-5 h-5 rounded text-[var(--primary)] accent-[var(--primary)] cursor-pointer mt-0.5"
                        />
                      </div>

                      {/* Browser push notifications */}
                      <div className="flex items-start justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--foreground)]">
                            Browser Push Notifications
                          </h3>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            Show desktop notifications when active on HireHub.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={prefs.browserNotifs}
                          onChange={(e) =>
                            setPrefs({ ...prefs, browserNotifs: e.target.checked })
                          }
                          className="w-5 h-5 rounded text-[var(--primary)] accent-[var(--primary)] cursor-pointer mt-0.5"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button variant="primary" size="md" onClick={handleSaveNotifications}>
                          <Save size={16} className="mr-2" />
                          Save Notification Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SECURITY & LOGIN */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Change Password Form */}
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <h2 className="font-poppins text-lg font-bold text-[var(--foreground)] mb-1">
                      Change Account Password
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6">
                      Ensure your account is protected with a strong, distinct password.
                    </p>

                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3.5 pr-10 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3.5 pr-10 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="At least 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {newPassword && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <div
                              className={`h-1.5 flex-1 rounded-full ${
                                newPassword.length >= 8
                                  ? "bg-green-500"
                                  : newPassword.length >= 6
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                              {newPassword.length >= 8
                                ? "Strong"
                                : newPassword.length >= 6
                                  ? "Moderate"
                                  : "Weak"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Re-enter new password"
                        />
                      </div>

                      <Button variant="primary" size="md" type="submit">
                        <KeyRound size={16} className="mr-2" />
                        Update Password
                      </Button>
                    </form>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-base text-[var(--foreground)]">
                          Two-Factor Authentication (2FA)
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          Add an extra layer of protection using Google Authenticator or SMS codes.
                        </p>
                      </div>
                      <Button
                        variant={prefs.twoFactorEnabled ? "outline" : "primary"}
                        size="sm"
                        onClick={() => {
                          const next = !prefs.twoFactorEnabled
                          setPrefs({ ...prefs, twoFactorEnabled: next })
                          localStorage.setItem(
                            "hirehub_user_settings",
                            JSON.stringify({ ...prefs, twoFactorEnabled: next }),
                          )
                          toast.success(
                            next
                              ? "2FA enabled for your account!"
                              : "2FA disabled for your account.",
                          )
                        }}
                      >
                        {prefs.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                      </Button>
                    </div>
                  </div>

                  {/* Active Log In Sessions */}
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <h3 className="font-semibold text-base text-[var(--foreground)] mb-1">
                      Active Log In Sessions
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mb-4">
                      Devices currently authorized and logged into your account.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <div className="flex items-center gap-3">
                          <Laptop size={20} className="text-[var(--primary)]" />
                          <div>
                            <p className="text-xs font-bold text-[var(--foreground)]">
                              Current Web Browser (Chrome on Windows)
                            </p>
                            <p className="text-[11px] text-[var(--muted-foreground)]">
                              Active now · Local IP 127.0.0.1
                            </p>
                          </div>
                        </div>
                        <Badge variant="success">This Device</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        <div className="flex items-center gap-3">
                          <Smartphone size={20} className="text-[var(--muted-foreground)]" />
                          <div>
                            <p className="text-xs font-bold text-[var(--foreground)]">
                              HireHub Mobile (iPhone 15 Pro)
                            </p>
                            <p className="text-[11px] text-[var(--muted-foreground)]">
                              Last active 3 hours ago · San Francisco, USA
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.success("Signed out of mobile session")}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: PRIVACY & DATA */}
              {activeTab === "privacy" && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <h2 className="font-poppins text-lg font-bold text-[var(--foreground)] mb-1">
                      Profile Privacy & Employer Visibility
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)] mb-6">
                      Control who can search your profile and contact you on the platform.
                    </p>

                    <div className="space-y-5">
                      {/* Visibility Radios */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-[var(--foreground)]">
                          Recruiter Search Visibility
                        </label>

                        {[
                          {
                            id: "public",
                            title: "Public to All Verified Employers",
                            desc: "Recommended: Maximizes inbound interview requests and recruiter reach.",
                          },
                          {
                            id: "applied_only",
                            title: "Only Companies I Apply To",
                            desc: "Your profile is private except to companies where you submit an application.",
                          },
                          {
                            id: "private",
                            title: "Private / Anonymous Mode",
                            desc: "Hide your profile entirely from search results.",
                          },
                        ].map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              prefs.visibility === item.id
                                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                                : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="visibility"
                              checked={prefs.visibility === item.id}
                              onChange={() =>
                                setPrefs({
                                  ...prefs,
                                  visibility: item.id as PreferencesState["visibility"],
                                })
                              }
                              className="mt-0.5 text-[var(--primary)] accent-[var(--primary)]"
                            />
                            <div>
                              <p className="text-xs font-bold text-[var(--foreground)]">
                                {item.title}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Current company block */}
                      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <span className="text-sm font-semibold text-[var(--foreground)] block">
                              Hide Profile from Current Employer
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              Block recruiters from your current workplace from discovering your profile.
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={prefs.hideCurrentCompany}
                            onChange={(e) =>
                              setPrefs({ ...prefs, hideCurrentCompany: e.target.checked })
                            }
                            className="w-5 h-5 rounded text-[var(--primary)] accent-[var(--primary)]"
                          />
                        </label>

                        {prefs.hideCurrentCompany && (
                          <div>
                            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                              Current Company Name
                            </label>
                            <input
                              type="text"
                              value={prefs.currentCompany}
                              onChange={(e) =>
                                setPrefs({ ...prefs, currentCompany: e.target.value })
                              }
                              className="w-full px-3.5 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                              placeholder="e.g. Current Company Inc."
                            />
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button variant="primary" size="md" onClick={handleSavePrivacy}>
                          <Save size={16} className="mr-2" />
                          Save Privacy Settings
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Data Export (GDPR) */}
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-base text-[var(--foreground)] flex items-center gap-2">
                          <Download size={18} className="text-[var(--primary)]" />
                          Download Account Data
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 max-w-md">
                          Export a machine-readable JSON archive of your profile credentials, saved jobs, and configuration.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleExportData}>
                        <FileText size={15} className="mr-1.5" />
                        Download Data (.JSON)
                      </Button>
                    </div>
                  </div>

                  {/* Session & Sign Out */}
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-base text-[var(--foreground)] flex items-center gap-2">
                          <LogOut size={18} className="text-red-500" />
                          Session & Sign Out
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 max-w-md">
                          Sign out of your active HireHub account on this device. You will need to log back in to access your dashboard.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          logout()
                          toast.success("Logged out successfully.")
                          navigate("/")
                        }}
                        className="text-red-500 border-red-500/30 hover:bg-red-500/10 font-bold"
                      >
                        <LogOut size={15} className="mr-1.5" />
                        Log Out of Account
                      </Button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-500/5 dark:bg-red-950/20 rounded-2xl border border-red-500/20 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle size={18} />
                          Delete Account
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 max-w-md">
                          Permanently delete your profile, applications, saved jobs, and credentials. This action cannot be reversed.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteAccount}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-xs"
                      >
                        <Trash2 size={15} className="mr-1.5" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
