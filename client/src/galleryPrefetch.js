import { galleryImageUrl, galleryPrefetchUrl } from "./galleryImages";

function prefetchLayout() {
  if (typeof window === "undefined") return "grid";
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "grid";
}

const warmed = new Set();
const inFlight = new Map();

/** First N photos warmed on panel hover (intent, not full gallery). */
export const GALLERY_WARM_HEAD_COUNT = 12;
/** Per-region photos warmed on idle after intro. */
export const GALLERY_IDLE_PER_REGION = 6;

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

/** Hover / intent prefetch — first photos only. */
export function warmGalleryRegionHead(region, photos, options = {}) {
  const count = options.count ?? GALLERY_WARM_HEAD_COUNT;
  return warmGalleryRegion(region, photos.slice(0, count), {
    concurrency: 6,
    ...options,
  });
}

/** After intro, warm a few photos per region when the browser is idle. */
export function scheduleIdleGalleryWarm() {
  const run = async () => {
    const layout = prefetchLayout();
    const {
      MEXICO_GALLERY_PHOTOS,
      CANADA_GALLERY_PHOTOS,
      CHINA_GALLERY_PHOTOS,
      JAPAN_GALLERY_PHOTOS,
    } = await import("./constants/data.js");

    const regions = [
      ["mexico", MEXICO_GALLERY_PHOTOS],
      ["canada", CANADA_GALLERY_PHOTOS],
      ["china", CHINA_GALLERY_PHOTOS],
      ["japan", JAPAN_GALLERY_PHOTOS],
    ];

    for (const [region, photos] of regions) {
      if (!photos.length) continue;
      await warmGalleryRegion(region, photos.slice(0, GALLERY_IDLE_PER_REGION), {
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
