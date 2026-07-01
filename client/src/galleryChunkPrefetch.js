/** Gallery overlay JS — separate Vite chunks, warmed after intro (and on panel hover). */

const GALLERY_CHUNKS = {
  china: {
    desktop: () => import("./panels/ChinaGallery"),
    mobile: () => import("./mobile/ChinaGallery"),
  },
  mexico: {
    desktop: () => import("./panels/MexicoCityGallery"),
    mobile: () => import("./mobile/MexicoCityGallery"),
  },
  canada: {
    desktop: () => import("./panels/CanadaGallery"),
    mobile: () => import("./mobile/CanadaGallery"),
  },
  japan: {
    desktop: () => import("./panels/JapanGallery"),
    mobile: () => import("./mobile/JapanGallery"),
  },
};

const resolved = new Map();
const pending = new Map();

function layoutKey(isMobile) {
  return isMobile ? "mobile" : "desktop";
}

function cacheKey(region, isMobile) {
  return `${region}-${layoutKey(isMobile)}`;
}

function prefetchLayout() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

/** Start loading a gallery chunk; returns a promise for the default export. */
export function loadGalleryChunk(region, isMobile) {
  const key = cacheKey(region, isMobile);
  if (resolved.has(key)) return Promise.resolve(resolved.get(key));
  if (pending.has(key)) return pending.get(key);

  const loader = GALLERY_CHUNKS[region]?.[layoutKey(isMobile)];
  if (!loader) return Promise.resolve(null);

  const promise = loader().then((mod) => {
    resolved.set(key, mod.default);
    pending.delete(key);
    return mod.default;
  });
  pending.set(key, promise);
  return promise;
}

/** Warm one region's gallery JS chunk (intent prefetch). */
export function prefetchGalleryChunk(region) {
  loadGalleryChunk(region, prefetchLayout());
}

/** After intro, warm gallery JS chunks when the browser is idle. */
export function scheduleGalleryChunkPrefetch() {
  const run = () => {
    const isMobile = prefetchLayout();
    for (const region of Object.keys(GALLERY_CHUNKS)) {
      loadGalleryChunk(region, isMobile);
      loadGalleryChunk(region, !isMobile);
    }
  };

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(run, { timeout: 8000 });
  } else {
    setTimeout(run, 3000);
  }
}

export function isGalleryChunkReady(region, isMobile) {
  return resolved.has(cacheKey(region, isMobile));
}

export function getResolvedGallery(region, isMobile) {
  return resolved.get(cacheKey(region, isMobile)) ?? null;
}
