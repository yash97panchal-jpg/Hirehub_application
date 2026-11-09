import type { Job, Company, Notification } from "../types"
import { globalCompanies, worldwideOpenPositions } from "./worldwideJobs"
import { getCompanyRealLogo } from "./companyLogos"

/**
 * 100% Authentic Enterprise Companies & Verified Global Openings
 * Derived directly from premier technology leaders across US, Europe, India, and APAC corridors.
 */
export const mockCompanies: Company[] = globalCompanies.map((c) => ({
  ...c,
  logo: getCompanyRealLogo(c.name, c.website, c.logo),
}))

export const mockJobs: Job[] = worldwideOpenPositions.map((j) => ({
  ...j,
  company: {
    ...j.company,
    logo: getCompanyRealLogo(j.company.name, j.company.website, j.company.logo),
  },
}))

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "application",
    title: "Application Under Review",
    message: "Google Cloud talent team has opened your application for Senior Distributed Systems Engineer.",
    isRead: false,
    link: "/dashboard/applications",
    createdAt: "2026-11-08T10:30:00Z",
  },
  {
    id: "2",
    type: "job_match",
    title: "New Job Match",
    message: "5 new roles match your profile — Stripe, NVIDIA, Microsoft, Netflix...",
    isRead: false,
    link: "/jobs",
    createdAt: "2026-11-07T09:00:00Z",
  },
  {
    id: "3",
    type: "interview",
    title: "Technical Interview Scheduled",
    message: "Stripe Engineering has scheduled an interview for Infrastructure Architect.",
    isRead: true,
    link: "/dashboard/applications",
    createdAt: "2026-11-06T14:00:00Z",
  },
]

export const mockStats = {
  get totalJobs() {
    return mockJobs.length
  },
  get totalCompanies() {
    return mockCompanies.length
  },
  totalUsers: 45,
  totalPlacements: 18,
  get jobsByCategory() {
    const cats: Record<string, number> = {}
    for (const j of mockJobs) {
      const c = j.category || "Engineering"
      cats[c] = (cats[c] || 0) + 1
    }
    return Object.entries(cats).map(([category, count]) => ({ category, count }))
  },
}

export const categories = [
  { name: "Engineering", icon: "Code" },
  { name: "Design", icon: "Palette" },
  { name: "Marketing", icon: "TrendingUp" },
  { name: "Sales", icon: "Briefcase" },
  { name: "Product", icon: "Box" },
  { name: "Data Science", icon: "BarChart3" },
  { name: "Finance", icon: "DollarSign" },
  { name: "HR", icon: "Users" },
  { name: "Operations", icon: "Settings" },
  { name: "Legal", icon: "Scale" },
].map((item) => ({
  ...item,
  get count() {
    return mockJobs.filter((j) => (j.category || "").toLowerCase() === item.name.toLowerCase()).length
  },
}))
