(function() {
    'use strict';

    var CACHE_NAME = 'my-site-cache-v1';
    var urlsToCache = [
    '/',
    '/index.html',
    '/css/bulma.min.css',
    '/css/styles.css',
    '/js/app.js',
    '/js/idb.js'
    ];

    //Cache resources
    self.addEventListener('install', function(event) {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
    });

    // Respond with cached resources
    self.addEventListener('fetch', function (event) {
      event.respondWith(
        caches.match(event.request).then(function (request) {
          return request || fetch(event.request)
        })
      )
    })

    // Delete outdated caches
    self.addEventListener('activate', function (event) {
      event.waitUntil(
        caches.keys().then(function (keyList) {
          return Promise.all(keyList.map(function (key, i) {
            if (key !== CACHE_NAME) {
              return caches.delete(keyList[i])
            }
          }))
        })
      )
    })

})();