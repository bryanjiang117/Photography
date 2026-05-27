import { galleryImageUrl, galleryPrefetchUrl } from "./galleryImages";

function prefetchLayout() {
  if (typeof window === "undefined") return "grid";
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "grid";
}

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

/** Props for above-the-fold gallery rows (skip lazy-load delay). */
export function galleryImgLoadProps(rowIndex, imageIndex = 0) {
  const priority = rowIndex < 3 && imageIndex < 2;
  return priority
    ? { loading: "eager", fetchPriority: "high" }
    : { loading: "lazy" };
}
