import { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Mail,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import symbolLogo from "../../imports/symbol_only.jpeg"
import { authService } from "../../lib/supabase"
import toast from "react-hot-toast"

const requestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type RequestFormData = z.infer<typeof requestSchema>
type ResetFormData = z.infer<typeof resetSchema>

export default function ForgotPassword() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token") || ""
  const emailParam = searchParams.get("email") || ""

  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [resetError, setResetError] = useState("")

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  })

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  // Mode A: Send reset link
  const onRequestSubmit = async (data: RequestFormData) => {
    setIsLoading(true)
    try {
      const cleanEmail = data.email.trim()
      const res = await authService.resetPasswordForEmail(cleanEmail)
      const resetToken = res?.token || "reset-" + Date.now()
      const link = `${window.location.origin}/forgot-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(cleanEmail)}`

      setSentEmail(cleanEmail)
      setGeneratedLink(link)
      setIsSent(true)
      toast.success("Password reset link generated!")
    } catch (err: any) {
      console.error("Forgot password error:", err)
      toast.error(err.message || "Failed to send reset link.")
    } finally {
      setIsLoading(false)
    }
  }

  // Mode B: Set new password
  const onResetSubmit = async (data: ResetFormData) => {
    setIsLoading(true)
    setResetError("")
    try {
      await authService.updatePassword(data.password, token, emailParam)
      setIsPasswordReset(true)
      toast.success("Password updated successfully! You can now log in.")
    } catch (err: any) {
      console.error("Update password error:", err)
      setResetError(err.message || "Failed to update password. Please try again.")
      toast.error(err.message || "Password update failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      toast.success("Reset link copied to clipboard!")
    }
  }

  const handleOpenResetLink = () => {
    if (sentEmail && generatedLink) {
      const url = new URL(generatedLink)
      const t = url.searchParams.get("token") || ""
      const e = url.searchParams.get("email") || sentEmail
      setSearchParams({ token: t, email: e })
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)] w-full max-w-full overflow-x-hidden">
      {/* Left panel - Decorative Deep Navy Canvas */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden bg-[#142B4A] border-r border-[#1E3A5F]">
        {/* Ambient radial gradients */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#2563EB]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#14B8A6] text-white shadow-lg mb-6 shrink-0 mx-auto">
            <Lock size={24} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#14B8A6] font-semibold mb-3">
            <ShieldCheck size={14} /> Enterprise Account Security
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Secure Account Recovery
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Enter your registered email address to receive a secure password reset link and restore your candidate or recruiter portal access.
          </p>
        </div>
      </div>

      {/* Right panel: Request vs Reset Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 bg-[var(--background)] w-full max-w-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md my-auto"
        >
          {/* Top navigation back to Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ArrowLeft size={15} /> Back to Log In
          </Link>

          {/* VIEW 1: TOKEN PRESENT - SET NEW PASSWORD */}
          {token ? (
            !isPasswordReset ? (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center mb-4">
                  <Lock size={22} />
                </div>
                <h1 className="font-poppins text-2xl sm:text-3xl font-black text-[var(--foreground)] mb-1 tracking-tight">
                  Set New Password
                </h1>
                <p className="text-xs text-[var(--muted-foreground)] mb-6">
                  Resetting credentials for{" "}
                  <strong className="text-[var(--foreground)] font-bold">
                    {emailParam || "your HireHub account"}
                  </strong>
                  .
                </p>

                <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-4">
                  <Input
                    label="New Password"
                    type={showPw ? "text" : "password"}
                    placeholder="At least 8 characters"
                    error={resetErrors.password?.message}
                    iconRight={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
                      >
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                    {...registerReset("password")}
                  />

                  <Input
                    label="Confirm New Password"
                    type={showPw ? "text" : "password"}
                    placeholder="Re-enter new password"
                    error={resetErrors.confirmPassword?.message}
                    {...registerReset("confirmPassword")}
                  />

                  {resetError && (
                    <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                      {resetError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-bold mt-2"
                  >
                    Save New Password & Log In <ArrowRight size={15} />
                  </Button>
                </form>
              </div>
            ) : (
              /* Password Reset Successful View */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="font-poppins text-2xl font-black text-[var(--foreground)] mb-2">
                  Password Updated!
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto leading-relaxed">
                  Your new password has been saved. You can now log in to your HireHub account.
                </p>
                <Link to="/login">
                  <Button variant="primary" size="lg" className="w-full font-bold">
                    Proceed to Log In <ArrowRight size={15} />
                  </Button>
                </Link>
              </motion.div>
            )
          ) : /* VIEW 2: REQUEST PASSWORD RESET LINK */
          !isSent ? (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center mb-4">
                <Mail size={22} />
              </div>
              <h1 className="font-poppins text-2xl sm:text-3xl font-black text-[var(--foreground)] mb-1 tracking-tight">
                Forgot Password
              </h1>
              <p className="text-xs text-[var(--muted-foreground)] mb-6 leading-relaxed">
                Enter your account email address. We'll generate a secure password reset link to update your credentials.
              </p>

              <form onSubmit={handleSubmitRequest(onRequestSubmit)} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="you@hirehub.app"
                  error={requestErrors.email?.message}
                  iconRight={<Mail size={16} className="text-[var(--muted-foreground)]" />}
                  {...registerRequest("email")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full font-bold"
                >
                  Send Password Reset Link <ArrowRight size={15} />
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Remember your password?{" "}
                  <Link to="/login" className="font-bold text-[var(--primary)] hover:underline">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* VIEW 3: LINK SENT CONFIRMATION WITH SIMULATED EMAIL & ONE-CLICK TEST */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="font-poppins text-2xl font-black text-[var(--foreground)] mb-1">
                  Reset Link Sent!
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  We've sent a password reset link to{" "}
                  <strong className="text-[var(--foreground)] font-bold">{sentEmail}</strong>.
                </p>
              </div>

              {/* Simulated Email Box with One-Click Open */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={16} />
                  <span>Simulated Password Reset Email</span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  To reset your password for <strong className="text-[var(--foreground)]">{sentEmail}</strong>, click below:
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenResetLink}
                    className="flex-1 py-2 px-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ExternalLink size={13} /> Open Password Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full text-xs font-semibold">
                    Return to Log In
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
