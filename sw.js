const CACHE_NAME = 'registrarpr-mobile-v1';
const APP_SHELL = ['./','./index.html','./manifest.webmanifest','./assets/school-logo.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL).catch(() => null)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(res => res || caches.match('./index.html'))));
});

/*
  รับ Push Notification จาก RegistrarPR
*/
self.addEventListener('push', event => {
  let payload = {};

  try{
    payload = event.data
      ? event.data.json()
      : {};
  }catch(error){
    payload = {
      body: event.data
        ? event.data.text()
        : ''
    };
  }

  const title =
    payload.title ||
    'RegistrarPR';

  const iconUrl = new URL(
    payload.icon || 'icons/icon-192.png',
    self.registration.scope
  ).href;

  const badgeUrl = new URL(
    payload.badge || 'icons/icon-192.png',
    self.registration.scope
  ).href;

  const targetUrl = new URL(
    payload.url || '?page=pending',
    self.registration.scope
  ).href;

  const options = {
    body:
      payload.body ||
      'มีผลสอบแก้ตัวรออนุมัติรายการใหม่',

    icon: iconUrl,
    badge: badgeUrl,

    tag:
      payload.tag ||
      'registrar-pending-grade',

    renotify: true,

    vibrate: [
      200,
      100,
      200
    ],

    data: {
      url: targetUrl,
      status:
        payload.status ||
        'pending_approval'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});
