/**
 * Environment detection utility.
 * Determines whether the app is currently running in a local development environment.
 * 
 * - Returns true when running on localhost, 127.0.0.1, [::1], or in Vite dev mode.
 * - Returns false when running on any live production domain (e.g. Vercel, Netlify, custom domain).
 * - Can also be manually forced with VITE_USE_MOCK_DATA="true" | "false".
 */
export const isLocalhost = (): boolean => {
  if (typeof window === "undefined") return false

  // Allow explicit override via environment variables
  if (import.meta.env.VITE_USE_MOCK_DATA === "true") return true
  if (import.meta.env.VITE_USE_MOCK_DATA === "false") return false

  const hostname = window.location.hostname
  const isDevHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")

  return isDevHost || Boolean(import.meta.env.DEV)
}
