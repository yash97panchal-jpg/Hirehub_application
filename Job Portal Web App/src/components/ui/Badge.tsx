import { cn } from "../../utils/cn"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "primary" | "accent" | "navy" | "success" | "error" | "warning" | "outline"
  size?: "sm" | "md"
  className?: string
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60",
    primary:
      "bg-orange-50 text-[#E8820A] dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60 font-semibold",
    accent:
      "bg-orange-50 text-[#E8820A] dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60 font-semibold",
    navy:
      "bg-[#101F3E]/10 text-[#101F3E] dark:bg-white/10 dark:text-white border border-[#101F3E]/20 dark:border-white/20 font-semibold",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-medium",
    error:
      "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/60 dark:border-red-800/60 font-medium",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-medium",
    outline: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/40",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
