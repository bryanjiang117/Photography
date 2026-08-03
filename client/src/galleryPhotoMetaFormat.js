/**
 * Format helpers for gallery photo EXIF metadata.
 * @typedef {{
 *   takenAt?: string;
 *   camera?: string;
 *   lens?: string;
 *   focalLengthMm?: number;
 *   focalLength35mm?: number;
 *   aperture?: number;
 *   shutter?: string;
 *   iso?: number;
 *   exposureComp?: number;
 *   width?: number;
 *   height?: number;
 * }} GalleryPhotoMeta
 */

/** @param {string | undefined} takenAt */
export function formatPhotoDate(takenAt) {
  if (!takenAt) return null;
  const d = new Date(takenAt);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** @param {GalleryPhotoMeta | null | undefined} meta */
export function formatCameraLine(meta) {
  if (!meta) return null;
  const parts = [meta.camera, meta.lens].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** @param {GalleryPhotoMeta | null | undefined} meta */
export function formatExposureLine(meta) {
  if (!meta) return null;
  /** @type {string[]} */
  const parts = [];
  if (meta.aperture != null) {
    const a =
      Number.isInteger(meta.aperture) || meta.aperture >= 10
        ? String(meta.aperture)
        : meta.aperture.toFixed(1).replace(/\.0$/, "");
    parts.push(`ƒ/${a}`);
  }
  if (meta.shutter) parts.push(meta.shutter);
  if (meta.iso != null) parts.push(`ISO ${meta.iso}`);
  if (meta.focalLengthMm != null) {
    const fl =
      Number.isInteger(meta.focalLengthMm) || meta.focalLengthMm >= 100
        ? String(Math.round(meta.focalLengthMm))
        : meta.focalLengthMm.toFixed(1).replace(/\.0$/, "");
    parts.push(`${fl}mm`);
  }
  return parts.length ? parts.join(" · ") : null;
}

/** Hover one-liner: date · camera · exposure (skip empties). */
/** @param {GalleryPhotoMeta | null | undefined} meta */
export function formatHoverMetaLine(meta) {
  if (!meta) return null;
  const parts = [
    formatPhotoDate(meta.takenAt),
    meta.camera ?? null,
    formatExposureLine(meta),
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
