/**
 * OVERCRITIC Service Worker - PWA Engine v26.10.4
 * Fornece carregamento instantâneo, funcionamento offline e cache resiliente.
 */

const CACHE_NAME = 'overcritic-pwa-v26.10.5';

const APP_SHELL = [
  './',
  './index.html',
  './adicionar_jogos.html',
  './descobrir_jogos.html',
  './adicionar_midias.html',
  './descobrir_titulos.html',
  './adicionar_platinas.html',
  './suporte_overcritic.html',
  './conta_login.html',
  './manifest.json',
  './css/responsive-global.css',
  './js/version.js',
  './js/notifications.js',
  './js/gamerProfile.js',
  './js/avatarManager.js',
  './js/geekNewsManager.js',
  './js/pwaManager.js',
  './assets/favicon.ico',
  './assets/favicon.png',
  './assets/overcritic_icon.png'
];

// 1. Instalação: Pré-carrega o App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usa addAll com catch para que falhas de recursos secundários não impeçam a instalação
      return Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[PWA SW] Não foi possível pré-armazenar: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. Ativação: Limpeza de caches obsoletos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[PWA SW] Removendo cache antigo: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceptação de Requisições (Fetch)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignora requisições não-GET ou extensões do navegador
  if (req.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Requisições para APIs de terceiros ou Supabase: Network First com Timeout
  const isApiRequest = url.hostname.includes('supabase.co') ||
                       url.hostname.includes('rawg.io') ||
                       url.hostname.includes('themoviedb.org') ||
                       url.hostname.includes('newsdata.io');

  if (isApiRequest) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          // Clona e salva em cache apenas se a resposta for válida
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Navegação HTML: Cache First com Revalidação Silenciosa em Background (Zero-Latency App Launch)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
            return networkRes;
          })
          .catch(() => {
            return caches.match('./index.html');
          });

        // Se já está no cache local do celular, ENTREGA IMEDIATAMENTE (< 50ms)!
        // Elimina o travamento de 12 segundos na splash screen ao abrir o aplicativo.
        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // Assets Estáticos (CSS, JS, Fontes, Imagens): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return networkRes;
      }).catch(() => {/* Offline e sem cache */});

      return cachedRes || fetchPromise;
    })
  );
});
