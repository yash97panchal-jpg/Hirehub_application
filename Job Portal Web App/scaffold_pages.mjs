import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pagesDir = path.join(__dirname, "src", "pages")

const pages = [
  {
    name: "SalaryInsights",
    path: "SalaryInsights.tsx",
    route: "/salary-insights",
    title: "Salary Insights",
    desc: "Explore salary data and compensation trends.",
  },
  {
    name: "Notifications",
    path: "Notifications.tsx",
    route: "/notifications",
    title: "Notifications",
    desc: "Stay updated on your applications, job alerts, and messages.",
  },
  {
    name: "Profile",
    path: "Profile.tsx",
    route: "/profile",
    title: "User Profile",
    desc: "Manage your personal information, experience, and skills.",
  },
  {
    name: "Messages",
    path: "Messages.tsx",
    route: "/messages",
    title: "Messages",
    desc: "Communicate directly with recruiters and hiring managers.",
  },
  {
    name: "Settings",
    path: "Settings.tsx",
    route: "/settings",
    title: "Settings",
    desc: "Manage your account preferences, privacy, and security.",
  },
  {
    name: "Blog",
    path: "Blog.tsx",
    route: "/blog",
    title: "Career Tips & Blog",
    desc: "Read our latest articles on interview prep, resume building, and career growth.",
  },
  {
    name: "ResumeBuilder",
    path: "ResumeBuilder.tsx",
    route: "/resume-builder",
    title: "Resume Builder",
    desc: "Create a professional, ATS-friendly resume in minutes.",
  },
  {
    name: "Pricing",
    path: "Pricing.tsx",
    route: "/pricing",
    title: "Pricing Plans",
    desc: "Choose the right plan for your job search or hiring needs.",
  },
  {
    name: "About",
    path: "About.tsx",
    route: "/about",
    title: "About Us",
    desc: "Learn more about JobHive and our mission to connect talent with opportunity.",
  },
  {
    name: "Contact",
    path: "Contact.tsx",
    route: "/contact",
    title: "Contact Support",
    desc: "Get in touch with our team for help or inquiries.",
  },
  {
    name: "FAQ",
    path: "FAQ.tsx",
    route: "/faq",
    title: "Frequently Asked Questions",
    desc: "Find answers to common questions about using JobHive.",
  },
  {
    name: "Privacy",
    path: "Privacy.tsx",
    route: "/privacy",
    title: "Privacy Policy",
    desc: "Learn how we collect, use, and protect your data.",
  },
  {
    name: "Terms",
    path: "Terms.tsx",
    route: "/terms",
    title: "Terms of Service",
    desc: "Read the rules and guidelines for using our platform.",
  },
  {
    name: "Cookies",
    path: "Cookies.tsx",
    route: "/cookies",
    title: "Cookie Policy",
    desc: "Understand how we use cookies to improve your experience.",
  },
]

const template = (title, desc) => `import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Page() {
  const navigate = useNavigate();

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
          <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-[var(--primary)]">🚀</span>
          </div>
          <h1 className="font-poppins text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            ${title}
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg mb-8 max-w-xl mx-auto">
            ${desc}
            <br/><br/>
            <span className="text-sm font-medium text-[var(--primary)]">This feature is currently under active development. Check back soon!</span>
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
`

pages.forEach((p) => {
  const filePath = path.join(pagesDir, p.path)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template(p.title, p.desc))
    console.log("Created:", p.path)
  }
})

const appTsxPath = path.join(__dirname, "src", "App.tsx")
let appContent = fs.readFileSync(appTsxPath, "utf8")

const importsToAdd = pages
  .map(
    (p) =>
      "const " + p.name + " = lazy(() => import('./pages/" + p.name + "'));",
  )
  .join("\n")
appContent = appContent.replace(
  "const Login = lazy(() => import('./pages/auth/Login'));",
  importsToAdd + "\nconst Login = lazy(() => import('./pages/auth/Login'));",
)

const routesToAdd = pages
  .map(
    (p) =>
      '            <Route path="' +
      p.route +
      '" element={<' +
      p.name +
      " />} />",
  )
  .join("\n")

appContent = appContent.replace(
  '<Route path="/login" element={<Login />} />',
  routesToAdd + '\n            <Route path="/login" element={<Login />} />',
)

fs.writeFileSync(appTsxPath, appContent)
console.log("App.tsx updated")
