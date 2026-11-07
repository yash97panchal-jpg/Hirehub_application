import { useMemo } from "react"
import { Sparkles } from "lucide-react"
import type { SkillMatchResult } from "../../utils/skillMatcher"

interface RoundSkillMatchBadgeProps {
  skillMatch: SkillMatchResult
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export default function RoundSkillMatchBadge({
  skillMatch,
  size = "md",
  showLabel = true,
  className = "",
}: RoundSkillMatchBadgeProps) {
  const { matchPercent, matchedCount, totalCount, matchedSkills } = skillMatch

  // Color scheme based on percentage
  const theme = useMemo(() => {
    if (matchPercent >= 80) {
      return {
        stroke: "#10b981", // emerald-500
        bgRing: "rgba(16, 185, 129, 0.15)",
        text: "text-emerald-600 dark:text-emerald-400",
        badgeBg: "bg-emerald-500/10 border-emerald-500/25",
        sparkle: "text-emerald-500",
        label: "High Match",
      }
    }
    if (matchPercent >= 60) {
      return {
        stroke: "var(--primary, #3b82f6)",
        bgRing: "rgba(59, 130, 246, 0.15)",
        text: "text-[var(--primary)]",
        badgeBg: "bg-[var(--primary)]/10 border-[var(--primary)]/25",
        sparkle: "text-[var(--primary)]",
        label: "Good Match",
      }
    }
    return {
      stroke: "#f59e0b", // amber-500
      bgRing: "rgba(245, 158, 11, 0.15)",
      text: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-500/10 border-amber-500/25",
      sparkle: "text-amber-500",
      label: "Partial Match",
    }
  }, [matchPercent])

  // Dimensions
  const config = {
    sm: {
      dim: 36,
      r: 14,
      strokeWidth: 3,
      c: 2 * Math.PI * 14, // 87.96
      textSize: "text-[10px]",
      subSize: "text-[7px]",
    },
    md: {
      dim: 44,
      r: 17,
      strokeWidth: 3.5,
      c: 2 * Math.PI * 17, // 106.81
      textSize: "text-[11px]",
      subSize: "text-[8px]",
    },
    lg: {
      dim: 56,
      r: 22,
      strokeWidth: 4,
      c: 2 * Math.PI * 22, // 138.23
      textSize: "text-[14px]",
      subSize: "text-[9px]",
    },
  }[size]

  const dashOffset = config.c * (1 - matchPercent / 100)
  const center = config.dim / 2

  const tooltipText = `Skill Match: ${matchedCount} of ${totalCount} skills matched with your profile resume (${matchedSkills.join(", ") || "No direct matches"})`

  return (
    <div
      className={`inline-flex items-center gap-2.5 p-1.5 rounded-2xl border transition-all ${theme.badgeBg} ${className}`}
      title={tooltipText}
    >
      {/* Round Circular Progress Meter */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: config.dim, height: config.dim }}
      >
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox={`0 0 ${config.dim} ${config.dim}`}
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={config.r}
            fill="none"
            stroke={theme.bgRing}
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle stroke */}
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
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>

        {/* Text inside the round circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span
            className={`font-poppins font-extrabold leading-none ${config.textSize} ${theme.text}`}
          >
            {matchPercent}%
          </span>
          <span
            className={`font-bold uppercase tracking-wider text-[var(--muted-foreground)] leading-none mt-0.5 ${config.subSize}`}
          >
            match
          </span>
        </div>
      </div>

      {/* Optional Label & Skill breakdown */}
      {showLabel && (
        <div className="flex flex-col text-left pr-1.5 min-w-0">
          <div className="flex items-center gap-1">
            <Sparkles size={11} className={`${theme.sparkle} shrink-0`} />
            <span className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
              {theme.label}
            </span>
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)] font-medium leading-tight mt-0.5 truncate">
            {matchedCount}/{totalCount} skills match resume
          </span>
        </div>
      )}
    </div>
  )
}
