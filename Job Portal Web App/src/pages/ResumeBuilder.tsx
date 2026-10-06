import React, { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Printer, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"

interface Experience {
  id: string
  company: string
  role: string
  dates: string
  description: string
}

interface Education {
  id: string
  school: string
  degree: string
  dates: string
}

export default function ResumeBuilder() {
  const navigate = useNavigate()

  const [personal, setPersonal] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    linkedin: "linkedin.com/in/johndoe",
    summary: "Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success.",
  })

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: "1",
      company: "Tech Corp",
      role: "Senior Developer",
      dates: "2020 - Present",
      description: "Led a team of 5 engineers to deliver scalable web applications. Improved performance by 40%.",
    }
  ])

  const [education, setEducation] = useState<Education[]>([
    {
      id: "1",
      school: "University of Technology",
      degree: "B.S. Computer Science",
      dates: "2016 - 2020",
    }
  ])

  const [skills, setSkills] = useState("JavaScript, React, Node.js, TypeScript, Python")

  const handlePrint = () => {
    window.print()
  }

  const addExperience = () => {
    setExperience([...experience, { id: Date.now().toString(), company: "", role: "", dates: "", description: "" }])
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp))
  }

  const removeExperience = (id: string) => {
    setExperience(experience.filter(exp => exp.id !== id))
  }

  const addEducation = () => {
    setEducation([...education, { id: Date.now().toString(), school: "", degree: "", dates: "" }])
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu))
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id))
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 print:pt-0 print:pb-0 print:bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 print:px-0 print:max-w-none">
        
        {/* Header - Hidden when printing */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)] hidden sm:block">
              Resume Builder
            </h1>
            <Button variant="primary" onClick={handlePrint}>
              <Printer size={16} className="mr-2" /> Print / Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:gap-0">
          
          {/* Form Editor - Hidden when printing */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm overflow-y-auto max-h-[80vh] print:hidden space-y-8"
          >
            {/* Personal Details */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)] border-b border-[var(--border)] pb-2">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} />
                <Input label="Email" type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                <Input label="Phone" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
                <Input label="LinkedIn/Website" value={personal.linkedin} onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })} />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Professional Summary</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[100px]"
                  value={personal.summary}
                  onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                />
              </div>
            </section>

            {/* Experience */}
            <section>
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-2">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Work Experience</h2>
                <button onClick={addExperience} className="text-sm text-[var(--primary)] hover:underline flex items-center">
                  <Plus size={14} className="mr-1"/> Add
                </button>
              </div>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={exp.id} className="relative p-4 border border-[var(--border)] rounded-xl bg-[var(--background)]">
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                      <Input label="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                      <Input label="Role" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                      <Input label="Dates (e.g. Jan 2020 - Present)" value={exp.dates} onChange={(e) => updateExperience(exp.id, 'dates', e.target.value)} />
                    </div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[80px]"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-2">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Education</h2>
                <button onClick={addEducation} className="text-sm text-[var(--primary)] hover:underline flex items-center">
                  <Plus size={14} className="mr-1"/> Add
                </button>
              </div>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="relative p-4 border border-[var(--border)] rounded-xl bg-[var(--background)] pr-12">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-1/2 -translate-y-1/2 right-4 text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="School/University" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} />
                      <Input label="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                      <Input label="Dates" value={edu.dates} onChange={(e) => updateEducation(edu.id, 'dates', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)] border-b border-[var(--border)] pb-2">Skills</h2>
              <textarea 
                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[80px]"
                placeholder="E.g. JavaScript, React, Management, Design..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </section>
          </motion.div>

          {/* Live Preview / Print Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white text-black p-8 md:p-12 shadow-lg min-h-[1056px] w-full max-w-[816px] mx-auto print:shadow-none print:p-0 print:m-0 print:min-h-0 print:w-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Header */}
            <div className="border-b-2 border-gray-300 pb-6 mb-6 text-center">
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-2">{personal.name || "Your Name"}</h1>
              <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>• {personal.phone}</span>}
                {personal.linkedin && <span>• {personal.linkedin}</span>}
              </div>
            </div>

            {/* Summary */}
            {personal.summary && (
              <div className="mb-8">
                <p className="text-gray-800 leading-relaxed text-sm md:text-base">{personal.summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4 text-gray-900">Experience</h2>
                <div className="space-y-6">
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-800 text-base">{exp.role || "Role"}</h3>
                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{exp.dates}</span>
                      </div>
                      <div className="text-gray-700 font-medium mb-2 text-sm">{exp.company || "Company"}</div>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4 text-gray-900">Education</h2>
                <div className="space-y-4">
                  {education.map(edu => (
                    <div key={edu.id}>
                      <div className="flex flex-col sm:flex-row justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-800 text-base">{edu.degree || "Degree"}</h3>
                        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{edu.dates}</span>
                      </div>
                      <div className="text-gray-700 text-sm">{edu.school || "School"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div>
                <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4 text-gray-900">Skills</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{skills}</p>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}
