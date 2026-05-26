const warmed = new Set();
const inFlight = new Map();

export function galleryImageUrl(region, name) {
  return `/assets/photos/${region}/${name}.avif`;
}

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

export function warmGalleryRegion(region, names, options) {
  const urls = names
    .filter((n) => typeof n === "string" && n.length > 0)
    .map((n) => galleryImageUrl(region, n));
  return warmGalleryImages(urls, options);
}

/** Props for above-the-fold gallery rows (skip lazy-load delay). */
export function galleryImgLoadProps(rowIndex, imageIndex = 0) {
  const priority = rowIndex < 3 && imageIndex < 2;
  return priority
    ? { loading: "eager", fetchPriority: "high" }
    : { loading: "lazy" };
}
