const CACHE = 'ministerio-midia-v1';
const ASSETS = [
  '/ministerio-midia/',
  '/ministerio-midia/index.html',
  '/ministerio-midia/manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Para requests da API (JSONBin), sempre vai pra rede
  if(e.request.url.includes('api.jsonbin') || e.request.url.includes('anthropic')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request);
    })
  );
});
