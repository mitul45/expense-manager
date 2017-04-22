var CACHE_NAME = "expense-manager-cache";
var urlsToCache = [
  "src/style.css",
  "icons/favicon-32x32.png",
  "icons/favicon-16x16.png",
  "src/script.js",
  "vendor/mdl/material.min.js",
  "vendor/mdl/material.min.css"
];

// cache after the first install
self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// listen for fetch events
self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
