importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js");

//----- First Load Caching (cache dapat langsung digunakan tanpa reload terlebih dahulu)

workbox.core.skipWaiting();
workbox.core.clientsClaim();

//----- Pre-caching App Shell

workbox.precaching.precacheAndRoute(
   [
      {url: "/", revision: 1},
      {url: "/manifest.json", revision: 1},
      {url: "/index.html", revision: 1},
      {url: "/detail-klub.html", revision: 1},
      {url: "/main.bundle.js", revision: 1},
      {url: "/detailKlub.bundle.js", revision: 1},
      {url: "/halaman/beranda.html", revision: 1},
      {url: "/halaman/main-header.html", revision: 1},
      {url: "/halaman/sec-header.html", revision: 1},
      {url: "/halaman/klub.html", revision: 1},
      {url: "/halaman/pertandingan.html", revision: 1},
      {url: "/halaman/klasemen.html", revision: 1},
      {url: "/halaman/top-skor.html", revision: 1},
      {url: "/halaman/favorit.html", revision: 1},
      {url: "/halaman/tentang.html", revision: 1},
      {url: "/halaman/kontak.html", revision: 1},
      {url: "/images/logo.png", revision: 1},
      {url: "/images/logo-horizontal.png", revision: 1},
      {url: "/images/logo-horizontal-white.png", revision: 1},
      {url: "/images/laliga-horizontal.png", revision: 1},
      {url: "/images/laliga-horizontal-white.png", revision: 1},
      {url: "/images/laliga-background.jpg", revision: 1},
      {url: "/images/laliga-club.jpg", revision: 1},
      {url: "/images/laliga-match.jpg", revision: 1},
      {url: "/images/laliga-coach.jpg", revision: 1},
      {url: "/images/laliga-winner.jpg", revision: 1},
      {url: "/images/laliga-players.jpg", revision: 1},
      {url: "/images/icons/favicon.ico", revision: 1},
      {url: "/images/icons/icon-72x72.png", revision: 1},
      {url: "/images/icons/icon-96x96.png", revision: 1},
      {url: "/images/icons/icon-128x128.png", revision: 1},
      {url: "/images/icons/icon-144x144.png", revision: 1},
      {url: "/images/icons/icon-152x152.png", revision: 1},
      {url: "/images/icons/icon-192x192.png", revision: 1},
      {url: "/images/icons/icon-384x384.png", revision: 1},
      {url: "/images/icons/icon-512x512.png", revision: 1},
      {url: "/images/icons/apple-touch-icon.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-57x57.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-72x72.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-76x76.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-114x114.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-120x120.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-144x144.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-152x152.png", revision: 1},
      {url: "/images/icons/apple-touch-icon-180x180.png", revision: 1}
   ],
   {
      ignoreURLParametersMatching: [/.*/]
   }
);

//----- Google Fonts Caching

workbox.routing.registerRoute(
   /^https:\/\/fonts\.googleapis\.com/,
   new workbox.strategies.StaleWhileRevalidate({
      cacheName: "google-fonts-css",
      plugins: [
         new workbox.cacheableResponse.CacheableResponsePlugin({
            statuses: [0, 200]
         })
      ]
   })
)

workbox.routing.registerRoute(
   /^https:\/\/fonts\.gstatic\.com/,
   new workbox.strategies.CacheFirst({
      cacheName: "google-fonts-webfonts",
      plugins: [
         new workbox.cacheableResponse.CacheableResponsePlugin({
            statuses: [0, 200]
         }),
         new workbox.expiration.ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365
         })
      ]
   })
)

//----- API Caching

workbox.routing.registerRoute(
   /^https:\/\/api\.football-data\.org\/v2/,
   new workbox.strategies.StaleWhileRevalidate({
      cacheName: "api",
      plugins: [
         new workbox.cacheableResponse.CacheableResponsePlugin({
            statuses: [0, 200]
         })
      ]
   })
)

//----- Push Notification

self.addEventListener("push", event => {
   let body;

   if(event.data) {
      body = event.data.text();
   } else {
      body = "Tidak ada pesan";
   }

   const options = {
      body: body,
      badge: "images/logo.png",
      icon: "images/logo.png",
      data: {
         dateOfArrival: Date.now(),
         primaryKey: 1
      }
   };

   event.waitUntil(
      self.registration.showNotification("Push Notification", options)
   );
});