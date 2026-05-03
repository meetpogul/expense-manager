/// <reference lib="webworker" />

const CACHE_VERSION = "v2";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";
const APP_SCOPE = "/";

const STATIC_ASSETS = [
  APP_SCOPE,
  OFFLINE_URL,
  "/manifest.json",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-384.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll(
          STATIC_ASSETS.map(
            (url) =>
              new Request(url, { cache: "reload", credentials: "same-origin" }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      deleteOldCaches(),
      enableNavigationPreload(),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || request.headers.has("range")) {
    return;
  }

  const url = new URL(request.url);

  if (
    url.origin !== self.location.origin ||
    (url.protocol !== "http:" && url.protocol !== "https:")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(event));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const title = payload.title ?? "Notification";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body,
      data: payload.data,
      icon: payload.icon ?? "/icons/icon-192.png",
      badge: payload.badge ?? "/icons/icon-192.png",
      tag: payload.tag,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url ?? APP_SCOPE,
    self.location.origin,
  ).href;

  event.waitUntil(focusOrOpenClient(targetUrl));
});

function isStaticAsset(request) {
  const destination = request.destination;

  return ["font", "image", "script", "style"].includes(destination);
}

function isCacheable(response) {
  return response && response.ok && ["basic", "cors"].includes(response.type);
}

async function deleteOldCaches() {
  const keys = await caches.keys();

  await Promise.all(
    keys
      .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
      .map((key) => caches.delete(key)),
  );
}

async function enableNavigationPreload() {
  if ("navigationPreload" in self.registration) {
    await self.registration.navigationPreload.enable();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (isCacheable(response)) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }

  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (isCacheable(response)) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

async function networkFirstWithOfflineFallback(event) {
  const { request } = event;
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = (await event.preloadResponse) || (await fetch(request));

    if (isCacheable(response)) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await caches.match(request)) ||
      (await caches.match(OFFLINE_URL))
    );
  }
}

function parsePushPayload(event) {
  try {
    return event.data?.json() ?? {};
  } catch {
    return {
      body: event.data?.text(),
    };
  }
}

async function focusOrOpenClient(url) {
  const allClients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  const sameOriginUrl = new URL(url);

  for (const client of allClients) {
    const clientUrl = new URL(client.url);

    if (clientUrl.origin === sameOriginUrl.origin && "focus" in client) {
      return client.focus();
    }
  }

  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
}
