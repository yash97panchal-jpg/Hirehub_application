import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Zap,
  Shield,
  Building,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Mail,
  Info,
  Smartphone,
  Lock,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import Input from "../components/ui/Input"
import toast from "react-hot-toast"

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [currency, setCurrency] = useState<"USD" | "INR">("USD")
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [inquiryEmail, setInquiryEmail] = useState("")
  const [inquiryCompany, setInquiryCompany] = useState("")
  const [inquiryNotes, setInquiryNotes] = useState("")
  const [inquirySubmitted, setInquirySubmitted] = useState(false)

  const isINR = currency === "INR"
  const discountMultiplier = billingCycle === "yearly" ? 0.8 : 1 // 20% off annual

  const plans = [
    {
      id: "free",
      name: "Starter Community",
      badge: "Free Forever",
      priceMonthlyUSD: 0,
      priceMonthlyINR: 0,
      description: "Essential recruiting tools for startups and emerging founders.",
      features: [
        "Post up to 2 active jobs",
        "Basic applicant tracking pipeline",
        "Standard candidate email notifications",
        "Community forum support",
        "Multi-mode Easy Apply & External ATS links",
      ],
      popular: false,
      cta: "Get Started Free",
    },
    {
      id: "pro",
      name: "Recruiter Pro & Talent",
      badge: "Most Popular",
      priceMonthlyUSD: 49,
      priceMonthlyINR: 3999,
      description: "Accelerate hiring with AI matching, talent database access and boosted visibility.",
      features: [
        "Post up to 15 active jobs",
        "⚡ 3 Featured 'Urgent Hiring' Badges",
        "Full Talent Database search & direct messaging",
        "Automated ATS Resume scoring & screening questions",
        "Kanban applicant pipeline & bulk CSV exports",
        "Priority 24/7 dedicated email support",
        "Direct Google Meet & Zoom interview scheduler",
      ],
      popular: true,
      cta: "Inquire for Pro Access",
    },
    {
      id: "enterprise",
      name: "Enterprise Global",
      badge: "High Growth",
      priceMonthlyUSD: 199,
      priceMonthlyINR: 15999,
      description: "Dedicated infrastructure, unlimited postings, and tailored custom recruitment workflows.",
      features: [
        "Unlimited active job postings",
        "Unlimited Featured & Promoted job tags",
        "Greenhouse / Lever / Workable API job importer",
        "Dedicated Talent Acquisition Account Manager",
        "Multi-member team recruiter seats & invitations",
        "Role-based access permissions & Audit logs",
        "100% SLA uptime guarantee",
      ],
      popular: false,
      cta: "Request Enterprise Pilot",
    },
  ]

  const handleSelectPlan = (plan: any) => {
    if (plan.priceMonthlyUSD === 0) {
      toast.success("You are enrolled in the Starter Community plan!")
      return
    }
    setSelectedPlan(plan)
    setIsInquiryOpen(true)
    setInquirySubmitted(false)
  }

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryEmail.trim() || !inquiryEmail.includes("@")) {
      toast.error("Please enter a valid work email address.")
      return
    }
    setInquirySubmitted(true)
    toast.success(`Inquiry submitted for ${selectedPlan?.name}! Our sales team will reach out within 24 hours.`)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Compliance Notice Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-[var(--foreground)]">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <Info size={16} />
          </div>
          <div className="flex-1">
            <span className="font-bold">Payment & Compliance Notice:</span> Online credit card checkout is currently hidden pending final payment provider integration. iOS native mobile builds will require Apple In-App Purchases (IAP) in accordance with App Store Review Guidelines. All enterprise and pro upgrades are processed via direct corporate invoice.
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="accent" size="md" className="mb-3">
            <Sparkles size={13} className="mr-1" /> Transparent Recruitment Pricing
          </Badge>
          <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            Predictable Plans for Modern Hiring
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mt-3">
            Whether you are hiring your first developer or scaling global engineering organizations, HireHub gives you the tools you need.
          </p>

          {/* Controls: Billing Cycle + Currency Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center bg-[var(--muted)] p-1 rounded-2xl border border-[var(--border)]">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                Yearly Billing <span className="text-[10px] text-emerald-500 font-extrabold">Save 20%</span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center bg-[var(--muted)] p-1 rounded-2xl border border-[var(--border)]">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  currency === "USD"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  currency === "INR"
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const rawMonthly = isINR ? plan.priceMonthlyINR : plan.priceMonthlyUSD
            const finalMonthly = Math.round(rawMonthly * discountMultiplier)
            const currencySymbol = isINR ? "₹" : "$"

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl p-8 flex flex-col justify-between relative bg-[var(--card)] border transition-all duration-300 ${
                  plan.popular
                    ? "border-[var(--primary)] shadow-[var(--shadow-elevated)] ring-2 ring-[var(--primary)]/20"
                    : "border-[var(--border)] shadow-[var(--shadow-card)]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-bold bg-[var(--primary)] text-white shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-poppins text-xl font-bold text-[var(--foreground)]">
                      {plan.name}
                    </h3>
                    {!plan.popular && (
                      <span className="text-[11px] font-semibold text-[var(--muted-foreground)] bg-[var(--muted)] px-2.5 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-poppins text-4xl font-extrabold text-[var(--foreground)]">
                      {currencySymbol}{finalMonthly}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">/ month</span>
                    {billingCycle === "yearly" && plan.priceMonthlyUSD > 0 && (
                      <span className="text-[11px] text-emerald-500 font-bold ml-2">
                        Billed annually
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Included in Plan:
                    </p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[var(--foreground)]">
                        <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border)]">
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    size="lg"
                    className="w-full font-bold text-xs"
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {plan.cta} <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Security & Support Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <Shield size={28} className="mx-auto text-[var(--primary)] mb-2" />
            <h4 className="font-bold text-sm text-[var(--foreground)]">Enterprise Security</h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Encrypted resume storage, role-based access control, and GDPR data isolation.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <Smartphone size={28} className="mx-auto text-[var(--primary)] mb-2" />
            <h4 className="font-bold text-sm text-[var(--foreground)]">Mobile In-App Purchase Ready</h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Compliant with iOS App Store & Android Google Play Store billing guidelines.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <Building size={28} className="mx-auto text-[var(--primary)] mb-2" />
            <h4 className="font-bold text-sm text-[var(--foreground)]">Custom ATS Integrations</h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Seamlessly link Greenhouse, Lever, and Workable with direct apply redirection.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise / Pro Inquiry Modal */}
      <AnimatePresence>
        {isInquiryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-poppins font-bold text-base text-[var(--foreground)]">
                    Inquire for {selectedPlan?.name}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Direct Corporate Invoicing & Onboarding
                  </p>
                </div>
                <button
                  onClick={() => setIsInquiryOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                >
                  <X size={18} />
                </button>
              </div>

              {inquirySubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-base text-[var(--foreground)]">
                    Inquiry Received!
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Thank you for your interest in HireHub {selectedPlan?.name}. An enterprise hiring specialist will email your custom proposal and invoice options to <strong>{inquiryEmail}</strong>.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => setIsInquiryOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-3.5 py-4">
                  <Input
                    label="Work Email Address"
                    type="email"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="recruiter@company.com"
                    required
                  />

                  <Input
                    label="Company Name"
                    value={inquiryCompany}
                    onChange={(e) => setInquiryCompany(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    required
                  />

                  <div>
                    <label className="text-xs font-semibold text-[var(--foreground)] block mb-1">
                      Hiring Objectives & Timeline
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      placeholder="e.g. Planning to hire 5 React engineers this quarter..."
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] resize-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] flex items-center gap-2">
                    <Lock size={14} className="text-[var(--primary)] shrink-0" />
                    <span>In-app card checkout is disabled. Plans are billed via official GST/VAT invoices.</span>
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
                    Submit Recruitment Inquiry <ArrowRight size={14} />
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
