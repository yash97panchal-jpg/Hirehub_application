import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"

const mockPosts = [
  {
    id: 1,
    title: "10 Tips for Acing Your Next Technical Interview",
    excerpt:
      "Preparing for a technical interview can be daunting. Here are 10 actionable tips to help you stand out and land the job.",
    author: "Jane Doe",
    date: "Oct 5, 2026",
    category: "Interview Prep",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "How to Build an ATS-Friendly Resume",
    excerpt:
      "Applicant Tracking Systems are the gatekeepers to recruiters. Learn how to format your resume to get past the robots.",
    author: "John Smith",
    date: "Sep 28, 2026",
    category: "Resume Building",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "The Future of Remote Work in 2027",
    excerpt:
      "As remote work evolves, what can we expect in the coming years? We explore trends and predictions for the modern workplace.",
    author: "Alice Johnson",
    date: "Sep 15, 2026",
    category: "Career Growth",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
]

export default function Blog() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" className="mb-8" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <div className="text-center mb-16">
          <h1 className="font-poppins text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
            Career Tips & Blog
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
            Insights, strategies, and stories to help you navigate your career
            journey and land your dream job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="text-sm font-medium text-[var(--primary)] mb-3">
                  {post.category}
                </div>
                <h3 className="font-bold text-xl text-[var(--foreground)] mb-3 leading-tight group-hover:text-[var(--primary)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[var(--muted-foreground)] line-clamp-3 mb-6">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)] border-t border-[var(--border)] pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
