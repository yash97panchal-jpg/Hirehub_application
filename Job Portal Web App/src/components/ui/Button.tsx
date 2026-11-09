import { forwardRef } from "react"
import { cn } from "../../utils/cn"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger"
  size?: "sm" | "md" | "lg" | "xl"
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer active:scale-[0.98]"

    const variants = {
      primary:
        "bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white shadow-sm hover:shadow font-semibold",
      secondary:
        "bg-white dark:bg-[#13223B] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm",
      outline:
        "border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/40 font-medium",
      ghost:
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
      accent:
        "bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-white shadow-sm font-semibold",
      danger:
        "bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white shadow-sm font-semibold",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-medium rounded-md",
      md: "px-4 py-2 text-sm font-medium rounded-lg",
      lg: "px-5 py-2.5 text-base font-semibold rounded-lg",
      xl: "px-6 py-3 text-lg font-semibold rounded-xl",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"
export default Button
