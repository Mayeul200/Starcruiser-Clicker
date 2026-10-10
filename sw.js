// Service worker Starcruiser Clicker : cache-first sur les ressources
// statiques pour un chargement quasi instantane en relecture, et un
// fallback hors-ligne. Les mises a jour passent par un bump de version.
const CACHE_NAME = 'starcruiser-clicker-v0074e5a2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './i18n.js',
    './manifest.json',
    './images/icon.webp',
    './images/logo2.webp',
    './images/parts.webp',
    './images/backgrounds/valley-day.webp',
    './images/backgrounds/valley-night.webp'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )).then(() => self.clients.claim()).then(() => self.clients.matchAll()).then(clients => {
            // Annonce la version active : la page compare avec sa version
            // embarquee et propose le rechargement si elle est derriere.
            clients.forEach(client => client.postMessage({ type: 'SW_VERSION', version: CACHE_NAME }));
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    // Les Google Fonts passent en reseau direct (pas de risque de stale).
    if (event.request.url.includes('fonts.googleapis') || event.request.url.includes('fonts.gstatic')) return;
    // Fichiers coeur (HTML/JS/CSS) : NETWORK-FIRST. Un simple F5 recupere
    // toujours la derniere version deployee -- fin des pages hybrides
    // (nouveau HTML + ancien CSS) qui cassaient le layout des batiments.
    // Le cache ne sert que si le reseau echoue (mode hors-ligne).
    const CORE = ['./', './index.html', './style.css', './script.js', './i18n.js'];
    const isCore = CORE.some(path => event.request.url === self.location.origin + path
        || event.request.url === self.location.origin + path + '?');
    if (isCore) {
        event.respondWith(
            fetch(event.request).then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
        );
        return;
    }
    // Le reste (images, manifest) : cache-first, relecture instantanee.
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok && event.request.url.startsWith(self.location.origin)) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            }).catch(() => caches.match('./index.html'));
        })
    );
});
