import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Image as ImageIcon, MapPin, Globe, Building } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"

export default function CompanyProfile() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "Tech Corp",
    industry: "Software Development",
    location: "San Francisco, CA",
    website: "https://techcorp.com",
    about: "We build innovative software solutions for the modern web.",
    size: "51-200 employees",
    logo: "",
    banner: "",
  })

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
              Company Profile
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Manage your company's public presence.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/companies/1")}>
              View Public Page
            </Button>
            <Button
              variant="primary"
              onClick={() => toast.success("Company profile saved successfully!")}
            >
              <Save size={16} className="mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Images */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div className="h-48 bg-[var(--muted)] relative group">
              {formData.banner ? (
                <img
                  src={formData.banner}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                  <ImageIcon size={32} className="mb-2" />
                  <span>Upload Cover Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                <span className="text-white font-medium">Change Cover</span>
              </div>
            </div>
            <div className="p-6 pt-0 relative">
              <div className="w-24 h-24 rounded-2xl bg-[var(--background)] border-4 border-[var(--card)] -mt-12 mb-4 relative group overflow-hidden flex items-center justify-center">
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building size={32} className="text-[var(--primary)]" />
                )}
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                  <span className="text-white text-xs font-medium">Edit</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                />
                <div className="relative">
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                  <MapPin
                    className="absolute right-3 top-[34px] text-[var(--muted-foreground)]"
                    size={16}
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Website"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                  <Globe
                    className="absolute right-3 top-[34px] text-[var(--muted-foreground)]"
                    size={16}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Company Size
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                  >
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>201-500 employees</option>
                    <option>500+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              About Company
            </h2>
            <textarea
              className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-y min-h-[150px]"
              placeholder="Tell candidates about your mission, culture, and what you do..."
              value={formData.about}
              onChange={(e) =>
                setFormData({ ...formData, about: e.target.value })
              }
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
