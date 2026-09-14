self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝成功');
});

self.addEventListener('fetch', (event) => {
  // 這裡先簡單放行所有網路請求
  event.respondWith(fetch(event.request));
});
