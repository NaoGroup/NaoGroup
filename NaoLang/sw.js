/* NaoLang — mise en cache minimale, pour l'installation et un dépannage hors ligne.
   Toujours le réseau d'abord : jamais de version figée sur un vieux cache. */
const CACHE = 'naolang-v1';
const PRECACHE = [
  './NaoLang.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  '../naogroup-mobile.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie)).catch(() => {});
        return reponse;
      })
      .catch(() => caches.match(e.request))
  );
});
