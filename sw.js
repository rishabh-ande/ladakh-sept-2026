const CACHE = 'ladakh-2026-v2';
const CORE = ['./', './index.html', './siachen.html', './tso-moriri.html',
              './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Pages: network-first so edits land, cache as the offline fallback.
// Fonts and icons: cache-first, they never change.
self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isAsset = /fonts\.(googleapis|gstatic)\.com/.test(url.host) || /\.(png|woff2?)$/.test(url.pathname);

  if (isAsset) {
    e.respondWith(caches.match(request).then(hit => hit || fetch(request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
      return res;
    }).catch(() => hit)));
    return;
  }

  e.respondWith(fetch(request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(request).then(hit => hit || caches.match('./index.html'))));
});
