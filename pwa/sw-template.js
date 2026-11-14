/* Service worker do AIR Jogos — gerado no build a partir de pwa/sw-template.js.
 * Guarda o app inteiro no celular para funcionar sem internet.
 * - Páginas: tenta a internet primeiro (pega atualizações) e cai no que está salvo se estiver offline.
 * - Arquivos (JS, CSS, fontes, imagens): usa o que está salvo e só baixa o que faltar.
 */
const VERSION = '__VERSION__';
const CACHE = 'airjogos-' + VERSION;
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('airjogos-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegação (abrir /, /impostor, /taboo…): internet primeiro, senão o index salvo.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put('/index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html', { ignoreVary: true }).then((hit) => hit || caches.match('/', { ignoreVary: true })))
    );
    return;
  }

  // Demais arquivos: salvo primeiro, internet se não tiver.
  event.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
    )
  );
});
