// Service worker Starcruiser Clicker : cache-first sur les ressources
// statiques pour un chargement quasi instantane en relecture, et un
// fallback hors-ligne. Les mises a jour passent par un bump de version.
const CACHE_NAME = 'starcruiser-clicker-v0089b2d5';
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

// PAS de skipWaiting ici : le nouveau SW doit rester en "waiting" pour que
// la page le detecte (reg.waiting) et propose le rechargement. skipWaiting
// court-circuitait l'etat waiting -> la page ne voyait JAMAIS la mise a
// jour. C'est la page qui declenche l'activation via SKIP_WAITING (voir
// le listener message ci-dessous), puis recharge.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activation demandee par la page (bouton "Recharger") : le SW waiting
// devient actif immediatement, ses caches sont prets, puis la page se
// recharge et recoit la nouvelle version.
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
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
    // Resolution RELATIVE AU SCOPE du SW (GitHub Pages sert sous un
    // sous-chemin /Starcruiser-Clicker/) : origin + './style.css' ne
    // matchait JAMAIS l'URL reelle, le network-first ne s'appliquait pas
    // et les vieux fichiers partaient du cache (Ctrl+Shift+R obligatoire).
    const CORE = ['./', './index.html', './style.css', './script.js', './i18n.js'];
    const scopeUrl = new URL(self.registration.scope);
    const coreUrls = CORE.map(p => {
        const abs = new URL(p, scopeUrl);
        return [abs.href, abs.href + '?'];
    }).flat();
    const isCore = coreUrls.includes(event.request.url);
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
