// Service Worker für den Offline-Betrieb des AQM-01 Bühnen-Timers
const CACHE_NAME = "aqm01-timer-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./sw.js"];

// Beim Installieren alle lokalen Dateien sicher in den Cache laden
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Beim Aktivieren alte Cache-Versionen entfernen und sofort übernehmen
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Anfragen zuerst aus dem Cache bedienen, sonst über das Netz laden
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) {
        return cached;
      }
      return fetch(event.request);
    })
  );
});
