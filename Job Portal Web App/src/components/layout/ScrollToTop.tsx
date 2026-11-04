import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Automatically scrolls the window to the top (0, 0) whenever the route path or search changes.
 * Ensures that when a user clicks on any navigation link, tab, feature, or page,
 * they always land cleanly at the top of the page rather than remaining scrolled down.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Scroll window to top smoothly/instantly on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    })
  }, [pathname, search])

  return null
}
