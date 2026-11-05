import React, { useState, useRef, useEffect } from "react"
import { Search, Briefcase, Zap, Layers, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getRoleAndSkillSuggestions, RoleSuggestion, SkillSuggestion } from "../../data/searchSuggestions"
import { useJobStore } from "../../store/jobStore"

interface RoleSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSelectSuggestion?: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  className?: string
  inputClassName?: string
  variant?: "hero" | "dark"
}

export default function RoleSearchInput({
  value,
  onChange,
  onSelectSuggestion,
  onSubmit,
  placeholder = "Search role, title, or skills (e.g. Python Developer)…",
  className = "",
  inputClassName = "",
  variant = "hero",
}: RoleSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { jobs } = useJobStore()

  // Get matching suggestions
  const suggestions = getRoleAndSkillSuggestions(value, jobs)

  // Flatten suggestions for keyboard navigation
  const flatItems: { type: "role" | "skill" | "category"; label: string; sub?: string }[] = [
    ...suggestions.roles.map((r) => ({ type: "role" as const, label: r.title, sub: r.field })),
    ...suggestions.skills.map((s) => ({ type: "skill" as const, label: s.name, sub: s.relatedRole ? `Related to ${s.relatedRole}` : "Skill" })),
    ...suggestions.categories.map((c) => ({ type: "category" as const, label: c, sub: "Category" })),
  ]

  const totalItems = flatItems.length

  // Outside click listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (itemValue: string) => {
    onChange(itemValue)
    setIsOpen(false)
    if (onSelectSuggestion) {
      onSelectSuggestion(itemValue)
    }
    if (onSubmit) {
      setTimeout(onSubmit, 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true)
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
    } else if (e.key === "Enter") {
      if (isOpen && highlightIndex >= 0 && highlightIndex < totalItems) {
        e.preventDefault()
        handleSelect(flatItems[highlightIndex].label)
      } else if (onSubmit) {
        setIsOpen(false)
        onSubmit()
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const isDark = variant === "dark"

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div className="relative flex items-center w-full">
        <Search
          size={18}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
            isDark ? "text-white/70" : "text-[var(--primary)]"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
            setHighlightIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 py-2.5 text-sm transition-all focus:outline-none ${
            isDark
              ? "bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-xl focus:ring-2 focus:ring-white/30"
              : "bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] rounded-xl"
          } ${inputClassName}`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("")
              inputRef.current?.focus()
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
              isDark ? "text-white/60 hover:text-white" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* AUTOCOMPLETE POPUP DROPDOWN */}
      <AnimatePresence>
        {isOpen && totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden backdrop-blur-xl max-h-[380px] overflow-y-auto no-scrollbar"
          >
            {/* Header hint */}
            <div className="px-3.5 py-2 text-[11px] font-bold tracking-wider uppercase text-[var(--muted-foreground)] bg-[var(--muted)]/50 border-b border-[var(--border)] flex items-center justify-between">
              <span>Suggestions for "{value || "Popular"}"</span>
              <span className="text-[10px] font-normal lowercase">role or skill</span>
            </div>

            {/* 1. ROLES SECTION */}
            {suggestions.roles.length > 0 && (
              <div className="p-1.5 border-b border-[var(--border)]/60">
                <div className="px-2.5 py-1 text-[11px] font-bold text-[var(--primary)] flex items-center gap-1.5">
                  <Briefcase size={12} />
                  <span>Job Role Suggestions</span>
                </div>
                <div className="space-y-0.5">
                  {suggestions.roles.map((r, idx) => {
                    const itemGlobalIndex = idx
                    const isSelected = highlightIndex === itemGlobalIndex
                    return (
                      <button
                        key={r.title}
                        type="button"
                        onClick={() => handleSelect(r.title)}
                        onMouseEnter={() => setHighlightIndex(itemGlobalIndex)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-[var(--primary)] text-white font-semibold"
                            : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                          <span className="truncate">{r.title}</span>
                        </div>
                        <span
                          className={`text-[10px] shrink-0 ml-2 px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {r.field}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2. SKILLS SECTION */}
            {suggestions.skills.length > 0 && (
              <div className="p-1.5 border-b border-[var(--border)]/60">
                <div className="px-2.5 py-1 text-[11px] font-bold text-amber-500 flex items-center gap-1.5">
                  <Zap size={12} />
                  <span>Skill Suggestions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {suggestions.skills.map((s, idx) => {
                    const itemGlobalIndex = suggestions.roles.length + idx
                    const isSelected = highlightIndex === itemGlobalIndex
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleSelect(s.name)}
                        onMouseEnter={() => setHighlightIndex(itemGlobalIndex)}
                        className={`text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-amber-500 text-white font-semibold"
                            : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold">{s.name}</span>
                        </div>
                        {s.relatedRole && (
                          <span
                            className={`text-[10px] truncate max-w-[110px] ${
                              isSelected ? "text-white/80" : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {s.relatedRole}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. CATEGORIES SECTION */}
            {suggestions.categories.length > 0 && (
              <div className="p-1.5">
                <div className="px-2.5 py-1 text-[11px] font-bold text-indigo-500 flex items-center gap-1.5">
                  <Layers size={12} />
                  <span>Category Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-1 p-1">
                  {suggestions.categories.map((c, idx) => {
                    const itemGlobalIndex = suggestions.roles.length + suggestions.skills.length + idx
                    const isSelected = highlightIndex === itemGlobalIndex
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelect(c)}
                        onMouseEnter={() => setHighlightIndex(itemGlobalIndex)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
