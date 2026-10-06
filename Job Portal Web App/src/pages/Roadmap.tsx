import { motion } from "framer-motion"
import {
  Shield,
  Layout,
  Briefcase,
  User,
  Building2,
  FileText,
  Settings,
  Bell,
  CheckCircle,
} from "lucide-react"
import { cn } from "../utils/cn"

const phases = [
  {
    id: "phase-2",
    title: "Phase 2: Auth and RBAC",
    icon: Shield,
    items: [
      "Backend: User model (name, email, password, role, isVerified, isBlocked, avatar, recruiterStatus).",
      "Endpoints: register (user/recruiter), login, refresh, logout, verify-email, forgot/reset-password, get me.",
      "bcrypt hashing, JWT access + refresh, email sending with Nodemailer.",
      "Middleware: protect, authorizeRoles, requireApprovedRecruiter, validation, rate limit.",
      "Frontend: Pages for Login, Register, Forgot/Reset Password, Verify Email, Admin Login.",
      "Zustand auth store, ProtectedRoute, auto refresh on 401.",
      "3D styled auth pages with split layout and form validation (Zod).",
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3: Landing page, 3D hero, navbar, footer",
    icon: Layout,
    items: [
      "Navbar: logo, mega-menu, search, theme toggle, notification bell, profile dropdown. Glassmorphic.",
      "Hero: interactive 3D scene with React Three Fiber, search bar overlay.",
      "Sections: stats counters, popular categories, featured jobs, top companies, how it works, testimonials.",
      "Footer: links, newsletter, socials.",
      "Animations: Parallax, scroll animations (Framer Motion), page transitions.",
    ],
  },
  {
    id: "phase-4",
    title: "Phase 4: Jobs module",
    icon: Briefcase,
    items: [
      "Backend: Job model (title, description, requirements, skills, type, location, etc.). Text indexing.",
      "Endpoints: CRUD, search, filter, sort, paginate, suggestions, applications.",
      "Frontend: Jobs listing with filter sidebar, salary slider, URL-sync, debounced search.",
      "Job detail page: details, company card, apply modal.",
      "Optimistic UI for save and apply, 3D tilt job cards.",
    ],
  },
  {
    id: "phase-5",
    title: "Phase 5: User profile, saved jobs, user dashboard",
    icon: User,
    items: [
      "Backend: Profile model (avatar, headline, about, education, experience, projects, skills). Cloudinary upload.",
      "Frontend: Multi-section profile editor with inline edit, avatar crop, resume version list.",
      "Profile strength meter (animated 3D ring).",
      "User dashboard: stats, application tracker, saved jobs, recommendations, job alerts.",
    ],
  },
  {
    id: "phase-6",
    title: "Phase 6: Recruiter dashboard and company profile",
    icon: Building2,
    items: [
      "Backend: Company model (name, logo, banner, about, industry, etc.).",
      "Recruiter endpoints: company CRUD, job management, applicant status updates, analytics.",
      "Frontend: Recruiter dashboard with Recharts (funnel, line, bar charts).",
      "Post Job multi-step form with rich text editor.",
      "Applicant management: Kanban view, resume viewer, bulk actions.",
      "Company profile editor and public page.",
    ],
  },
  {
    id: "phase-7",
    title: "Phase 7: ATS checker and resume builder",
    icon: FileText,
    items: [
      "Backend: Resume upload and parsing (pdf-parse + mammoth). Keyword matching and scoring.",
      "Frontend: ATS Checker drag-and-drop, score gauge, section breakdown chart.",
      "Resume Builder: step-by-step form with auto-fill.",
      "4 ATS-friendly templates, export to PDF, save drafts.",
    ],
  },
  {
    id: "phase-8",
    title: "Phase 8: Admin panel",
    icon: Settings,
    items: [
      "Backend: Analytics, user management, recruiter approvals, job moderation, content management.",
      "Frontend: Admin layout with sidebar, dashboard with charts, data tables with bulk actions.",
      "Activity logs and platform settings management.",
    ],
  },
  {
    id: "phase-9",
    title: "Phase 9: Notifications, chat, reviews, blog",
    icon: Bell,
    items: [
      "Notifications: Real-time via Socket.io, email alerts via node-cron.",
      "Chat: Socket.io recruiter-to-candidate chat.",
      "Reviews: Company ratings and reviews with moderation.",
      "Blog: Career tips, salary insights, static pages (About, Contact, FAQ).",
    ],
  },
  {
    id: "phase-10",
    title: "Phase 10: Seed data, testing, optimization, deployment",
    icon: CheckCircle,
    items: [
      "Seed script for demo data generation.",
      "Testing: Jest, Supertest, React Testing Library.",
      "Security: NoSQL injection protection, XSS clean, CORS, rate limits.",
      "Performance: Code splitting, memoization, DB indexes, lazy images.",
      "Deployment: Dockerfiles, CI/CD, Vercel/Render guides.",
    ],
  },
]

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-poppins text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4">
              Project <span className="text-[var(--primary)]">Roadmap</span>
            </h1>
            <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
              Track our development journey. Phase 1 is complete. Here are the
              planned phases and features.
            </p>
          </motion.div>
        </div>

        <div className="space-y-8">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--muted)]  flex items-center justify-center shrink-0">
                  <phase.icon size={24} className="text-[var(--primary)]" />
                </div>
                <h2 className="font-poppins text-2xl font-bold text-[var(--foreground)]">
                  {phase.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 shrink-0" />
                    <p className="text-[var(--muted-foreground)] leading-relaxed text-sm sm:text-base">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
