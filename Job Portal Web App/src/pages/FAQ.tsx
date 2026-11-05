import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"

const faqs = [
  {
    question: "Is HireHub free for job seekers?",
    answer:
      "Yes! HireHub is completely free for job seekers. You can create a profile, use our resume builder, take advantage of the ATS checker, and apply to unlimited jobs without ever paying a dime.",
  },
  {
    question: "How does the ATS checker work?",
    answer:
      "Our ATS (Applicant Tracking System) checker analyzes your resume against industry-standard keywords and job descriptions. It provides a score and actionable feedback to help format your resume exactly how automated systems prefer.",
  },
  {
    question: "Can employers see my contact information?",
    answer:
      "Only if you apply to their job or explicitly allow your profile to be public to recruiters. You have full control over your privacy settings in your user dashboard.",
  },
  {
    question: "How much does it cost to post a job?",
    answer:
      "Job postings are currently complimentary for verified employers and hiring partners. Recruiters can publish live listings and review verified candidate applications directly through their Recruiter Dashboard.",
  },
  {
    question: "How do I edit my resume once it's created?",
    answer:
      "Navigate to your Profile Dashboard, click on 'My Resume', and you'll enter the Resume Builder mode where you can edit, reorder, or update any section.",
  },
]

export default function FAQ() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" className="mb-8" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <div className="text-center mb-16">
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
            Find answers to the most common questions about using HireHub for
            your career or hiring needs.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <span className="font-semibold text-[var(--foreground)] pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-[var(--muted-foreground)] transition-transform duration-300 shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-0 text-[var(--muted-foreground)] border-t border-[var(--border)]/50 mt-2">
                      <p className="mt-4">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center bg-[var(--primary)]/10 rounded-3xl p-8 border border-[var(--primary)]/20">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
            Still have questions?
          </h3>
          <p className="text-[var(--muted-foreground)] mb-6">
            Can't find the answer you're looking for? Please chat to our
            friendly team.
          </p>
          <Button variant="primary" onClick={() => navigate("/contact")}>
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  )
}
