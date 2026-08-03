# Gallery Photo Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract EXIF from local originals at build time and show it on gallery hover and in the lightbox.

**Architecture:** A Node script (`photos:meta`) reads `client/originals/{region}/*` via `exifr`, writes `client/src/constants/galleryPhotoMeta.js`. `GalleryImage` and `GalleryLightbox` import helpers to format and display fields. Originals move out of `public/` and are gitignored.

**Tech Stack:** Node ESM scripts, `exifr`, React, existing Motion lightbox/hover patterns.

## Global Constraints

- Originals path: `client/originals/{china,japan}/` (not under `public/`).
- Output module: `client/src/constants/galleryPhotoMeta.js` (committed, auto-generated).
- UI must omit empty fields; no overlay/caption chrome when neither location nor meta exists.
- Japan rich case (`snow-roots`) must retain aperture/shutter/ISO/camera; sparse Japan files may be date-only.
- Do not commit `client/originals/` binaries.
- Do not create git commits unless the user asks.

---

### Task 1: Move originals + gitignore

**Files:**
- Move: `client/public/assets/photos/originals/china_originals/` → `client/originals/china/`
- Move: `client/public/assets/photos/originals/japan_originals/` → `client/originals/japan/`
- Modify: `.gitignore` (add `client/originals/`)
- Delete: empty `client/public/assets/photos/originals/` tree

- [ ] **Step 1: Move directories**

```bash
mkdir -p client/originals
mv client/public/assets/photos/originals/china_originals client/originals/china
mv client/public/assets/photos/originals/japan_originals client/originals/japan
rm -rf client/public/assets/photos/originals
```

- [ ] **Step 2: Gitignore**

Append to `.gitignore`:

```
# Local gallery masters (EXIF source for photos:meta — do not deploy)
client/originals/
```

- [ ] **Step 3: Verify**

```bash
ls client/originals/china/hotpot.jpeg client/originals/japan/snow-roots.jpeg
test ! -e client/public/assets/photos/originals
```

---

### Task 2: Extract script + npm script + dependency

**Files:**
- Create: `client/scripts/generate-gallery-photo-meta.mjs`
- Modify: `client/package.json` (add `exifr` dependency, `photos:meta` script)
- Create: `client/src/constants/galleryPhotoMeta.js` (generated)

**Interfaces:**
- Produces: `GALLERY_PHOTO_META`, `galleryPhotoMeta(region, name)`, plus format helpers used by UI:
  - `formatPhotoDate(takenAt) → string | null`
  - `formatExposureLine(meta) → string | null` (`ƒ/5 · 1/320 · ISO 2500`)
  - `formatCameraLine(meta) → string | null` (camera · lens)

- [ ] **Step 1: Install exifr**

```bash
cd client && npm install -D exifr
```

- [ ] **Step 2: Write `generate-gallery-photo-meta.mjs`**

Script requirements:
- `ORIGINALS_ROOT = client/originals`
- `OUT = client/src/constants/galleryPhotoMeta.js`
- Regions: `mexico`, `canada`, `china`, `japan` (skip missing dirs)
- For each file matching image extensions, basename → photo name
- Parse with exifr (`gps: false` unless present); map fields per spec
- Format `shutter` string from `ExposureTime` (`1/N` when &lt; 1s)
- Infer `camera` from Make+Model, else Software (`NIKON D3400 Ver…` → `NIKON D3400`)
- Write module with `GALLERY_PHOTO_META`, `galleryPhotoMeta`, and the three format helpers (helpers are hand-stable code in the same file after the generated data, or a separate small `galleryPhotoMetaFormat.js` — prefer colocating formatters in `galleryPhotoMeta.js` below the generated const so UI has one import)

Actually: keep **generated data only** in the auto-generated section; put formatters in `client/src/galleryPhotoMetaFormat.js` so regenerating does not risk clobbering helpers.

- [ ] **Step 3: Add npm script**

```json
"photos:meta": "node scripts/generate-gallery-photo-meta.mjs"
```

- [ ] **Step 4: Run and verify snow-roots + hotpot**

```bash
cd client && npm run photos:meta
node -e "import { galleryPhotoMeta } from './src/constants/galleryPhotoMeta.js'; console.log(galleryPhotoMeta('japan','snow-roots')); console.log(galleryPhotoMeta('china','hotpot'));"
```

Expected: `snow-roots` has `camera`, `aperture`, `shutter`, `iso`, `takenAt`; `hotpot` has those plus `lens`.

---

### Task 3: Hover overlay in GalleryImage

**Files:**
- Modify: `client/src/components/GalleryImage.jsx`
- Create: `client/src/galleryPhotoMetaFormat.js` (if not created in Task 2)

**Interfaces:**
- Consumes: `galleryPhotoMeta(region, name)`, format helpers
- Uses existing `location` from parsed entry

- [ ] **Step 1: Update overlay**

Show overlay when `location || meta`. Structure:

```jsx
<span className="… overlay …">
  <span className="flex flex-col items-center gap-1 text-center …">
    {location && <span className="text-sm … bodoni-small …">{location}</span>}
    {metaLine && <span className="text-xs text-white/75 …">{metaLine}</span>}
  </span>
</span>
```

`metaLine` = join non-null of `formatPhotoDate`, camera short name, `formatExposureLine` with ` · `.

- [ ] **Step 2: Manual check** — hover China (full meta) and Japan date-only.

---

### Task 4: Lightbox caption

**Files:**
- Modify: `client/src/components/GalleryLightbox.jsx`

**Interfaces:**
- Consumes: `photos` entries may include `location`; `galleryPhotoMeta(region, activeName)`

- [ ] **Step 1: Add caption under image**

Wrap image + caption in a column that stops propagation. Caption:

```jsx
{(location || meta) && (
  <div className="mt-3 max-w-full text-center text-white/70 …" onClick={e => e.stopPropagation()}>
    {location && <div className="bodoni-small text-sm text-white/90">{location}</div>}
    {date && <div className="text-xs mt-1">{date}</div>}
    {cameraLine && <div className="text-xs">{cameraLine}</div>}
    {exposure && <div className="text-xs">{exposure}</div>}
  </div>
)}
```

Resolve `location` from `photos[index]?.location`.

- [ ] **Step 2: Manual check** — open lightbox, prev/next updates caption; Escape/backdrop still close.

---

### Task 5: Verification

- [ ] **Step 1:** `npm run photos:meta` succeeds; `snow-roots` rich; missing names absent.
- [ ] **Step 2:** Confirm originals not under `public/`.
- [ ] **Step 3:** Hover + lightbox on china + japan (desktop and one mobile gallery).
