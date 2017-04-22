var CACHE_NAME = "expense-manager-cache";
var urlsToCache = [
  "/",
  "/style.css",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://code.getmdl.io/1.3.0/material.indigo-pink.min.css",
  "/icons/favicon-32x32.png",
  "/icons/favicon-16x16.png",
  "https://code.getmdl.io/1.3.0/material.min.js",
  "/script.js"
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
