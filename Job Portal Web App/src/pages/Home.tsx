import { useState, Suspense, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Briefcase,
  Building2,
  ArrowRight,
  CheckCircle,
  Play,
  Globe,
  Award,
} from "lucide-react"
import HeroScene from "../components/three/HeroScene"
import JobCard from "../components/ui/JobCard"
import Button from "../components/ui/Button"
import { mockJobs, mockStats, categories } from "../data/mockData"

const heroSuggestions = [
  "React Developer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "DevOps Engineer",
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Frontend Engineer at TechCorp",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b332c3b9?w=80&h=80&fit=crop&auto=format",
    text: "HireHub helped me land my dream job in just 3 weeks. The ATS checker was a game-changer — my interview rate doubled after optimizing my resume.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Product Manager at FinanceFlow",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    text: "The salary insights feature alone is worth it. I negotiated 22% more than I would have otherwise. Incredible platform.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Data Scientist at GreenTech",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format",
    text: "The job matching algorithm is scary good. Every recommended job was actually relevant to my skills and experience level.",
    rating: 5,
  },
]

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const step = target / (duration / 16)
          let current = 0
          const timer = setInterval(() => {
            current += step
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, 16)
        }
      },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  const formatted =
    count >= 1000 ? `${(count / 1000).toFixed(0)}k` : count.toString()

  return (
    <div ref={ref} className="text-center">
      <div className="font-poppins text-4xl font-black text-white tabular-nums">
        {formatted}+
      </div>
      <div className="text-white/70 text-sm mt-1 font-medium">{label}</div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("")
  const [suggestionVisible, setSuggestionVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (keyword) params.set("keyword", keyword)
    if (location) params.set("location", location)
    navigate(`/jobs?${params.toString()}`)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const featuredJobs = mockJobs.filter((j) => j.isFeatured)

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #101F3E 0%, #0C1830 40%, #081122 100%)",
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full filter blur-[120px] opacity-15 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full filter blur-[100px] opacity-10" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* 3D Scene */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute right-4 lg:right-16 top-1/2 -translate-y-1/2 w-[340px] h-[340px] lg:w-[480px] lg:h-[480px] pointer-events-none opacity-70 lg:opacity-100"
        >
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-white/70 text-sm font-medium mb-6"
          >
            <Zap size={14} className="text-[var(--accent)]" />
            AI-powered job matching · 12,400+ active jobs
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-poppins text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 max-w-2xl"
          >
            Find Your <span className="block gradient-text">Dream Career</span>
            Today
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white/80 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed"
          >
            Connect with 3,200+ top companies. Get your resume ATS-scored, apply
            smarter, and land your next role 3× faster.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={18}
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setSuggestionVisible(true)}
                onBlur={() =>
                  setTimeout(() => setSuggestionVisible(false), 200)
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Job title, skill, or company…"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
              <AnimatePresence>
                {suggestionVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl overflow-hidden z-20"
                  >
                    {heroSuggestions.map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => {
                          setKeyword(s)
                          handleSearch()
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-2"
                      >
                        <TrendingUp
                          size={13}
                          className="text-[var(--muted-foreground)]"
                        />
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative sm:w-56">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={18}
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="City or Remote…"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3.5 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-lg shadow-[var(--primary-deep)]/30 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              Search Jobs
            </button>
          </motion.div>

          {/* Quick filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap gap-2 mt-5"
          >
            <span className="text-white/60 text-sm mr-1">Popular:</span>
            {[
              "Remote",
              "Full-time",
              "React",
              "Python",
              "Design",
              "Marketing",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/jobs?keyword=${tag}`)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/15 hover:bg-white/20 hover:text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center gap-4 mt-8"
          >
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1494790108755-2616b332c3b9?w=40&h=40&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&auto=format",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-8 h-8 rounded-full ring-2 ring-[#101F3E] object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className="fill-[var(--accent)] text-[var(--accent)]"
                  />
                ))}
                <span className="text-white text-xs font-semibold ml-1">
                  4.9
                </span>
              </div>
              <p className="text-white/60 text-xs">
                Trusted by 85,000+ professionals
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
        }}
        className="py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedCounter target={mockStats.totalJobs} label="Active Jobs" />
            <AnimatedCounter
              target={mockStats.totalCompanies}
              label="Companies Hiring"
            />
            <AnimatedCounter
              target={mockStats.totalUsers}
              label="Job Seekers"
            />
            <AnimatedCounter
              target={mockStats.totalPlacements}
              label="Successful Hires"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-4xl font-bold text-[var(--foreground)] mb-3">
              Browse by Category
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
              Explore thousands of opportunities across every industry and
              discipline.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                onClick={() =>
                  navigate(`/jobs?category=${cat.name.toLowerCase()}`)
                }
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-elevated)] transition-all duration-200 hover:-translate-y-1 text-center"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {cat.count.toLocaleString()} jobs
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="py-20 bg-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-poppins text-4xl font-bold text-[var(--foreground)] mb-2">
                Featured Jobs
              </h2>
              <p className="text-[var(--muted-foreground)]">
                Handpicked roles from top employers, updated daily.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/jobs")}
              className="hidden sm:flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:hidden">
            <Button variant="outline" onClick={() => navigate("/jobs")}>
              View all jobs <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3D Flip Cards */}
      <section className="py-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-poppins text-4xl font-bold text-[var(--foreground)] mb-3">
              How HireHub Works
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
              Get hired in 3 simple steps — faster than any other platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Build Your Profile",
                desc: "Create a compelling profile with your skills, experience, and career goals. Upload or build an ATS-optimized resume.",
                icon: Users,
                color: "var(--primary)",
              },
              {
                step: "02",
                title: "Discover Matches",
                desc: "Our AI matches you with relevant jobs based on your profile. Set alerts for new openings in your field.",
                icon: Zap,
                color: "var(--accent)",
              },
              {
                step: "03",
                title: "Apply & Get Hired",
                desc: "Apply with one click, track your applications, and communicate directly with recruiters.",
                icon: Award,
                color: "#22C55E",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative group [perspective:1000px]"
              >
                <div className="relative rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] h-64 cursor-default">
                  {/* Front */}
                  <div className="absolute inset-0 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden] shadow-[var(--shadow-card)]">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: `${step.color}20` }}
                    >
                      <step.icon size={28} style={{ color: step.color }} />
                    </div>
                    <span
                      className="text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: step.color }}
                    >
                      Step {step.step}
                    </span>
                    <h3 className="font-poppins font-bold text-lg text-[var(--foreground)]">
                      {step.title}
                    </h3>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-2xl p-8 flex items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}CC, ${step.color})`,
                    }}
                  >
                    <p className="text-white text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HireHub */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, #101F3E 0%, #081122 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-poppins text-4xl font-bold text-white mb-4">
                Why Job Seekers
                <br />
                Love HireHub
              </h2>
              <p className="text-white/80 mb-8 leading-relaxed">
                We go beyond simple job listings. Our platform combines AI
                matching, resume intelligence, and real-time recruiter insights
                to give you an unfair advantage.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    text: "AI-powered job matching with 95% relevance accuracy",
                    icon: Zap,
                  },
                  {
                    text: "ATS resume analysis with instant improvement tips",
                    icon: Shield,
                  },
                  {
                    text: "Real-time salary insights and negotiation data",
                    icon: TrendingUp,
                  },
                  {
                    text: "Direct messaging with recruiters before applying",
                    icon: Globe,
                  },
                  {
                    text: "Track all applications in one organized dashboard",
                    icon: Briefcase,
                  },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle
                        size={13}
                        className="text-[var(--primary-deep)]"
                      />
                    </div>
                    <p className="text-white/80 text-sm">{item.text}</p>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 mt-10">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/register")}
                >
                  Start for Free
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => navigate("/about")}
                >
                  <Play size={16} /> Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=500&fit=crop&auto=format"
                alt="Professional using HireHub on laptop"
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 flex items-center gap-3 border border-white/20 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-[var(--success)] flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    Interview Scheduled!
                  </p>
                  <p className="text-white/70 text-xs">
                    TechCorp · Senior Engineer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-poppins text-4xl font-bold text-[var(--foreground)] mb-12">
            Success Stories
          </h2>
          <div className="relative h-56">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <p className="text-[var(--foreground)] text-lg sm:text-xl leading-relaxed italic mb-6">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--primary)]"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-[var(--foreground)] text-sm">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-[var(--muted-foreground)] text-xs">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === activeTestimonial
                    ? "w-6 h-2.5 bg-[var(--primary)]"
                    : "w-2.5 h-2.5 bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section
        className="py-24"
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 50%, #101F3E 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-poppins text-5xl font-black text-white mb-4">
              Your Next Chapter Starts Here
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              Join 85,000+ professionals who found their dream job through
              HireHub. It's free to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="accent"
                size="xl"
                onClick={() => navigate("/register")}
              >
                Create Free Account <ArrowRight size={18} />
              </Button>
              <Button
                variant="ghost"
                size="xl"
                className="text-white hover:bg-white/15 border border-white/30"
                onClick={() => navigate("/jobs")}
              >
                Browse Jobs <ChevronRight size={18} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
