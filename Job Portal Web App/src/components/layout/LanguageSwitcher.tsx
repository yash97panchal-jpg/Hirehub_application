import { useState, useRef, useEffect } from "react"
import { Globe, ChevronDown } from "lucide-react"
import { useLanguageStore, type Language } from "../../store/languageStore"

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
]

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = languages.find((l) => l.code === language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] transition-colors"
        title="Select Language"
      >
        <Globe size={13} className="text-[var(--primary)]" />
        <span>{current.code.toUpperCase()}</span>
        <ChevronDown size={11} className="text-[var(--muted-foreground)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                language === l.code
                  ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                  : "text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <span>{l.label}</span>
              <span className="text-sm">{l.flag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
