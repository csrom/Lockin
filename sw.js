// Lock In service worker
// Stránka a skripty: vždy najprv zo siete (aktualizácie sa prejavia hneď), offline z cache.
// Obrázky a videá: z cache, lebo sa nemenia (nové verzie majú nové meno súboru).
const CACHE = "lockin-v2";
const SHELL = ["/", "/style.css", "/app.js", "/config.js", "/manifest.webmanifest", "/media/icon-192.png"];

self.addEventListener("install", e => {
  // každý súbor zvlášť: keby jeden zlyhal, service worker sa aj tak nainštaluje
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // Supabase, fonty, CDN idú priamo
  if (url.pathname.startsWith("/media/") && !url.pathname.endsWith(".mp4")) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.pathname.endsWith(".mp4")) return; // videá streamuje prehliadač sám (Range požiadavky)
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match("/"))));
});
