// Deixa o app abrir sem internet. A página vem sempre da internet quando possível (assim as atualizações chegam),
// e do que ficou guardado quando não há conexão. Os dados (Supabase) nunca passam por aqui.
const CACHE = 'financas-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
const guardar = (req, res) => { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res; };
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.hostname.endsWith('supabase.co')) return;
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(r).then(res => guardar(r, res)).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  // biblioteca de sincronização (vem de um site de bibliotecas): usa a guardada, senão baixa
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => guardar(r, res))));
});
