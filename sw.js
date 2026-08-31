/**
 * Phase 1 service worker: caches the app shell (HTML/CSS/JS/icons) so
 * the app opens offline once it's been loaded once. Phase 5 will layer
 * Firestore's own offline persistence on top for actual data records —
 * this cache is only for the app's own code/UI, not student data.
 */

const CACHE_NAME = "gazal-files-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/lang.js",
  "./js/icons.js",
  "./js/pin.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
