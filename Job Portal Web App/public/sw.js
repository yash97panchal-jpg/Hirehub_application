// HireHub Service Worker for PWA & Mobile Web Application
// Version: 3.0.0
const CACHE_NAME = "hirehub-cache-v3"
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/favicon.png",
  "/manifest.json"
]

// 1. INSTALL: Pre-cache core application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("PWA: Pre-caching partial failure:", err)
      })
    })
  )
  self.skipWaiting()
})

// 2. ACTIVATE: Selective cache cleanup (only purge older HireHub caches; never touch unrelated origin caches)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("hirehub-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// 3. FETCH: Safe caching policy
// - NEVER cache authentication, Supabase REST/Auth API requests, or user-private payloads
// - Network-first for HTML navigation with offline SPA fallback
// - Stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Disallow caching for non-GET requests or sensitive endpoints
  const isApiRequest = 
    url.pathname.includes("/rest/v1/") ||
    url.pathname.includes("/auth/v1/") ||
    url.pathname.includes("/storage/v1/") ||
    url.hostname.includes("supabase.co") ||
    event.request.headers.has("Authorization")

  if (event.request.method !== "GET" || isApiRequest) {
    return
  }

  // Navigation requests: Network first with offline fallback to index.html
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
        .catch(() => {
          return caches.match("/index.html").then((cached) => {
            return cached || caches.match(event.request)
          })
        })
    )
    return
  }

  // Static assets (CSS, JS, images, icons, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.pathname.startsWith("/assets/") ||
              url.pathname.endsWith(".png") ||
              url.pathname.endsWith(".jpg") ||
              url.pathname.endsWith(".jpeg") ||
              url.pathname.endsWith(".svg") ||
              url.pathname.endsWith(".css") ||
              url.pathname.endsWith(".js") ||
              url.pathname.endsWith(".woff2"))
          ) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
        .catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  )
})
