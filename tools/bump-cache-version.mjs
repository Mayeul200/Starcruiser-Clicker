// Génère la version du cache à partir du contenu réel des fichiers servis.
// Usage : node tools/bump-cache-version.mjs
// - Hash (SHA-1, 8 premiers hex) des fichiers listés dans sw.js (ASSETS)
//   + les fichiers de code (index.html, style.css, script.js, i18n.js, manifest.json).
// - Réécrit CACHE_NAME dans sw.js et APP_CACHE_VERSION dans index.html.
// Avant tout commit de contenu : relancer ce script, committer le résultat.
// Un changement de contenu change la version => nouveau cache => les joueurs
// récupèrent la mise à jour sans intervention manuelle.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p));
const swPath = join(root, 'sw.js');
const htmlPath = join(root, 'index.html');

const sw = readFileSync(swPath, 'utf8');
const assetMatch = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
if (!assetMatch) throw new Error('ASSETS introuvable dans sw.js');
const assets = [...assetMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((a) => a !== './');
const codeFiles = ['index.html', 'style.css', 'script.js', 'i18n.js', 'manifest.json'];

const hash = createHash('sha1');
for (const a of assets) {
  if (a === './index.html') continue;
  hash.update(read(a));
}
for (const f of codeFiles) {
  if (f === 'index.html') {
    const htmlSrc = readFileSync(htmlPath, 'utf8').replace(/var APP_CACHE_VERSION = 'v[0-9a-f]*';/, "var APP_CACHE_VERSION = '';");
    hash.update(htmlSrc);
  } else {
    hash.update(read(f));
  }
}
const version = hash.digest('hex').slice(0, 8);

const newSw = sw.replace(
  /const CACHE_NAME = 'starcruiser-clicker-v[0-9a-f]*';/,
  `const CACHE_NAME = 'starcruiser-clicker-v${version}';`
);
if (newSw === sw && !sw.includes(`starcruiser-clicker-v${version}`)) {
  throw new Error('CACHE_NAME non réécrit dans sw.js');
}
writeFileSync(swPath, newSw);

const html = readFileSync(htmlPath, 'utf8');
const newHtml = html.replace(
  /var APP_CACHE_VERSION = 'v[0-9a-f]*';/,
  `var APP_CACHE_VERSION = 'v${version}';`
);
if (newHtml === html && !html.includes(`APP_CACHE_VERSION = 'v${version}'`)) {
  throw new Error('APP_CACHE_VERSION non réécrit dans index.html');
}
writeFileSync(htmlPath, newHtml);

console.log(`CACHE_NAME et APP_CACHE_VERSION mis à jour : v${version} (${assets.length} assets)`);
