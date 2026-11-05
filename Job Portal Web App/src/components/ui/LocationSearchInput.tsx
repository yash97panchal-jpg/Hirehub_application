import React, { useState, useRef, useEffect } from "react"
import { MapPin, Globe, Building, Navigation, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getLocationHierarchySuggestions, LocationSuggestionItem } from "../../data/searchSuggestions"

interface LocationSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSelectSuggestion?: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  className?: string
  inputClassName?: string
  variant?: "hero" | "dark"
}

export default function LocationSearchInput({
  value,
  onChange,
  onSelectSuggestion,
  onSubmit,
  placeholder = "Search country, state, or city (e.g. India, California, San Francisco)…",
  className = "",
  inputClassName = "",
  variant = "hero",
}: LocationSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get matching tiered location suggestions
  const { countries, states, cities } = getLocationHierarchySuggestions(value)

  // Flatten suggestions for keyboard navigation
  const flatItems: LocationSuggestionItem[] = [
    ...countries,
    ...states,
    ...cities,
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

  const handleSelect = (item: LocationSuggestionItem) => {
    onChange(item.value)
    setIsOpen(false)
    if (onSelectSuggestion) {
      onSelectSuggestion(item.value)
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
        handleSelect(flatItems[highlightIndex])
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
        <MapPin
          size={18}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
            isDark ? "text-white/70" : "text-[var(--muted-foreground)]"
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

      {/* THREE-TIER LOCATION AUTOCOMPLETE POPUP DROPDOWN */}
      <AnimatePresence>
        {isOpen && totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden backdrop-blur-xl max-h-[390px] overflow-y-auto no-scrollbar"
          >
            {/* Header hint */}
            <div className="px-3.5 py-2 text-[11px] font-bold tracking-wider uppercase text-[var(--muted-foreground)] bg-[var(--muted)]/50 border-b border-[var(--border)] flex items-center justify-between">
              <span>Location suggestions for "{value || "All"}"</span>
              <span className="text-[10px] font-normal lowercase">3-tier hierarchy</span>
            </div>

            {/* TIER 1: COUNTRY NAME SUGGESTION */}
            {countries.length > 0 && (
              <div className="p-1.5 border-b border-[var(--border)]/60">
                <div className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Globe size={13} />
                  <span>1. Country Suggestions</span>
                </div>
                <div className="space-y-0.5">
                  {countries.map((c, idx) => {
                    const itemGlobalIndex = idx
                    const isSelected = highlightIndex === itemGlobalIndex
                    return (
                      <button
                        key={`country-${c.label}`}
                        type="button"
                        onClick={() => handleSelect(c)}
                        onMouseEnter={() => setHighlightIndex(itemGlobalIndex)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white font-semibold"
                            : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm">🌐</span>
                          <span className="font-bold truncate">{c.label}</span>
                        </div>
                        <span
                          className={`text-[10px] shrink-0 ml-2 px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          Country
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TIER 2: COUNTRY WITH STATE SUGGESTION */}
            {states.length > 0 && (
              <div className="p-1.5 border-b border-[var(--border)]/60">
                <div className="px-2.5 py-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <Building size={13} />
                  <span>2. Country with State Suggestions</span>
                </div>
                <div className="space-y-0.5">
                  {states.map((s, idx) => {
                    const itemGlobalIndex = countries.length + idx
                    const isSelected = highlightIndex === itemGlobalIndex
                    return (
                      <button
                        key={`state-${s.label}`}
                        type="button"
                        onClick={() => handleSelect(s)}
                        onMouseEnter={() => setHighlightIndex(itemGlobalIndex)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-sky-600 text-white font-semibold"
                            : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm">🏛️</span>
                          <span className="font-semibold truncate">{s.label}</span>
                        </div>
                        <span
                          className={`text-[10px] shrink-0 ml-2 px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          }`}
                        >
                          State & Country
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TIER 3: COUNTRY WITH STATE WITH CITY SUGGESTION */}
            {cities.length > 0 && (
              <div className="p-1.5">
                <div className="px-2.5 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                  <Navigation size={13} />
                  <span>3. Country, State with City Suggestions</span>
                </div>
                <div className="space-y-0.5">
                  {cities.map((cityItem, idx) => {
                    const itemGlobalIndex = countries.length + states.length + idx
                    const isSelected = highlightIndex === itemGlobalIndex
                    return (
                      <button
                        key={`city-${cityItem.label}`}
                        type="button"
                        onClick={() => handleSelect(cityItem)}
                        onMouseEnter={() => setHighlightIndex(itemGlobalIndex)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-violet-600 text-white font-semibold"
                            : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm">📍</span>
                          <span className="truncate">{cityItem.label}</span>
                        </div>
                        <span
                          className={`text-[10px] shrink-0 ml-2 px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          }`}
                        >
                          City, State & Country
                        </span>
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
