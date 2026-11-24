/* Versioned offline navigation/static fallback. Current news and WDI snapshots prefer network. */
const CACHE='diplomatic-atlas-static-v1.11';
const CORE=['./','./index.html','./src/app.js','./src/live.js','./src/globe.js','./src/signals.js','./src/command.js','./src/styles.css','./data/countries.js','./data/capitals.js','./data/strings.js','./data/additions.js','./data/release.js','./data/votes.js','./data/events.js','./data/liveEvents.js','./data/world.js','./data/earthTexture.js','./data/newsArchive.js','./data/storyPhotos.js','./data/newsTranslations.js','./assets/images/mark.svg','./assets/icons/icon-192.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('diplomatic-atlas-static-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const dynamic=/\/data\/(?:liveNews|liveEvents|indicators)\.(?:js|json)$/.test(url.pathname);
  if(dynamic||event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request).then(response=>response||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
  }else{
    event.respondWith(caches.match(event.request).then(response=>response||fetch(event.request).then(network=>{
      if(network.ok){const clone=network.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone));}
      return network;
    })));
  }
});
