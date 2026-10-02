const cacheAvalaible = 'caches' in self;s
const addResourcesToCache = async (resources) => {
   if (!cacheAvalaible) return;
  const cache = await caches.open("resources-cache");
  await cache.addAll(resources);
};

const enableNavigationPreload = async () => {
  if (!cacheAvalaible) return;
  await self.registration.navigationPreload.enable();
};

const putInCache = async (request, response) => {
  if (!cacheAvalaible) return;
  const cache = await caches.open("resources-cache");
  await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallback }) => {
  const responseInCache = await caches.match(request);
  if (responseInCache) return responseInCache;

  const preloadResponse = await preloadResponsePromise;

  if (preloadResponse) {
    console.info('using preload response', preloadResponse);
    await putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  try {
    const responseFromNetwork = await fetch(request);
    await putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (e) {
    const fallbackResponse = await caches.match(fallback);
    if (fallbackResponse) return fallbackResponse;

    return new Response('Network error occurred', { status: 408 });
  }

};



self.addEventListener('activate', (event) => {
  event.waitUntil(enableNavigationPreload());
})

self.addEventListener('install', (event) => {
  event.waitUntil(addResourcesToCache([
    './',
    './index.html',
    './gallery/bountyHunters.jpg',
    './gallery/myLittleVader.jpg',
    './gallery/snowTroopers.jpg',
  ]));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirst({
    request: event.request,
    preloadResponsePromise: event.preloadResponse,
    fallback: './gallery/myLittleVader.jpg',
  }));
});
