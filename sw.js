// Service worker Starcruiser Clicker.
//
// Strategie : NETWORK-FIRST sur tout le site. Chaque requete va d'abord au
// reseau ; le cache n'est qu'un fallback hors-ligne. Un simple F5 recupere
// donc TOUJOURS la derniere version deployee, meme apres un depot GitHub
// Pages sous un sous-chemin (/Starcruiser-Clicker/).
//
// Mise a jour du SW lui-meme : pas de skipWaiting a l'install. Le nouveau SW
// reste en etat "waiting" ; la page le detecte, affiche le bouton
// "Recharger", lui envoie SKIP_WAITING au clic, puis recharge la page quand
// il prend le controle (controllerchange).
const CACHE_NAME = 'starcruiser-clicker-v0164e7a0';

self.addEventListener('install', (event) => {
    // Precache minimal (fallback hors-ligne). Les echecs individuels sont
    // ignores : une image manquante ne doit pas bloquer l'installation.
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            Promise.allSettled([
                './',
                './index.html',
                './style.css',
                './script.js',
                './i18n.js',
                './manifest.json'
            ].map(url => cache.add(url)))
        )
    );
});

self.addEventListener('activate', (event) => {
    // Supprime tous les caches obsoletes, prend le controle des clients
    // ouverts, puis annonce sa version (la page compare avec la sienne).
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )).then(() => self.clients.claim()).then(() => self.clients.matchAll()).then(clients => {
            clients.forEach(client => client.postMessage({ type: 'SW_VERSION', version: CACHE_NAME }));
        })
    );
});

// Activation demandee par la page (bouton "Recharger").
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Google Fonts : reseau direct, jamais de stale.
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return;

    // Hors origine : reseau direct.
    if (url.origin !== self.location.origin) return;

    // NETWORK-FIRST + BYPASS DU CACHE HTTP : fetch(request) respectait le
    // cache HTTP de GitHub Pages (max-age 10 min) -- le SW recevait donc
    // les VIEUX fichiers meme en network-first, et les changements de
    // police/taille n'arrivaient jamais sans Ctrl+Shift+R. cache:'no-cache'
    // force la revalidation reseau a CHAQUE requete : toujours frais.
    // Le cache SW ne reste qu'un fallback hors-ligne.
    event.respondWith(
        fetch(request, { cache: 'no-cache' }).then(response => {
            if (response && response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
        }).catch(() =>
            caches.match(request).then(cached => cached || caches.match('./index.html'))
        )
    );
});
