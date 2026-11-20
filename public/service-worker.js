'use strict';

const version = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_NAME = `carmaintenance-shell-${version}`;
const STATIC_ASSETS = [
  '/css/style.css',
  '/js/storage.js',
  '/js/dashboard.js',
  '/vendor/bootstrap/css/bootstrap.min.css',
  '/vendor/bootstrap/js/bootstrap.bundle.min.js',
  '/vendor/chart.js/chart.umd.min.js',
  '/bootstrap-icons/bootstrap-icons.css',
  '/bootstrap-icons/fonts/bootstrap-icons.woff2',
  '/manifest.webmanifest',
  '/image/car-maintenance-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('carmaintenance-shell-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (STATIC_ASSETS.includes(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  if (event.request.mode === 'navigate' && requestUrl.pathname === '/' && !requestUrl.search) {
    event.respondWith(
      fetch(event.request).then(async (response) => {
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('text/html')) {
          const page = await response.clone().text();
          if (page.includes('data-storage-mode="browser"')) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/', response.clone());
          }
        }
        return response;
      }).catch(async () => {
        const cached = await caches.match('/');
        if (cached) return cached;
        return new Response('CarMaintenance non è disponibile offline. Riconnettiti e riprova.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
    );
  }
});
