import { galleryImageUrl, galleryPrefetchUrl } from "./galleryImages";
import { loadGalleryChunk } from "./galleryChunkPrefetch";

function prefetchLayout() {
  if (typeof window === "undefined") return "grid";
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "grid";
}

/** Order galleries are prefetched in (matches home panel order — China first). */
const PREFETCH_ORDER = ["china", "japan", "mexico", "canada"];
/** Export name in constants/data.js for each region's flattened photo list. */
const REGION_PHOTOS_EXPORT = {
  china: "CHINA_GALLERY_PHOTOS",
  japan: "JAPAN_GALLERY_PHOTOS",
  mexico: "MEXICO_GALLERY_PHOTOS",
  canada: "CANADA_GALLERY_PHOTOS",
};
/** Photos prefetched in the fast first pass, per gallery. */
const PREFETCH_HEAD_COUNT = 10;

const warmed = new Set();
const inFlight = new Map();

export { galleryImageUrl };

export function warmGalleryImage(url) {
  if (!url || warmed.has(url)) return Promise.resolve();
  const pending = inFlight.get(url);
  if (pending) return pending;

  const promise = new Promise((resolve) => {
    const img = new Image();
    const done = () => {
      warmed.add(url);
      inFlight.delete(url);
      resolve();
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });
  inFlight.set(url, promise);
  return promise;
}

/** Load URLs with a small concurrency pool (fills HTTP cache for <img src>). */
export async function warmGalleryImages(urls, { concurrency = 8 } = {}) {
  const queue = urls.filter((u) => u && !warmed.has(u));
  if (queue.length === 0) return;

  let index = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (index < queue.length) {
        const url = queue[index++];
        await warmGalleryImage(url);
      }
    },
  );
  await Promise.all(workers);
}

export function warmGalleryRegion(region, photos, options = {}) {
  const layout = options.layout ?? prefetchLayout();
  const urls = photos
    .map((photo) => {
      if (typeof photo === "string" && photo.length > 0) {
        return galleryPrefetchUrl(region, photo, "md", layout);
      }
      if (photo?.name) {
        return galleryPrefetchUrl(
          region,
          photo.name,
          photo.size ?? "md",
          layout,
        );
      }
      return null;
    })
    .filter(Boolean);
  return warmGalleryImages(urls, options);
}

/**
 * Passive prefetch after intro (no hover needed):
 *   Phase 1 — first N images + JS chunk for every gallery, in PREFETCH_ORDER.
 *   Phase 2 — the remaining images for every gallery, in PREFETCH_ORDER.
 */
export function scheduleGalleryPrefetch() {
  const run = async () => {
    const layout = prefetchLayout();
    const isMobile = layout === "mobile";
    const data = await import("./constants/data.js");

    const regions = PREFETCH_ORDER.map((region) => [
      region,
      data[REGION_PHOTOS_EXPORT[region]] ?? [],
    ]);

    // Phase 1: heads + chunks, one gallery at a time.
    for (const [region, photos] of regions) {
      await Promise.all([
        loadGalleryChunk(region, isMobile),
        warmGalleryRegion(region, photos.slice(0, PREFETCH_HEAD_COUNT), {
          concurrency: 6,
          layout,
        }),
      ]);
    }

    // Phase 2: the rest of each gallery's images.
    for (const [region, photos] of regions) {
      if (photos.length <= PREFETCH_HEAD_COUNT) continue;
      await warmGalleryRegion(region, photos.slice(PREFETCH_HEAD_COUNT), {
        concurrency: 4,
        layout,
      });
    }
  };

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => run(), { timeout: 5000 });
  } else {
    setTimeout(run, 2500);
  }
}

/** Props for gallery images: eager above the fold, lazy + low priority below. */
export function galleryImgLoadProps(rowIndex, imageIndex = 0) {
  const priority = rowIndex < 4 && imageIndex < 2;
  return priority
    ? { loading: "eager", fetchPriority: "high" }
    : { loading: "lazy", fetchPriority: "low" };
}
