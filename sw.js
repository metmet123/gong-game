/* Consolidated release: exact-route cache keeps each desk independent. */
const CACHE='gongmuwon-36c28faa14a4';
const FILES=["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./resident-center/index.html", "./leaflet-a/index.html", "./leaflet-a/style.css", "./leaflet-a/stage.css", "./leaflet-a/model.js", "./leaflet-a/app.js"];
const allowed=new Set(FILES.map(p=>new URL(p,self.location.href).href));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('gongmuwon-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);u.search='';u.hash='';
 // Legacy resident-test and unrelated routes always retain their own response.
 if(!allowed.has(u.href))return;
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(u.href,cp)));}return res;}).catch(()=>caches.match(u.href)));return;
 }
 e.respondWith(caches.match(u.href).then(v=>v||fetch(r)));
});
