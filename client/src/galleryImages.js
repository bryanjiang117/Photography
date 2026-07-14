/** @typedef {'sm' | 'md' | 'full'} GalleryImageSize */

export const GALLERY_IMAGE_WIDTHS = {
  sm: 800,
  md: 1400,
  full: 2400,
};

const SIZE_ORDER = /** @type {const} */ (["sm", "md", "full"]);

const SUFFIX = {
  sm: "-sm",
  md: "-md",
  full: "",
};

/**
 * @param {string} region
 * @param {string} name
 * @param {GalleryImageSize} [size]
 */
export function galleryImageUrl(region, name, size = "full") {
  const suffix = SUFFIX[size];
  return `/assets/photos/${region}/${name}${suffix}.avif`;
}

/**
 * @param {string} region
 * @param {string} name
 * @param {GalleryImageSize} maxSize
 */
export function galleryImageSrcSet(region, name, maxSize = "full") {
  const maxIdx = SIZE_ORDER.indexOf(maxSize);
  return SIZE_ORDER.slice(0, maxIdx + 1)
    .map(
      (size) =>
        `${galleryImageUrl(region, name, size)} ${GALLERY_IMAGE_WIDTHS[size]}w`,
    )
    .join(", ");
}

/**
 * URL for GalleryImage `src` (largest allowed tier for the layout).
 * Prefer {@link galleryPrefetchUrls} for warming — the browser often picks a
 * smaller candidate from `srcSet` based on `sizes`.
 * @param {string} region
 * @param {string} name
 * @param {GalleryImageSize} maxSize
 * @param {'grid' | 'full' | 'mobile'} [layout]
 */
export function galleryPrefetchUrl(
  region,
  name,
  maxSize = "md",
  layout = "grid",
) {
  const size = capSizeForLayout(maxSize, layout);
  return galleryImageUrl(region, name, size);
}

/**
 * Every AVIF tier GalleryImage may request via `src` / `srcSet` for this photo.
 * @param {string} region
 * @param {string} name
 * @param {GalleryImageSize} maxSize
 * @param {'grid' | 'full' | 'mobile'} [layout]
 * @returns {string[]}
 */
export function galleryPrefetchUrls(
  region,
  name,
  maxSize = "md",
  layout = "grid",
) {
  const size = capSizeForLayout(maxSize, layout);
  const maxIdx = SIZE_ORDER.indexOf(size);
  return SIZE_ORDER.slice(0, maxIdx + 1).map((tier) =>
    galleryImageUrl(region, name, tier),
  );
}

/**
 * @param {unknown} entry
 * @param {GalleryImageSize} [rowSize]
 * @param {string} [rowLocation]
 * @returns {{ name: string; size: GalleryImageSize; location?: string } | null}
 */
export function parseImageEntry(entry, rowSize, rowLocation) {
  if (typeof entry === "string") {
    if (!entry) return null;
    return {
      name: entry,
      size: rowSize ?? "md",
      ...(rowLocation ? { location: rowLocation } : {}),
    };
  }
  if (entry && typeof entry === "object" && "name" in entry && entry.name) {
    const location = entry.location ?? rowLocation;
    return {
      name: entry.name,
      size: entry.size ?? rowSize ?? "md",
      ...(location ? { location } : {}),
    };
  }
  return null;
}

/** Row default when `size` is omitted: lone full-width → full, 4+ columns → sm, else md. */
export function rowDefaultSize(row) {
  if (row.size) return row.size;
  if (
    row.columns.length === 1 &&
    row.columns[0].length === 1 &&
    parseImageEntry(row.columns[0][0])
  ) {
    return "full";
  }
  if (row.columns.length >= 4) return "sm";
  return "md";
}

/**
 * @param {Array<{ columns: unknown[]; size?: GalleryImageSize; location?: string }>} items
 * @returns {{ name: string; size: GalleryImageSize; location?: string }[]}
 */
export function flattenGalleryItems(items) {
  /** @type {{ name: string; size: GalleryImageSize; location?: string }[]} */
  const out = [];
  for (const row of items) {
    const rowSize = rowDefaultSize(row);
    const rowLocation = row.location;
    for (const col of row.columns) {
      for (const entry of col) {
        if (Array.isArray(entry)) {
          for (const sub of entry) {
            const parsed = parseImageEntry(sub, rowSize, rowLocation);
            if (parsed) out.push(parsed);
          }
        } else {
          const parsed = parseImageEntry(entry, rowSize, rowLocation);
          if (parsed) out.push(parsed);
        }
      }
    }
  }
  return out;
}

/**
 * @param {{ name: string; size: GalleryImageSize }[]} photos
 * @param {'grid' | 'full' | 'mobile'} layout
 */
export function galleryImageSizesAttr(photos, layout = "grid") {
  if (layout === "full") return "100vw";
  if (layout === "mobile") return "80vw";
  const maxIdx = Math.max(
    ...photos.map((p) => SIZE_ORDER.indexOf(p.size)),
    0,
  );
  const maxSize = SIZE_ORDER[maxIdx];
  if (maxSize === "full") return "100vw";
  if (maxSize === "sm") return "(max-width: 768px) 40vw, 22vw";
  return "(max-width: 768px) 80vw, 40vw";
}

/**
 * @param {GalleryImageSize} size
 * @param {'grid' | 'full' | 'mobile'} layout
 */
export function gallerySizesAttrForImage(size, layout = "grid") {
  return galleryImageSizesAttr([{ name: "", size }], layout);
}

/**
 * @param {GalleryImageSize} size
 * @param {'grid' | 'full' | 'mobile'} [layout]
 */
export function capSizeForLayout(size, layout) {
  if (layout !== "mobile") return size;
  const maxIdx = SIZE_ORDER.indexOf("sm");
  const idx = SIZE_ORDER.indexOf(size);
  return SIZE_ORDER[Math.min(idx, maxIdx)];
}
