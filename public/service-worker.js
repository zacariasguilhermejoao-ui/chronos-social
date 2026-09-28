/* Chrónos Social — Service Worker */
const CACHE_VERSION = "v1";
const STATIC_CACHE = `chronos-static-${CACHE_VERSION}`;
const PAGES_CACHE = `chronos-pages-${CACHE_VERSION}`;
const CHRONOS_CACHE_PREFIX = "chronos-";

const DEV =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";
const log = (...args) => {
  if (DEV) console.log("[SW]", ...args);
};

const PRECACHE_URLS = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  log("install", CACHE_VERSION);
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  log("activate", CACHE_VERSION);
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (n) =>
              n.startsWith(CHRONOS_CACHE_PREFIX) &&
              n !== STATIC_CACHE &&
              n !== PAGES_CACHE,
          )
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

function isApiOrAuth(url) {
  return (
    url.hostname.includes("supabase") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/rest/") ||
    url.pathname.startsWith("/realtime/") ||
    url.pathname.startsWith("/storage/") ||
    url.pathname.startsWith("/functions/") ||
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("onesignal")
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (isApiOrAuth(url)) return;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone()).catch(() => {});
        return res;
      })
    );
  }
});
