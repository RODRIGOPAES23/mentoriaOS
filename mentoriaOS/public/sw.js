// Service worker mínimo — limpa caches do Workbox anterior e não intercepta nada.
// O app continua instalável (PWA) mas sempre busca do servidor (sem cache de HTML).
self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Sem fetch handler — todas as requisições vão direto para a rede.
