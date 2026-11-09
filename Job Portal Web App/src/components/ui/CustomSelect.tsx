import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
  value: string | number
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface CustomSelectProps {
  value: string | number
  onChange: (value: any) => void
  options: (SelectOption | string)[]
  placeholder?: string
  label?: string
  icon?: React.ReactNode
  size?: "sm" | "md" | "lg"
  className?: string
  menuClassName?: string
  disabled?: boolean
  align?: "left" | "right"
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  icon,
  size = "md",
  className = "",
  menuClassName = "",
  disabled = false,
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt }
    }
    return opt
  })

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-3.5 py-2 text-xs sm:text-sm rounded-xl gap-2",
    lg: "px-4 py-2.5 text-sm rounded-xl gap-2.5",
  }[size]

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
    >
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between font-medium transition-all duration-150 border bg-[var(--card)] text-[var(--foreground)] ${sizeClasses} ${
          isOpen
            ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xs"
            : "border-[var(--border)] hover:border-[var(--primary)]/60 hover:bg-[var(--card)]/90"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-[var(--primary)] shrink-0">{icon}</span>}
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <span className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedOption?.badge !== undefined && (
            <span className="px-1.5 py-0.2 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            size={size === "sm" ? 13 : 15}
            className={`text-[var(--muted-foreground)] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[var(--primary)]" : ""
            }`}
          />
        </span>
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1.5 w-full min-w-[180px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-elevated)] backdrop-blur-md p-1.5 z-50 max-h-64 overflow-y-auto ${menuClassName}`}
          style={{
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--border)",
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] text-center">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer group ${
                    isSelected
                      ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                      : "text-[var(--foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && (
                      <span className={isSelected ? "text-white" : "text-[var(--primary)]"}>
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>

                  <span className="flex items-center gap-1.5 shrink-0 ml-2">
                    {opt.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--primary)]/15 group-hover:text-[var(--primary)]"
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        className={isSelected ? "text-white" : "text-[var(--primary)]"}
                      />
                    )}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
