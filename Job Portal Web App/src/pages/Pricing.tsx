import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Zap,
  Shield,
  CreditCard,
  Building,
  Sparkles,
  ArrowRight,
  Download,
  CheckCircle2,
  X,
  FileText,
  BadgePercent,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import toast from "react-hot-toast"
import { triggerConfetti } from "../utils/confetti"

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [currency, setCurrency] = useState<"USD" | "INR">("USD")
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentGateway, setPaymentGateway] = useState<"razorpay" | "stripe">("stripe")
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const isINR = currency === "INR"
  const discountMultiplier = billingCycle === "yearly" ? 0.8 : 1 // 20% off annual

  const plans = [
    {
      id: "free",
      name: "Starter Community",
      badge: "Free Forever",
      priceMonthlyUSD: 0,
      priceMonthlyINR: 0,
      description: "Essential tools for small teams & emerging recruiters.",
      features: [
        "Post up to 2 active jobs",
        "Basic applicant tracking pipeline",
        "Standard candidate email notifications",
        "Community forum support",
        "7-day job listing validity",
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
        "Automated ATS Resume scoring & screening",
        "Kanban applicant pipeline & bulk exports",
        "Priority 24/7 dedicated email support",
        "Direct Google Meet & Zoom interview scheduler",
      ],
      popular: true,
      cta: "Upgrade to Pro",
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
        "Dedicated Talent Acquisition Manager",
        "Custom ATS API integration & webhooks",
        "GST Invoicing & Multi-member team seats",
        "Role-based access permissions & Audit logs",
        "100% SLA uptime guarantee",
      ],
      popular: false,
      cta: "Deploy Enterprise",
    },
  ]

  const handleOpenCheckout = (plan: any) => {
    if (plan.priceMonthlyUSD === 0) {
      toast.success("You are now enrolled in the Starter Community plan!")
      return
    }
    setSelectedPlan(plan)
    setIsCheckoutOpen(true)
    setPaymentSuccess(false)
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (couponCode.toUpperCase() === "HIREHUB20") {
      setCouponDiscount(0.2)
      toast.success("Promo code applied: 20% Extra Discount!")
    } else {
      toast.error("Invalid coupon code. Try 'HIREHUB20'")
    }
  }

  const calculateFinalPrice = () => {
    if (!selectedPlan) return 0
    const base = isINR ? selectedPlan.priceMonthlyINR : selectedPlan.priceMonthlyUSD
    const discounted = base * discountMultiplier * (1 - couponDiscount)
    return Math.round(discounted)
  }

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentSuccess(true)
      triggerConfetti()
      toast.success(`Payment verified via ${paymentGateway === "razorpay" ? "Razorpay India" : "Stripe Global"}!`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="accent" size="md" className="mb-3">
            <Sparkles size={13} className="mr-1" /> Flexible Plans For Every Hiring Need
          </Badge>
          <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            Transparent Pricing, Zero Hidden Fees
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mt-3">
            Whether you are hiring your first engineer or expanding a worldwide engineering team, HireHub has you covered.
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
                INR (₹ GST)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const rawPrice = isINR ? plan.priceMonthlyINR : plan.priceMonthlyUSD
            const finalPrice = Math.round(rawPrice * discountMultiplier)

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -5 }}
                className={`rounded-3xl p-8 border flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? "bg-[var(--card)] border-[var(--primary)] shadow-2xl ring-2 ring-[var(--primary)]/30"
                    : "bg-[var(--card)] border-[var(--border)] shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-poppins font-bold text-xl text-[var(--foreground)]">
                      {plan.name}
                    </h3>
                    <Badge variant={plan.popular ? "primary" : "default"} size="sm">
                      {plan.badge}
                    </Badge>
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[var(--border)]">
                    <span className="text-4xl font-extrabold font-poppins text-[var(--foreground)]">
                      {isINR ? `₹${finalPrice.toLocaleString()}` : `$${finalPrice}`}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium">
                      {plan.priceMonthlyUSD === 0 ? "" : billingCycle === "yearly" ? "/mo (billed annually)" : "/month"}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--foreground)]">
                        <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  size="lg"
                  className="w-full text-xs font-bold"
                  onClick={() => handleOpenCheckout(plan)}
                >
                  {plan.cta} <ArrowRight size={14} className="ml-1" />
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Enterprise Trust Banner */}
        <div className="mt-16 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
              <Shield size={28} />
            </div>
            <div>
              <h4 className="font-poppins font-bold text-base text-[var(--foreground)]">
                Need a Custom SLA or University Partner Tier?
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Contact our enterprise partnership team for bulk job posting packs, campus recruitment drives, and white-label options.
              </p>
            </div>
          </div>
          <Button variant="outline" size="md" onClick={() => toast.success("Enterprise sales representative notified.")} className="shrink-0 text-xs">
            Contact Sales Team
          </Button>
        </div>
      </div>

      {/* Checkout & Payment Gateway Modal */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)]">
                  Secure Checkout
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Upgrading to {selectedPlan.name}
                </p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1 rounded-lg hover:bg-[var(--muted)]">
                <X size={18} />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 size={52} className="text-emerald-500 mx-auto" />
                <h4 className="font-bold text-lg text-[var(--foreground)]">
                  Payment Successful!
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                  Your HireHub Pro subscription is now active. A digital tax invoice receipt has been generated.
                </p>
                <div className="p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] text-left text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>Transaction ID:</span>
                    <span className="font-mono">HH-TX-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span>{isINR ? `₹${calculateFinalPrice()}` : `$${calculateFinalPrice()}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gateway:</span>
                    <span>{paymentGateway === "razorpay" ? "Razorpay (India UPI/Card)" : "Stripe Global (Credit Card)"}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      toast.success("PDF Invoice downloaded!")
                    }}
                  >
                    <Download size={13} className="mr-1" /> Download Invoice (PDF)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                {/* Gateway Selector */}
                <div>
                  <label className="text-xs font-semibold text-[var(--foreground)] block mb-1.5">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway("stripe")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        paymentGateway === "stripe"
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      <CreditCard size={16} /> Stripe Global (Cards)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentGateway("razorpay")}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        paymentGateway === "razorpay"
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      <Zap size={16} /> Razorpay (UPI, Netbanking)
                    </button>
                  </div>
                </div>

                {/* Promo Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <BadgePercent size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. HIREHUB20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] uppercase"
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm" className="text-xs">
                    Apply
                  </Button>
                </form>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Base Subscription ({billingCycle})</span>
                    <span>{isINR ? `₹${selectedPlan.priceMonthlyINR}` : `$${selectedPlan.priceMonthlyUSD}`}</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="flex justify-between text-emerald-500 font-medium">
                      <span>Annual Savings (20%)</span>
                      <span>-{isINR ? `₹${Math.round(selectedPlan.priceMonthlyINR * 0.2)}` : `$${Math.round(selectedPlan.priceMonthlyUSD * 0.2)}`}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-500 font-medium">
                      <span>Coupon Discount (20%)</span>
                      <span>-{isINR ? `₹${Math.round(selectedPlan.priceMonthlyINR * 0.2)}` : `$${Math.round(selectedPlan.priceMonthlyUSD * 0.2)}`}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[var(--border)] flex justify-between font-bold text-sm text-[var(--foreground)]">
                    <span>Total Due:</span>
                    <span>{isINR ? `₹${calculateFinalPrice()}` : `$${calculateFinalPrice()}`}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-xs font-bold"
                  onClick={handlePay}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing via Gateway..." : `Pay ${isINR ? `₹${calculateFinalPrice()}` : `$${calculateFinalPrice()}`} & Activate`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
