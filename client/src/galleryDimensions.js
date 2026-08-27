import { galleryPhotoDimensions } from "./constants/galleryAspectRatios";

/** In-memory sizes for photos imported in this session (before data.js save/HMR). */
const overrides = {};

export function setGalleryDimensionOverride(region, name, dim) {
  if (!region || !name || !dim?.w || !dim?.h) return;
  if (!overrides[region]) overrides[region] = {};
  overrides[region][name] = { w: dim.w, h: dim.h };
}

export function photoDimensions(region, name) {
  return overrides[region]?.[name] ?? galleryPhotoDimensions(region, name);
}
