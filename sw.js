/**
 * sw.js — Soil Intelligence Service Worker
 * Cache-first for static assets; network-first for SDA API and data files.
 * Enables offline map viewing for NRCS field staff with cached tiles.
 */

const VERSION = "soil-v3";
const CACHE = `soil-cache-${VERSION}`;
const DATA_CACHE = "soil-data-v1";

// Static shell assets to precache on install
const PRECACHE = [
  "/",
  "/index.html",
  "/Regenerative-Agriculture-Risk-Map.html",
  "/soil-data-stories.html",
  "/sql-explorer.html",
  "/data-models.html",
  "/county-risk-leaderboard.html",
  "/soil-risk-explorer.html",
  "/soil-data-visual-lab.html",
  "/data/interp_data.json",
  "/data/mukey_ratings.json",
  "/data/sql-index.json",
  "/data/soil_state_agg.json",
];

// Domains that should always go network-first (live SDA queries)
const NETWORK_FIRST_HOSTS = [
  "sdmdataaccess.sc.egov.usda.gov",
  "sdmdataaccess.nrcs.usda.gov",
];

// Domains served cache-first (tiles, CDN libs)
const CACHE_FIRST_HOSTS = [
  "cdn.jsdelivr.net",
  "unpkg.com",
  "basemaps.cartocdn.com",
  "server.arcgisonline.com",
];

// ── INSTALL ───────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE.map((p) => new Request(p, { cache: "reload" }))),
      )
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[sw] precache partial failure:", err)),
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE && k !== DATA_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── FETCH ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and browser-extension requests
  if (event.request.method !== "GET") return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Network-first: SDA API endpoints
  if (NETWORK_FIRST_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(networkFirst(event.request, DATA_CACHE, 8000));
    return;
  }

  // Cache-first: CDN libraries and tile servers
  if (CACHE_FIRST_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(cacheFirst(event.request, CACHE));
    return;
  }

  // Same-origin: network-first for HTML/JS/CSS so a new deploy reaches users immediately (falls
  // back to cache only when offline); cache-first for heavy data files (offline maps keep working).
  // NOTE: stale-while-revalidate here used to serve the PREVIOUS build first, so app code changes
  // took two loads (or never, with a normal refresh) to appear — a deploy looked "not deployed".
  if (url.hostname === self.location.hostname) {
    const isData =
      url.pathname.startsWith("/data/") ||
      url.pathname.endsWith(".pmtiles") ||
      url.pathname.endsWith(".json");
    event.respondWith(
      isData
        ? cacheFirst(event.request, DATA_CACHE)
        : networkFirst(event.request, CACHE, 6000),
    );
  }
});

// ── STRATEGIES ────────────────────────────────────────────────────

/** Network first, fall back to cache. Timeout after ms. */
async function networkFirst(request, cacheName, timeoutMs = 6000) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return offlineFallback(request);
  }
}

/** Cache first, fall back to network and update cache. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return offlineFallback(request);
  }
}

/** Minimal offline fallback for HTML pages. */
function offlineFallback(request) {
  if (request.headers.get("Accept")?.includes("text/html")) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Offline — Soil Intelligence</title>
      <style>body{font-family:system-ui;background:#04060c;color:#d4daf0;
        display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
      h1{font-size:1.4rem;margin-bottom:8px}p{color:#8892b0;font-size:13px}</style></head>
      <body><div><h1>You're offline</h1>
      <p>Soil Intelligence map data is cached for offline use.<br>
      SDA queries require an internet connection.</p></div></body></html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  }
  return new Response("Offline", { status: 503 });
}
