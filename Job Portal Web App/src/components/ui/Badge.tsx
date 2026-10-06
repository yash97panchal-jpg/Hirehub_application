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
      "bg-[var(--muted)] text-blue-700 dark:bg-blue-900/40 dark:text-white/70",
    accent:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    success:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    error: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    warning:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
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
