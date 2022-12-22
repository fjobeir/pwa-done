importScripts('assets/js/idb-umd.js');
importScripts('assets/js/db.js');

self.addEventListener('install', function (e) {
    console.log('service worker has been installed')
    e.waitUntil(
        caches.open('mycache')
            .then(cache => {
                cache.addAll([
                    'index.html',
                    'login.html',
                    'profile.html',
                    'assets/css/common.css',
                    'assets/css/login.css',
                    'assets/css/index.css',
                    'assets/js/common.js',
                    'assets/js/index.js',
                    'assets/images/logo.svg',
                    'https://www.ferasjobeir.com/api/posts?page=1',
                    'https://www.ferasjobeir.com/api/posts?page=2',
                ])
            })
    )
})

function trimCache(cacheName, maxRows) {
    caches.open(cacheName)
        .then(function (cache) {
            return cache.keys().then((keys) => {
                if (keys.length > maxRows) {
                    cache.delete(keys[0])
                        .then(() => {
                            trimCache(cacheName, maxRows)
                        })
                }
            })
        })
}

self.addEventListener('activate', function (event) {
    // event.waitUntil(
    //     caches.keys()
    //         .then(function (keyList) {
    //             return Promise.all(keyList.map(function (key) {
    //                 if (key !== '') {
    //                     console.log('[Service Worker] Removing old cache.', key);
    //                     return caches.delete(key);
    //                 }
    //             }));
    //         })
    // );
    return self.clients.claim()
})

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request.clone())
            .then(function (response) {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then(res => {
                            return caches.open('mycache')
                                .then(function (cache) {
                                    cache.put(event.request, res.clone());
                                    return res;
                                })
                        })
                        .catch(function (err) {
                            return caches.open('mycache')
                                .then(function (cache) {
                                    return cache.match('/offline.html');
                                });
                        });
                }
            })
    );
})

self.addEventListener('sync', function(event) {
    console.log('[Service Worker] Background syncing', event);
    if (event.tag === 'sync-new-posts') {
        event.waitUntil(
            readStoreData('posts-to-send')
                .then(function(posts) {
                    for (var i = 0; i < posts.length; i++) {
                        var post = posts[i]
                        deleteItemFromStore('posts-to-send', post.id)
                        fetch('https://www.ferasjobeir.com/api/posts', {
                            method: 'POST',
                            body: JSON.stringify({
                                content: post.content
                            }),
                            headers: {
                                'Authorization': 'Bearer ' + post.token,
                                'Content-Type': 'application/json'
                            }
                        })
                    }
                })
        )
    }
})