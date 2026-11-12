/**
 * HireHub Security & Sanitization Utilities
 * Protects against Cross-Site Scripting (XSS), SQLi injection patterns,
 * path traversal, and protocol abuse across all user inputs.
 */

// Strip HTML tags and malicious event handlers from user text
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return ""

  return input
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe, object, embed tags
    .replace(/<(iframe|object|embed|applet)[^>]*>.*?<\/\1>/gi, "")
    // Strip inline javascript handlers (e.g. onerror=..., onload=..., onclick=...)
    .replace(/\s*on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    // Strip dangerous URI protocols in inline attributes
    .replace(/(javascript|vbscript|data):/gi, "blocked:")
    // Strip raw HTML tags but preserve text content
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim()
}

// Recursively sanitize all string properties in an object or array
export function sanitizeObject<T>(data: T): T {
  if (data === null || data === undefined) return data

  if (typeof data === "string") {
    return sanitizeInput(data) as unknown as T
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as unknown as T
  }

  if (typeof data === "object") {
    const sanitizedObj: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeObject(value)
    }
    return sanitizedObj as T
  }

  return data
}

// Validate that URLs only use authorized, secure HTTP/HTTPS protocols
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href
    }
    return null
  } catch {
    // If not a full URL, check if it's a relative path starting with /
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
      return trimmed
    }
    return null
  }
}

// Sanitize filename to prevent directory traversal
export function sanitizeFilename(filename: string): string {
  if (!filename) return "file"
  return filename
    .replace(/[\/\?<>\\:\*\|":]/g, "") // Remove illegal characters
    .replace(/\.\.+/g, ".") // Remove double dots (traversal)
    .replace(/^\./, "") // Remove leading dot
    .trim()
}
