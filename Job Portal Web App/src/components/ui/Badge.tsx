import { cn } from "../../utils/cn"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "primary" | "accent" | "success" | "error" | "warning" | "outline"
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
    default: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    primary:
      "bg-[var(--primary)]/15 text-[#9A5B00] dark:bg-[var(--primary)]/20 dark:text-[var(--primary)] font-semibold",
    accent:
      "bg-[var(--accent)]/15 text-[var(--accent)] dark:bg-[var(--accent)]/40 dark:text-[#E2E8F0] font-semibold",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    error: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    outline: "border border-[var(--border)] text-[var(--muted-foreground)]",
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
