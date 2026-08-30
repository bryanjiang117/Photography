import { galleryFullUrl, galleryImageUrl } from "./galleryImages";

let version = 0;
/** @type {Record<string, string>} */
const urls = {};
const listeners = new Set();

function keyOf(region, name) {
  return `${region}/${name}`;
}

function emit() {
  version += 1;
  for (const listener of listeners) listener();
}

export function subscribeGalleryPreview(onStoreChange) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getGalleryPreviewVersion() {
  return version;
}

export function setGalleryPreviewUrl(region, name, url) {
  const key = keyOf(region, name);
  urls[key] = url;
  emit();
}

export function clearGalleryPreviewUrl(region, name) {
  const key = keyOf(region, name);
  const prev = urls[key];
  if (!prev) return;
  delete urls[key];
  emit();
  if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
}

/** Once the master AVIF exists, use it instead of the import blob/jpeg. */
export function promotePreviewToFull(region, name) {
  const full = galleryFullUrl(region, name);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0) setGalleryPreviewUrl(region, name, full);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = full;
  });
}

export function galleryDisplayUrl(region, name, size) {
  return urls[keyOf(region, name)] ?? galleryImageUrl(region, name, size);
}

export function galleryDevPreviewUrl(region, name) {
  return `/__gallery-dev/preview?region=${encodeURIComponent(region)}&name=${encodeURIComponent(name)}`;
}

export function browserCanDisplayFile(file) {
  if (/^image\/(jpeg|png|webp)$/i.test(file.type)) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}
