import React, { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Button from "../components/ui/Button"

export default function Contact() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.message) {
      toast.error("Please fill in your email and message.")
      return
    }
    setSubmitted(true)
    toast.success("Message sent! Our support team will get back to you within 24 hours.")
    setFormData({ firstName: "", lastName: "", email: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" className="mb-8" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <div className="text-center mb-16">
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
            Get in Touch
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
            Have questions about HireHub? We're here to help. Reach out to our
            team and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    Email Us
                  </h3>
                  <p className="text-[var(--muted-foreground)] mb-2">
                    For general inquiries and support.
                  </p>
                  <a
                    href="mailto:hello@hirehub.com"
                    className="text-[var(--primary)] font-medium hover:underline"
                  >
                    hello@hirehub.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    Call Us
                  </h3>
                  <p className="text-[var(--muted-foreground)] mb-2">
                    Mon-Fri from 9am to 6pm PST.
                  </p>
                  <a
                    href="tel:+15550123456"
                    className="text-[var(--foreground)] font-medium"
                  >
                    +1 (555) 012-3456
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    Headquarters
                  </h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">
                    123 Innovation Drive
                    <br />
                    Suite 400
                    <br />
                    San Francisco, CA 94103
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[var(--card)] p-8 md:p-10 rounded-3xl border border-[var(--border)] shadow-sm"
          >
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">
              Send a Message
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  placeholder="jane@hirehub.app"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <Button type="submit" variant="primary" className="w-full h-12 text-lg">
                <Send size={18} className="mr-2" />
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
