/**
 * Application-wide controls to prevent unauthorized copying and zooming
 * while keeping inputs, buttons, and form interactions fully functional.
 */
export function setupAppProtection() {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {}

  // Helper: check if element is an editable input or textarea
  const isInputElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false
    const tag = target.tagName.toUpperCase()
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      target.isContentEditable ||
      Boolean(target.closest("input, textarea, [contenteditable='true']"))
    )
  }

  // 1. PREVENT COPY & CUT EVENTS (Outside inputs)
  const handleCopy = (e: ClipboardEvent) => {
    if (!isInputElement(e.target)) {
      e.preventDefault()
    }
  }

  const handleCut = (e: ClipboardEvent) => {
    if (!isInputElement(e.target)) {
      e.preventDefault()
    }
  }

  // 2. PREVENT CONTEXT MENU (Right Click outside inputs)
  const handleContextMenu = (e: MouseEvent) => {
    if (!isInputElement(e.target)) {
      e.preventDefault()
    }
  }

  // 3. PREVENT ZOOM KEYBOARD SHORTCUTS & COPY SHORTCUTS OUTSIDE INPUTS
  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey

    // Prevent zoom shortcuts (Ctrl + Plus, Minus, Zero, etc.)
    if (isCtrlOrMeta) {
      const zoomKeys = ["+", "-", "=", "_", "0", ")"]
      if (
        zoomKeys.includes(e.key) ||
        e.code === "NumpadAdd" ||
        e.code === "NumpadSubtract" ||
        e.keyCode === 187 ||
        e.keyCode === 189 ||
        e.keyCode === 107 ||
        e.keyCode === 109
      ) {
        e.preventDefault()
        return
      }
    }

    // Prevent copy/cut/select-all keyboard shortcuts outside form inputs
    if (isCtrlOrMeta && !isInputElement(e.target)) {
      const lowerKey = e.key.toLowerCase()
      if (lowerKey === "c" || lowerKey === "x" || lowerKey === "a" || lowerKey === "u" || lowerKey === "s") {
        e.preventDefault()
      }
    }
  }

  // 4. PREVENT MOUSE WHEEL ZOOM (Ctrl + Wheel)
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
    }
  }

  // 5. PREVENT TOUCH PINCH-TO-ZOOM (Touch events with multiple fingers)
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault()
    }
  }

  // 6. PREVENT GESTURE ZOOM (Safari / iOS)
  const handleGesture = (e: Event) => {
    e.preventDefault()
  }

  // 7. PREVENT DOUBLE-TAP ZOOM ON MOBILE
  let lastTouchEndTime = 0
  const handleTouchEnd = (e: TouchEvent) => {
    const now = Date.now()
    if (now - lastTouchEndTime <= 300) {
      if (!isInputElement(e.target)) {
        e.preventDefault()
      }
    }
    lastTouchEndTime = now
  }

  // Register listeners with { passive: false } where preventDefault is called
  document.addEventListener("copy", handleCopy)
  document.addEventListener("cut", handleCut)
  document.addEventListener("contextmenu", handleContextMenu)
  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("wheel", handleWheel, { passive: false })
  document.addEventListener("touchmove", handleTouchMove, { passive: false })
  document.addEventListener("gesturestart", handleGesture, { passive: false })
  document.addEventListener("gesturechange", handleGesture, { passive: false })
  document.addEventListener("gestureend", handleGesture, { passive: false })
  document.addEventListener("touchend", handleTouchEnd, { passive: false })

  // Return cleanup function
  return () => {
    document.removeEventListener("copy", handleCopy)
    document.removeEventListener("cut", handleCut)
    document.removeEventListener("contextmenu", handleContextMenu)
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("wheel", handleWheel)
    document.removeEventListener("touchmove", handleTouchMove)
    document.removeEventListener("gesturestart", handleGesture)
    document.removeEventListener("gesturechange", handleGesture)
    document.removeEventListener("gestureend", handleGesture)
    document.removeEventListener("touchend", handleTouchEnd)
  }
}
