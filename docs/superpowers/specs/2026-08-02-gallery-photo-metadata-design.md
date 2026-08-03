# Gallery Photo Metadata

## Goal

Extract EXIF (and related) metadata from local original photos at build time, and show it on gallery hover overlays and in the lightbox.

## Current state

- Gallery AVIFs often lack EXIF (Mexico/Canada stripped; China/Japan mixed).
- Hand-authored `location` labels already exist on grid items and show on hover.
- Lightbox (`GalleryLightbox`) shows the image only — no caption.
- Originals live under `client/public/assets/photos/originals/{china_originals,japan_originals}/` today (to be moved out of `public/` so they are not deployed).
- Japan JPEG exports are mostly date-only; camera settings remain on RAWs. At least one Japan JPEG (`snow-roots`) retains full Nikon EXIF — the extractor must handle that rich case, not only sparse date/Software fields.
- China Fujifilm JPEGs generally have full camera/lens/exposure data.
- No GPS in current China/Japan originals.

## Scope

**In scope**

- Build-time script (`photos:meta`) that reads originals and writes a committed JS module of per-photo metadata.
- Display on grid hover (with existing location) and in lightbox (web + mobile).
- Regions with originals today: `china`, `japan`. Empty/absent regions simply omit meta.
- Move originals outside `public/` and gitignore them so masters are not shipped.

**Out of scope**

- Runtime EXIF parsing in the browser.
- Reverse geocoding / maps.
- Requiring RAW support in v1 (JPEG/HEIC/etc. that `exifr` can read; if a RAW is present and parsable, include it — do not block on Nikon NEF tooling).
- Editing or re-embedding EXIF into AVIFs.
- Mexico/Canada until originals are added.

## Approach

Build-time extract → `client/src/constants/galleryPhotoMeta.js`, same pattern as `photos:ratios` / `photos:variants`. UI imports the module; missing entries render nothing extra.

## Originals layout

```
client/originals/
  china/   # basename matches gallery name, e.g. hotpot.jpeg
  japan/   # e.g. snow-roots.jpeg
```

- Script input root: `client/originals/{region}/`.
- Supported extensions: `.jpeg`, `.jpg`, `.tif`, `.tiff`, `.heic`, `.png`, and any others `exifr` can parse when present.
- Basename (minus extension) must match gallery photo `name`.
- Add `client/originals/` to `.gitignore`.
- Move existing `public/assets/photos/originals/*_originals` → `client/originals/{china,japan}`.

## Extracted fields

Normalized object per photo (omit null/undefined keys):

| Field | Source | Notes |
|-------|--------|--------|
| `takenAt` | `DateTimeOriginal` (+ offset if present) | ISO-8601 string |
| `camera` | `Make` + `Model`, else parse `Software` | e.g. `FUJIFILM X-S20`, `NIKON D3400` |
| `lens` | `LensModel` | |
| `focalLengthMm` | `FocalLength` | number |
| `focalLength35mm` | `FocalLengthIn35mmFormat` | number |
| `aperture` | `FNumber` | number (display as `ƒ/5`) |
| `shutter` | `ExposureTime` | display string e.g. `1/320` or `0.4s` |
| `iso` | `ISO` / `PhotographicSensitivity` | number |
| `exposureComp` | `ExposureCompensation` | number (EV) |
| `width` / `height` | EXIF or image dimensions | |

Output shape:

```js
export const GALLERY_PHOTO_META = {
  china: { hotpot: { takenAt, camera, lens, … }, … },
  japan: { "snow-roots": { … }, … },
};
export function galleryPhotoMeta(region, name) { … }
```

Formatting helpers (shared UI util or colocated): date for display, exposure line (`ƒ/5 · 1/320 · ISO 2500`), camera/lens line. Only include segments that exist.

## UI

### Hover (`GalleryImage`)

- Keep centered location label when present.
- When meta exists, show a second quieter line under location (or alone if no location): date · camera · short exposure summary.
- Overlay appears if `location` **or** meta exists (`group-hover` unchanged).
- Do not invent cards/chrome; match existing dim overlay + Bodoni-small feel.

### Lightbox (`GalleryLightbox`)

- Caption below (or over bottom of) the image: location (from `photos` entry if present), then date, camera/lens, exposure line.
- Same quiet white/low-contrast treatment as arrows; omit empty fields.
- Web and mobile share this component.

## Data flow

```
client/originals/{region}/*.jpeg
  → npm run photos:meta
  → galleryPhotoMeta.js
  → GalleryImage (hover) / GalleryLightbox (caption)
```

## Gaps

| Photo | Region | Notes |
|-------|--------|-------|
| `zhangjiajie` | china | No original in folder |
| `colorful-shrine`, `path` | japan | No original in folder |
| Most japan JPEGs | japan | Date (+ sometimes Software) only until richer exports/RAWs added |
| mexico, canada | — | No originals yet |

## Testing (manual)

- Run `photos:meta`; confirm `snow-roots` has aperture/shutter/ISO/camera; confirm a China photo (e.g. `hotpot`) has lens + exposure.
- Hover a China grid image with location + meta → both lines.
- Hover a Japan image with date-only meta → date (and camera if inferred).
- Open lightbox on both → caption updates when navigating prev/next.
- Photo with neither location nor meta → no empty overlay/caption chrome.
- Confirm `originals/` is not under `public/` and is gitignored.
