// Pass-through service worker. It exists so Android Chrome treats the site as an installable app.
// It intentionally caches nothing: every visit loads the latest version from the server.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => { /* network only — the browser handles the request as normal */ });
