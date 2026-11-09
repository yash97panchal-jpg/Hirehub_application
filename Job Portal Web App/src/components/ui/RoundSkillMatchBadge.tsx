import { useState, useMemo } from "react"
import { Sparkles, Check, AlertCircle } from "lucide-react"
import type { SkillMatchResult } from "../../utils/skillMatcher"

export type RoundBadgeSize = "xs" | "sm" | "md" | "lg"

interface RoundSkillMatchBadgeProps {
  skillMatch: Partial<SkillMatchResult> & {
    matchPercent: number
    matchedSkills: string[]
    matchedCount: number
    totalCount: number
  }
  size?: RoundBadgeSize
  showTooltip?: boolean
  className?: string
}

export default function RoundSkillMatchBadge({
  skillMatch,
  size = "sm",
  showTooltip = true,
  className = "",
}: RoundSkillMatchBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { matchPercent, matchedCount, totalCount, matchedSkills } = skillMatch

  // Theming based on percentage threshold
  const theme = useMemo(() => {
    if (matchPercent >= 80) {
      return {
        stroke: "#10b981", // emerald-500
        track: "rgba(16, 185, 129, 0.16)",
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/30",
        glow: "shadow-[0_0_12px_rgba(16,185,129,0.25)]",
        label: "High Match",
        badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      }
    }
    if (matchPercent >= 60) {
      return {
        stroke: "#3b82f6", // blue-500
        track: "rgba(59, 130, 246, 0.16)",
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/30",
        glow: "shadow-[0_0_12px_rgba(59,130,246,0.25)]",
        label: "Good Match",
        badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
      }
    }
    return {
      stroke: "#f59e0b", // amber-500
      track: "rgba(245, 158, 11, 0.16)",
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.25)]",
      label: "Partial Match",
      badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    }
  }, [matchPercent])

  // Precision dimensions for true circular SVG geometry
  const config = {
    xs: {
      dim: 32,
      r: 12,
      strokeWidth: 2.5,
      c: 2 * Math.PI * 12, // ~75.4
      textSize: "text-[10px]",
      subSize: "text-[6px]",
      showSub: false,
    },
    sm: {
      dim: 40,
      r: 15,
      strokeWidth: 3,
      c: 2 * Math.PI * 15, // ~94.25
      textSize: "text-[11px]",
      subSize: "text-[6.5px]",
      showSub: true,
    },
    md: {
      dim: 48,
      r: 18.5,
      strokeWidth: 3.5,
      c: 2 * Math.PI * 18.5, // ~116.24
      textSize: "text-[13px]",
      subSize: "text-[7.5px]",
      showSub: true,
    },
    lg: {
      dim: 62,
      r: 24,
      strokeWidth: 4,
      c: 2 * Math.PI * 24, // ~150.8
      textSize: "text-[17px]",
      subSize: "text-[9px]",
      showSub: true,
    },
  }[size]

  const dashOffset = config.c * (1 - matchPercent / 100)
  const center = config.dim / 2

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pure Circular Progress Gauge */}
      <div
        className={`relative rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 ${theme.bg} ${theme.glow}`}
        style={{ width: config.dim, height: config.dim }}
        aria-label={`${matchPercent}% skill match with your profile`}
      >
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox={`0 0 ${config.dim} ${config.dim}`}
        >
          {/* Subtle background track circle */}
          <circle
            cx={center}
            cy={center}
            r={config.r}
            fill="none"
            stroke={theme.track}
            strokeWidth={config.strokeWidth}
          />
          {/* Active circular progress stroke */}
          <circle
            cx={center}
            cy={center}
            r={config.r}
            fill="none"
            stroke={theme.stroke}
            strokeWidth={config.strokeWidth}
            strokeDasharray={config.c}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span
            className={`font-poppins font-black leading-none tracking-tight ${config.textSize} ${theme.text}`}
          >
            {matchPercent}%
          </span>
          {config.showSub && (
            <span
              className={`font-extrabold uppercase tracking-widest text-[var(--muted-foreground)] leading-none mt-0.5 ${config.subSize}`}
            >
              MATCH
            </span>
          )}
        </div>
      </div>

      {/* Interactive Tooltip Popover */}
      {showTooltip && isHovered && (
        <div
          className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-60 p-3 rounded-2xl bg-[var(--card)]/95 backdrop-blur-md border border-[var(--border)] shadow-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.15))" }}
        >
          <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-[var(--border)]/60">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className={theme.text} />
              <span className={`text-xs font-bold ${theme.text}`}>
                {theme.label} ({matchPercent}%)
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
              {matchedCount}/{totalCount} Skills
            </span>
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)] mb-2 leading-relaxed">
            {matchedCount === 0
              ? "No direct skill matches found for this role."
              : `${matchedCount} of ${totalCount} required skills match your profile resume:`}
          </p>

          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 max-h-24 overflow-hidden">
              {matchedSkills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20 inline-flex items-center gap-1"
                >
                  <Check size={9} className="stroke-[3]" />
                  {skill}
                </span>
              ))}
              {matchedSkills.length > 5 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] font-medium">
                  +{matchedSkills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Pointer caret */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[var(--card)]" />
        </div>
      )}
    </div>
  )
}
