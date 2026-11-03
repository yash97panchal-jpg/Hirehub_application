import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import { useJobStore } from "../../store/jobStore"

const steps = ["Job Details", "Requirements", "Preview & Publish"]

export default function PostJob() {
  const navigate = useNavigate()
  const { addJob } = useJobStore()
  const [currentStep, setCurrentStep] = useState(0)

  const [formData, setFormData] = useState({
    title: "",
    type: "Full-time",
    location: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    benefits: "",
  })

  const nextStep = () =>
    setCurrentStep((p) => Math.min(p + 1, steps.length - 1))
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0))

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
            Post a Job
          </h1>
          <Button variant="primary">
            <Save size={16} className="mr-2" /> Save Draft
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    index <= currentStep
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {index < currentStep ? <CheckCircle size={20} /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-2 ${
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
                  className={`w-20 sm:w-32 h-1 mx-2 -mt-6 ${
                    index < currentStep
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--muted)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 md:p-8 shadow-sm"
        >
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Job Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Job Type
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <Input
                  label="Location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Input
                    label="Min Salary ($)"
                    placeholder="80,000"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMin: e.target.value })
                    }
                  />
                  <Input
                    label="Max Salary ($)"
                    placeholder="120,000"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMax: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Job Description
                </label>
                <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="bg-[var(--muted)] p-2 flex gap-2 border-b border-[var(--border)]">
                    <button className="p-1 hover:bg-[var(--background)] rounded">
                      <b>B</b>
                    </button>
                    <button className="p-1 hover:bg-[var(--background)] rounded">
                      <i>I</i>
                    </button>
                    <button className="p-1 hover:bg-[var(--background)] rounded">
                      <u>U</u>
                    </button>
                  </div>
                  <textarea
                    className="w-full p-4 bg-[var(--background)] text-[var(--foreground)] focus:outline-none resize-y min-h-[150px]"
                    placeholder="Describe the role..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Requirements & Benefits
              </h2>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Key Requirements
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[120px]"
                  placeholder="List the required skills and experience..."
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Benefits
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[120px]"
                  placeholder="What perks do you offer?"
                  value={formData.benefits}
                  onChange={(e) =>
                    setFormData({ ...formData, benefits: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Preview
              </h2>
              <div className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--muted)]/30">
                <h3 className="text-2xl font-bold text-[var(--foreground)]">
                  {formData.title || "Untitled Job"}
                </h3>
                <p className="text-[var(--muted-foreground)] mt-1">
                  {formData.type} · {formData.location}
                </p>

                <div className="mt-6 prose dark:prose-invert max-w-none">
                  <h4>Description</h4>
                  <p>{formData.description || "No description provided."}</p>

                  <h4>Requirements</h4>
                  <p>{formData.requirements || "No requirements listed."}</p>

                  <h4>Benefits</h4>
                  <p>{formData.benefits || "No benefits listed."}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button variant="primary" onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  const newJob: any = {
                    id: Math.random().toString(36).substring(7),
                    title: formData.title || "Untitled Job",
                    type: formData.type as any,
                    location: formData.location || "Location not specified",
                    salaryMin: Number(formData.salaryMin) || 0,
                    salaryMax: Number(formData.salaryMax) || 0,
                    currency: "USD",
                    description: formData.description,
                    requirements: [formData.requirements],
                    benefits: [formData.benefits],
                    company: {
                      id: "my-company",
                      name: "My Company",
                      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=80&h=80&fit=crop&auto=format",
                      banner: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop&auto=format",
                      about: "We are a great company.",
                      industry: "Technology",
                      size: "1-10",
                      location: "Remote",
                      rating: 5.0,
                      reviewCount: 1,
                      jobCount: 1,
                      isVerified: true
                    },
                    isRemote: formData.location.toLowerCase().includes("remote"),
                    isFeatured: false,
                    isUrgent: false,
                    applicationCount: 0,
                    postedAt: new Date().toISOString().split("T")[0],
                    status: "active",
                    category: "Engineering",
                    experience: "1-3 years",
                    skills: []
                  }
                  addJob(newJob)
                  toast.success("Job posted successfully!")
                  navigate("/recruiter")
                }}
              >
                Publish Job
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
