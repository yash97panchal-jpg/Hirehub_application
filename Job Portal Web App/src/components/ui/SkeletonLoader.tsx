import React from "react"

interface SkeletonProps {
  className?: string
  variant?: "text" | "rectangular" | "circular" | "card" | "table-row"
  count?: number
}

export function Skeleton({ className = "", variant = "rectangular" }: { className?: string; variant?: "text" | "rectangular" | "circular" }) {
  const baseClasses = "animate-pulse bg-[var(--muted)]/70 dark:bg-slate-800/80"
  
  if (variant === "circular") {
    return <div className={`rounded-full shrink-0 ${baseClasses} ${className}`} aria-hidden="true" />
  }

  if (variant === "text") {
    return <div className={`h-4 rounded-md ${baseClasses} ${className}`} aria-hidden="true" />
  }

  return <div className={`rounded-xl ${baseClasses} ${className}`} aria-hidden="true" />
}

export function JobCardSkeleton() {
  return (
    <div
      className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-card)] space-y-4"
      aria-label="Loading job listing"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-44 h-5" />
            <Skeleton variant="text" className="w-28 h-3.5" />
          </div>
        </div>
        <Skeleton className="w-20 h-7 rounded-full" />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Skeleton className="w-24 h-6 rounded-lg" />
        <Skeleton className="w-20 h-6 rounded-lg" />
        <Skeleton className="w-28 h-6 rounded-lg" />
      </div>

      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <Skeleton variant="text" className="w-32 h-4" />
        <Skeleton className="w-24 h-8 rounded-xl" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-[var(--border)]" aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton variant="text" className={`h-4 ${i === 0 ? "w-36" : i === 1 ? "w-28" : "w-20"}`} />
        </td>
      ))}
    </tr>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6" aria-busy="true" aria-label="Loading content">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-64 h-8" />
        <Skeleton variant="text" className="w-96 h-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    </div>
  )
}
