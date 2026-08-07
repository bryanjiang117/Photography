/** Gallery URL ↔ region mapping. Paths are the source of truth for open state. */

export const GALLERY_PATHS = {
  japan: "/japan",
  mexico: "/mexico_city",
  canada: "/canada",
  china: "/china",
};

const PATH_TO_REGION = Object.fromEntries(
  Object.entries(GALLERY_PATHS).map(([region, path]) => [path, region]),
);

export function galleryRegionFromPath(pathname) {
  return PATH_TO_REGION[pathname] ?? null;
}

export function isGalleryPath(pathname) {
  return pathname in PATH_TO_REGION;
}
