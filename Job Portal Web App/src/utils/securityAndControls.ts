/**
 * Accessibility & Security Controls
 *
 * Implements standard client-side security (framebusting against clickjacking,
 * unhandled rejection safety) while fully preserving accessibility:
 * - Allows pinch-to-zoom and keyboard zoom (WCAG 1.4.4 Resize text)
 * - Allows text selection and clipboard copying
 * - Allows normal browser navigation and context menus
 */
export function setupAppProtection() {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {}

  // 1. CLICKJACKING DEFENSE (Ensure app is not embedded inside malicious iframes)
  try {
    if (window.self !== window.top && window.top) {
      const isSameOrigin = window.top.location.origin === window.location.origin
      if (!isSameOrigin) {
        window.top.location.href = window.location.href
      }
    }
  } catch {
    try {
      if (window.top) {
        window.top.location.href = window.location.href
      }
    } catch {
      // Browser blocked top navigation; headers handle remainder
    }
  }

  // 2. ACCESSIBILITY COMPLIANCE
  // Explicitly ensure user-scalable zoom, clipboard, and keyboard navigation remain unhindered.
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (event.reason?.name === "AbortError") {
      event.preventDefault()
    }
  }

  window.addEventListener("unhandledrejection", handleUnhandledRejection)

  return () => {
    window.removeEventListener("unhandledrejection", handleUnhandledRejection)
  }
}
