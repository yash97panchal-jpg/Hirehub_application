import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Mail, ArrowRight, CheckCircle2 } from "lucide-react"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import symbolLogo from "../../imports/symbol_only.jpeg"

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    setIsSent(true)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - same as Login */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, #1A0924 55%, var(--primary-deep) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border border-[var(--border)] mb-6 shrink-0 overflow-hidden mx-auto">
            <img
              src={symbolLogo}
              alt="HireHub Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="font-poppins text-4xl font-black text-white mb-4">
            Secure Account Recovery
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Don't worry, it happens to the best of us. We'll help you get back
            to your account in no time.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back to Sign in
          </Link>

          {!isSent ? (
            <>
              <h1 className="font-poppins text-3xl font-bold text-[var(--foreground)] mb-2">
                Reset Password
              </h1>
              <p className="text-[var(--muted-foreground)] mb-8">
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  iconRight={
                    <Mail
                      size={18}
                      className="text-[var(--muted-foreground)]"
                    />
                  }
                  {...register("email")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Send Reset Link <ArrowRight size={16} className="ml-2" />
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-3">
                Check your email
              </h2>
              <p className="text-[var(--muted-foreground)] mb-8">
                We've sent a password reset link to your email address. Please
                check your inbox and spam folder.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Sign in
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
