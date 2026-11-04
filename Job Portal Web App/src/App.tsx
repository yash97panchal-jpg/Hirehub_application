import { lazy, Suspense, useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import { ErrorBoundary } from "./components/layout/ErrorBoundary"
import SplashScreen from "./components/layout/SplashScreen"
import { setupAppProtection } from "./utils/securityAndControls"
import { useThemeStore } from "./store/themeStore"
import symbolLogo from "./imports/symbol_only.jpeg"

const Home = lazy(() => import("./pages/Home"))
const Jobs = lazy(() => import("./pages/Jobs"))
const JobDetail = lazy(() => import("./pages/JobDetail"))
const Companies = lazy(() => import("./pages/Companies"))
const ATSChecker = lazy(() => import("./pages/ATSChecker"))
const SalaryInsights = lazy(() => import("./pages/SalaryInsights"))
const Notifications = lazy(() => import("./pages/Notifications"))
const Profile = lazy(() => import("./pages/Profile"))
const Settings = lazy(() => import("./pages/Settings"))
const Blog = lazy(() => import("./pages/Blog"))
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"))
const Pricing = lazy(() => import("./pages/Pricing"))
const About = lazy(() => import("./pages/About"))
const Contact = lazy(() => import("./pages/Contact"))
const FAQ = lazy(() => import("./pages/FAQ"))
const Privacy = lazy(() => import("./pages/Privacy"))
const Terms = lazy(() => import("./pages/Terms"))
const Cookies = lazy(() => import("./pages/Cookies"))
const Login = lazy(() => import("./pages/auth/Login"))
const Register = lazy(() => import("./pages/auth/Register"))
const UserDashboard = lazy(() => import("./pages/dashboard/UserDashboard"))
const SavedJobs = lazy(() => import("./pages/dashboard/SavedJobs"))
const ApplicationTracker = lazy(
  () => import("./pages/dashboard/ApplicationTracker"),
)
const JobAlerts = lazy(() => import("./pages/dashboard/JobAlerts"))
const RecruiterDashboard = lazy(
  () => import("./pages/dashboard/RecruiterDashboard"),
)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const Onboarding = lazy(() => import("./pages/Onboarding"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))
const PostJob = lazy(() => import("./pages/dashboard/PostJob"))
const ApplicantManagement = lazy(
  () => import("./pages/dashboard/ApplicantManagement"),
)
const CompanyProfile = lazy(() => import("./pages/dashboard/CompanyProfile"))
const CompanyPage = lazy(() => import("./pages/CompanyPage"))
const Messages = lazy(() => import("./pages/Messages"))
const SkillAssessment = lazy(() => import("./pages/SkillAssessment"))
const TalentSearch = lazy(() => import("./pages/recruiter/TalentSearch"))

import PWAInstallPrompt from "./components/layout/PWAInstallPrompt"
import CookieConsent from "./components/layout/CookieConsent"
import BackToTop from "./components/layout/BackToTop"
import CareerHelpBot from "./components/layout/CareerHelpBot"

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading…</p>
      </div>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAuth = ["/login", "/register", "/forgot-password"].includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAuth && <Footer />}
      <CookieConsent />
      <PWAInstallPrompt />
      <CareerHelpBot />
      <BackToTop />
    </div>
  )
}

export default function App() {
  const { theme } = useThemeStore()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  useEffect(() => {
    const cleanupProtection = setupAppProtection()
    return () => cleanupProtection()
  }, [])

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
          },
          success: { iconTheme: { primary: "#22C55E", secondary: "#fff" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
        }}
      />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Discovery Pages (Standard Web Portal Entry) */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyPage />} />
            <Route path="/internships" element={<Jobs />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Authenticated Career Tools & Dashboards */}
            <Route
              path="/ats-checker"
              element={
                <ProtectedRoute>
                  <ATSChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary-insights"
              element={
                <ProtectedRoute>
                  <SalaryInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-builder"
              element={
                <ProtectedRoute>
                  <ResumeBuilder />
                </ProtectedRoute>
              }
            />

            {/* Authenticated User Features */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute>
                  <SkillAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skill-assessment"
              element={
                <ProtectedRoute>
                  <SkillAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Public Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* User protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/saved"
              element={
                <ProtectedRoute>
                  <SavedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/applications"
              element={
                <ProtectedRoute>
                  <ApplicationTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/alerts"
              element={
                <ProtectedRoute>
                  <JobAlerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruiter"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/post-job"
              element={
                <ProtectedRoute role="recruiter">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/applicants"
              element={
                <ProtectedRoute role="recruiter">
                  <ApplicantManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/talent-search"
              element={
                <ProtectedRoute role="recruiter">
                  <TalentSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/company-profile"
              element={
                <ProtectedRoute role="recruiter">
                  <CompanyProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
                  <div className="text-center max-w-md bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-card)]">
                    <img src={symbolLogo} alt="HireHub Symbol" className="w-16 h-16 mx-auto mb-6 object-contain rounded-full border border-[var(--border)]" />
                    <div className="font-poppins text-8xl font-black text-[var(--muted)] mb-4">
                      404
                    </div>
                    <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-2">
                      Page not found
                    </h1>
                    <p className="text-[var(--muted-foreground)] mb-6">
                      The page you're looking for doesn't exist.
                    </p>
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors block w-full"
                    >
                      Go Home
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

