import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Target, Shield, Users, Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" className="mb-8" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
            About HireHub
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto leading-relaxed">
            We're on a mission to revolutionize the hiring process. HireHub
            connects top talent with innovative companies through AI-driven
            matching and a seamless platform experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm"
          >
            <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
              Our Mission
            </h3>
            <p className="text-[var(--muted-foreground)]">
              To empower professionals to build meaningful careers and help
              companies find the perfect fit faster than ever before.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm"
          >
            <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
              Trust & Transparency
            </h3>
            <p className="text-[var(--muted-foreground)]">
              We believe in honest insights, verified reviews, and a secure
              platform for all your career and hiring needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm"
          >
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
              Community First
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Built for the people who use it. We constantly iterate based on
              feedback from our vibrant community of job seekers and recruiters.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-sm"
          >
            <div className="w-12 h-12 bg-[var(--accent)]/15 text-[var(--accent)] dark:text-[var(--primary)] rounded-xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
              AI-Powered
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Leveraging advanced algorithms to match skills, parse resumes
              intelligently, and provide actionable career insights.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
