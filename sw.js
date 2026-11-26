/* ============================================================
   NaoGroup — le petit service qui rend le site installable et
   le laisse s'ouvrir sans réseau.
   Toujours le réseau d'abord : on voit donc toujours la dernière
   version publiée. La copie gardée ne sert que hors connexion.
   Seules les pages et fichiers du site sont gardés : jamais les
   échanges avec Supabase (comptes, sauvegardes).
   ============================================================ */
const CACHE = 'naogroup-v4';
const BASE = ['NaoGroup.html', 'histoire.html', 'contact.html', 'naogroup-logos.js', 'naogroup-cloud.js', 'naogroup-protection.js', 'naogroup-secours.js',
  'icones/naogroup-192.png', 'icones/naogroup-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    /* « no-cache » : on revalide toujours auprès du serveur, pour ne jamais servir une vieille version gardée par le navigateur */
    fetch(req, { cache: 'no-cache' }).then(rep => {
      if (rep.ok && rep.type === 'basic') { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(req, copie)); }
      return rep;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(r => r || (req.mode === 'navigate' ? caches.match('NaoGroup.html') : Response.error())))
  );
});
