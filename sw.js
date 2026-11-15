// HireHub Service Worker for PWA & Mobile Web Application
// Version: 4.0.0 - Re-themed Midnight Navy & Amber Orange
const CACHE_NAME = "hirehub-cache-v4-navy";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/pages.js",
  "/dynamic.js",
  "/ui.js",
  "/favicon.png",
  "/logo.png",
  "/manifest.json"
];

// 1. INSTALL: Force immediate activation
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("PWA Pre-cache notice:", err);
      });
    })
  );
});

// 2. ACTIVATE: Purge ALL old caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("PWA: Purging outdated cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Network-first policy to always show the latest live design
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/index.html");
        });
      })
  );
});
