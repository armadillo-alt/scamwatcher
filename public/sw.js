/*
 * ScamGuard service worker — deliberately minimal.
 * Its presence makes the app installable on Android; it does NOT cache anything.
 * Freshness beats offline for a scam-review tool: stale data or a stale engine
 * could mislead a caregiver. Revisit only alongside a considered caching policy
 * (see HANDOFF.md roadmap).
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
// Present but non-intercepting: no respondWith, so the network path is untouched.
self.addEventListener("fetch", () => {});
