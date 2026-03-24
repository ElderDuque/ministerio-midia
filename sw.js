const CACHE = 'ministerio-midia-v2';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
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
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Para requests da API (JSONBin, Anthropic), sempre vai pra rede
  if(e.request.url.includes('api.jsonbin') || e.request.url.includes('anthropic')){
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(response){
      // Atualiza o cache com a versão mais recente da rede
      var clone = response.clone();
      caches.open(CACHE).then(function(cache){
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function(){
      // Só usa cache se a rede falhar (modo offline)
      return caches.match(e.request);
    })
  );
});

self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
});
