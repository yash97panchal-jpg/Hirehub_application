import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import CustomSelect from "../components/ui/CustomSelect"
import toast from "react-hot-toast"

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Form State
  const [personal, setPersonal] = useState({ phone: "", location: "", bio: "" })
  const [education, setEducation] = useState({
    degree: "",
    university: "",
    gradYear: "",
  })
  const [skillsData, setSkillsData] = useState({
    field: "",
    skills: "",
    certificates: "",
  })
  const [preferences, setPreferences] = useState({
    jobType: "Full-time",
    interestedRoles: "",
  })

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleComplete = () => {
    toast.success("Profile setup complete! Welcome to HireHub.", {
      duration: 4000,
    })
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[var(--foreground)] font-poppins">
              Complete Your Profile
            </h1>
            <span className="text-sm font-medium text-[var(--muted-foreground)]">
              Step {step} of 4
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[var(--muted)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[var(--primary)] h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Personal Details
                </h2>
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={personal.phone}
                  onChange={(e) =>
                    setPersonal({ ...personal, phone: e.target.value })
                  }
                />
                <Input
                  label="Location"
                  placeholder="City, Country"
                  value={personal.location}
                  onChange={(e) =>
                    setPersonal({ ...personal, location: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Short Bio
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] resize-none"
                    rows={3}
                    placeholder="Tell us a little about yourself..."
                    value={personal.bio}
                    onChange={(e) =>
                      setPersonal({ ...personal, bio: e.target.value })
                    }
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Education Background
                </h2>
                <Input
                  label="Highest Degree"
                  placeholder="e.g. B.S. Computer Science"
                  value={education.degree}
                  onChange={(e) =>
                    setEducation({ ...education, degree: e.target.value })
                  }
                />
                <Input
                  label="University / Institution"
                  placeholder="e.g. Stanford University"
                  value={education.university}
                  onChange={(e) =>
                    setEducation({ ...education, university: e.target.value })
                  }
                />
                <Input
                  label="Graduation Year"
                  placeholder="e.g. 2024"
                  type="number"
                  value={education.gradYear}
                  onChange={(e) =>
                    setEducation({ ...education, gradYear: e.target.value })
                  }
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Skills & Certifications
                </h2>
                <Input
                  label="Primary Field"
                  placeholder="e.g. Software Engineering, Marketing"
                  value={skillsData.field}
                  onChange={(e) =>
                    setSkillsData({ ...skillsData, field: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Skills (comma separated)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] resize-none"
                    rows={2}
                    placeholder="React, Python, Project Management..."
                    value={skillsData.skills}
                    onChange={(e) =>
                      setSkillsData({ ...skillsData, skills: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="Certificates (optional)"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={skillsData.certificates}
                  onChange={(e) =>
                    setSkillsData({
                      ...skillsData,
                      certificates: e.target.value,
                    })
                  }
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                  Job Preferences
                </h2>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Interested Job Type
                  </label>
                  <CustomSelect
                    value={preferences.jobType}
                    onChange={(val) =>
                      setPreferences({
                        ...preferences,
                        jobType: String(val),
                      })
                    }
                    options={["Full-time", "Part-time", "Contract", "Internship", "Freelance"]}
                    size="lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Roles Interested In
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] resize-none"
                    rows={3}
                    placeholder="e.g. Frontend Developer, UI Designer..."
                    value={preferences.interestedRoles}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        interestedRoles: e.target.value,
                      })
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-between pt-6 border-t border-[var(--border)]">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <Button variant="primary" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button variant="primary" onClick={handleComplete}>
              Complete Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
