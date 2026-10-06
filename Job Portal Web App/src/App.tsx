import { lazy, Suspense, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import { useThemeStore } from "./store/themeStore"

const Home = lazy(() => import("./pages/Home"))
const Jobs = lazy(() => import("./pages/Jobs"))
const JobDetail = lazy(() => import("./pages/JobDetail"))
const Companies = lazy(() => import("./pages/Companies"))
const ATSChecker = lazy(() => import("./pages/ATSChecker"))
const Roadmap = lazy(() => import("./pages/Roadmap"))
const SalaryInsights = lazy(() => import("./pages/SalaryInsights"))
const Notifications = lazy(() => import("./pages/Notifications"))
const Profile = lazy(() => import("./pages/Profile"))
const Messages = lazy(() => import("./pages/Messages"))
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
const RecruiterDashboard = lazy(
  () => import("./pages/dashboard/RecruiterDashboard"),
)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const Onboarding = lazy(() => import("./pages/Onboarding"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))

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

const NO_FOOTER_PATHS = ["/login", "/register", "/forgot-password", "/admin", "/recruiter"]

function Layout({ children }: { children: React.ReactNode }) {
  const path = window.location.pathname
  const showFooter = !NO_FOOTER_PATHS.some((p) => path.startsWith(p))

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  )
}

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
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
            {/* Protected General Pages */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
            <Route path="/internships" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/ats-checker" element={<ProtectedRoute><ATSChecker /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/salary-insights" element={<ProtectedRoute><SalaryInsights /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
            <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
            <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
            <Route path="/cookies" element={<ProtectedRoute><Cookies /></ProtectedRoute>} />
            
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
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Recruiter protected */}
            <Route
              path="/recruiter"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/*"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterDashboard />
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
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                  <div className="text-center">
                    <div className="font-poppins text-8xl font-black text-[var(--muted)] mb-4">
                      404
                    </div>
                    <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-2">
                      Page not found
                    </h1>
                    <p className="text-[var(--muted-foreground)] mb-6">
                      The page you're looking for doesn't exist.
                    </p>
                    <a
                      href="/"
                      className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}
