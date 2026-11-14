import { forwardRef } from "react"
import { cn } from "../../utils/cn"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "navy" | "outline" | "ghost" | "accent" | "danger"
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
      "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7941D] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer active:scale-[0.98]"

    const variants = {
      primary:
        "bg-[#F7941D] hover:bg-[#E8820A] active:bg-[#C46A04] text-[#101F3E] shadow-sm hover:shadow-md font-bold",
      secondary:
        "bg-white dark:bg-[#101F3E] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm",
      navy:
        "bg-[#101F3E] hover:bg-[#182C58] active:bg-[#0B152B] text-white shadow-sm hover:shadow font-semibold",
      outline:
        "border border-[#F7941D] text-[#E8820A] dark:text-orange-400 dark:border-orange-500 hover:bg-orange-50/70 dark:hover:bg-orange-950/20 font-semibold",
      ghost:
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
      accent:
        "bg-[#F7941D] hover:bg-[#E8820A] active:bg-[#C46A04] text-[#101F3E] shadow-sm font-bold",
      danger:
        "bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white shadow-sm font-semibold",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-medium rounded-full",
      md: "px-4 py-2 text-sm font-medium rounded-full",
      lg: "px-5 py-2.5 text-base font-semibold rounded-full",
      xl: "px-6 py-3 text-lg font-semibold rounded-full",
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
