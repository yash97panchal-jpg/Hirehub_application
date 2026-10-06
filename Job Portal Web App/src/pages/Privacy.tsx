import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"

export default function Page() {
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
          className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 md:p-12 shadow-sm text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-[var(--muted)]  flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-[var(--primary)]">🚀</span>
          </div>
          <h1 className="font-poppins text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg mb-8 max-w-xl mx-auto">
            Learn how we collect, use, and protect your data.
            <br />
            <br />
            <span className="text-sm font-medium text-[var(--primary)]">
              This feature is currently under active development. Check back
              soon!
            </span>
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
