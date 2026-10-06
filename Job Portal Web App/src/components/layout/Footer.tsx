import { Link } from "react-router-dom"
import {
  Briefcase,
  AtSign,
  Globe,
  Code,
  Send,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"
import symbolLogo from "../../imports/symbol_only.jpeg"

const footerLinks = {
  "For Job Seekers": [
    { label: "Browse Jobs", to: "/jobs" },
    { label: "Browse Internships", to: "/internships" },
    { label: "ATS Resume Checker", to: "/ats-checker" },
    { label: "Resume Builder", to: "/resume-builder" },
    { label: "Salary Insights", to: "/salary-insights" },
    { label: "Career Tips", to: "/blog" },
  ],
  "For Recruiters": [
    { label: "Post a Job", to: "/recruiter/post-job" },
    { label: "Recruiter Dashboard", to: "/recruiter" },
    { label: "Browse Candidates", to: "/recruiter/candidates" },
    { label: "Company Profile", to: "/recruiter/company" },
    { label: "Pricing", to: "/pricing" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "FAQ", to: "/faq" },
  ],
}

const socials = [
  { icon: AtSign, href: "#", label: "Twitter/X" },
  { icon: Globe, href: "#", label: "LinkedIn" },
  { icon: Code, href: "#", label: "GitHub" },
  { icon: Send, href: "#", label: "Telegram" },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--primary-deep)] text-white mt-20">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-poppins text-xl font-bold">
                Get job alerts in your inbox
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Be the first to know about new opportunities matching your
                skills.
              </p>
            </div>
            <form
              className="flex gap-2 w-full sm:w-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-72 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--primary-deep)] font-bold text-sm hover:bg-[var(--accent-hover)] transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-[var(--border)] shrink-0 overflow-hidden">
                <img
                  src={symbolLogo}
                  alt="HireHub Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="font-poppins font-bold text-xl">
                Hire<span className="text-[var(--accent)]">Hub</span>
              </span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              The smartest job search platform powered by AI-driven matching,
              ATS resume analysis, and real-time salary insights.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin size={14} /> San Francisco, CA 94103
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Mail size={14} /> hello@HireHub.com
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Phone size={14} /> +1 (555) 012-3456
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4 text-white">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} HireHub, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/cookies"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
