# Web Gallery Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a desktop web lightbox so clicking a gallery photo shows the full (`lg`) image, with Esc/backdrop dismiss and quiet prev/next (arrows + keyboard).

**Architecture:** Shared `GalleryLightbox` component owns overlay UI, keyboard handling, and wrap-around navigation over `*_GALLERY_PHOTOS`. `GalleryGrid` gains an optional `onImageClick` callback. Each of the four web gallery panels holds `activeImage` state and mounts the lightbox. Mobile galleries are left unchanged.

**Tech Stack:** React 19, Motion (`motion/react` AnimatePresence), existing `GalleryLightboxImage` / `GalleryGrid` / `GalleryImage`, Vite.

## Global Constraints

- Desktop web galleries only (Mexico, Canada, China, Japan panels); do not change mobile lightbox behavior.
- Lightbox image tier remains `lg` via `GalleryLightboxImage`.
- Navigation order is each region’s `*_GALLERY_PHOTOS` (flattened grid order); wrap at ends.
- Dismiss: backdrop click + Escape. Navigate: small low-salience arrows + ArrowLeft/ArrowRight.
- Match mobile overlay tone (`bg-black/70`, ~0.2s fade); no cards, heavy shadows, or high-contrast chrome.
- No new test framework; verify with manual checks and `npm run build` in `client/`.
- Spec: `docs/superpowers/specs/2026-07-31-web-gallery-lightbox-design.md`.

---

## File structure

| File | Role |
|------|------|
| `client/src/components/GalleryLightbox.jsx` | **Create** — overlay, arrows, keyboard, wraps `GalleryLightboxImage` |
| `client/src/components/GalleryGrid.jsx` | **Modify** — optional `onImageClick(name)` passed to every `GalleryImage` |
| `client/src/panels/MexicoCityGallery.jsx` | **Modify** — state + lightbox wiring |
| `client/src/panels/CanadaGallery.jsx` | **Modify** — same |
| `client/src/panels/ChinaGallery.jsx` | **Modify** — same |
| `client/src/panels/JapanGallery.jsx` | **Modify** — same |

Do not modify `client/src/mobile/*Gallery.jsx`.

---

### Task 1: `GalleryLightbox` component

**Files:**
- Create: `client/src/components/GalleryLightbox.jsx`
- Reuse: `client/src/components/GalleryLightboxImage.jsx` (unchanged)

**Interfaces:**
- Consumes: `GalleryLightboxImage({ region, name, onClick })`; Motion `AnimatePresence` / `motion.div`
- Produces: `GalleryLightbox({ region, photos, activeName, onClose, onChange })` where `photos` is `{ name: string, ... }[]`, `activeName` is `string | null`, `onClose: () => void`, `onChange: (name: string) => void`

- [ ] **Step 1: Create `GalleryLightbox.jsx`**

```jsx
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import GalleryLightboxImage from "./GalleryLightboxImage";

/**
 * Full-image overlay for web galleries.
 * @param {{
 *   region: string;
 *   photos: { name: string }[];
 *   activeName: string | null;
 *   onClose: () => void;
 *   onChange: (name: string) => void;
 * }} props
 */
export default function GalleryLightbox({
  region,
  photos,
  activeName,
  onClose,
  onChange,
}) {
  const index = activeName
    ? photos.findIndex((p) => p.name === activeName)
    : -1;
  const open = index >= 0;

  const go = (delta) => {
    if (!open || photos.length === 0) return;
    const next = (index + delta + photos.length) % photos.length;
    onChange(photos[next].name);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const arrowClass =
    "shrink-0 p-2 text-sm leading-none text-white/35 hover:text-white/70 focus-visible:text-white/70 transition-colors duration-200 cursor-pointer bg-transparent border-0";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-60 flex items-center justify-center gap-3 bg-black/70 p-8"
          onClick={onClose}
        >
          <button
            type="button"
            aria-label="Previous photo"
            className={arrowClass}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            ←
          </button>
          <GalleryLightboxImage
            region={region}
            name={activeName}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Next photo"
            className={arrowClass}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Note: the `useEffect` intentionally omits a dependency array (or use `[open, index, photos, onClose, onChange]` and call navigation via fresh `index` inside) so handlers always see the current index. Prefer an explicit dependency array with `index`, `photos`, `onClose`, `onChange` and inline the wrap math inside the listener to avoid stale closures:

```jsx
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      if (photos.length === 0) return;
      const delta = e.key === "ArrowLeft" ? -1 : 1;
      const next = (index + delta + photos.length) % photos.length;
      onChange(photos[next].name);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, index, photos, onClose, onChange]);
```

Use this version (not the empty-deps version) in the file.

- [ ] **Step 2: Smoke-check the module loads**

Run from `client/`:

```bash
node --input-type=module -e "import('file:///'"$(pwd)"'/src/components/GalleryLightbox.jsx').then(() => console.log('ok')).catch(e => { console.error(e); process.exit(1); })"
```

Expected: may fail on JSX without a transform — skip if so. Prefer:

```bash
cd client && npm run build
```

Expected: build succeeds after later tasks wire imports; for this task alone, confirm the file exists and has no syntax issues by visual inspection if build fails on unrelated WIP.

If the repo has unrelated dirty changes that break build, still commit this file after visual review.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/GalleryLightbox.jsx
git commit -m "$(cat <<'EOF'
feat: add shared GalleryLightbox for web galleries

EOF
)"
```

---

### Task 2: Wire `onImageClick` through `GalleryGrid`

**Files:**
- Modify: `client/src/components/GalleryGrid.jsx`

**Interfaces:**
- Consumes: `parseImageEntry`, `rowDefaultSize`, `GalleryImage`
- Produces: `GalleryGrid({ …, onImageClick?: (name: string) => void })` — when set, every real `GalleryImage` gets `onClick={() => onImageClick(name)}` and `cursor-pointer` on its `className`

- [ ] **Step 1: Add helper + prop**

At the top of `GalleryGrid` (after imports / skeleton helper), the component signature becomes:

```jsx
export default function GalleryGrid({
  region,
  items,
  virtualize = false,
  scrollRootRef,
  overscan,
  skeleton = false,
  onImageClick,
}) {
```

Inside the component, add:

```jsx
  const clickProps = (entry, row) => {
    if (!onImageClick) return {};
    const rowSize = row ? rowDefaultSize(row) : "md";
    const parsed = parseImageEntry(entry, rowSize, row?.location);
    if (!parsed) return {};
    return {
      onClick: () => onImageClick(parsed.name),
      className: "cursor-pointer",
    };
  };
```

- [ ] **Step 2: Pass click props to every `GalleryImage`**

For each existing `<GalleryImage … />` in `renderRow` (full-width, single-column, nested sub-row, stacked column), merge click props. Pattern:

**Full-width image** (currently no `className`):

```jsx
          <GalleryImage
            region={region}
            entry={row.columns[0][0]}
            row={row}
            layout="full"
            loadProps={loadPropsFor(i)}
            wrapperClassName="w-full shrink-0"
            {...clickProps(row.columns[0][0], row)}
          />
```

**Grid image with existing `className="object-cover"`** — merge cursor into className instead of spreading a second `className`:

```jsx
  const clickProps = (entry, row, baseClassName = "") => {
    if (!onImageClick) {
      return baseClassName ? { className: baseClassName } : {};
    }
    const rowSize = row ? rowDefaultSize(row) : "md";
    const parsed = parseImageEntry(entry, rowSize, row?.location);
    if (!parsed) {
      return baseClassName ? { className: baseClassName } : {};
    }
    return {
      onClick: () => onImageClick(parsed.name),
      className: `${baseClassName} cursor-pointer`.trim(),
    };
  };
```

Then:

```jsx
                  <GalleryImage
                    region={region}
                    entry={col[0]}
                    row={row}
                    layout="grid"
                    loadProps={loadPropsFor(i, j)}
                    onLoad={
                      row.fit === "contain"
                        ? (e) => {
                            e.currentTarget.parentElement.parentElement.style.flex = `${e.currentTarget.naturalWidth / e.currentTarget.naturalHeight} 1 0%`;
                          }
                        : undefined
                    }
                    wrapperClassName="w-full"
                    {...clickProps(col[0], row, "object-cover")}
                  />
```

Apply the same `...clickProps(entry, row, "object-cover")` (or `...clickProps(entry, row)` for full-width with no base class) to **all** `GalleryImage` call sites in this file. Skeleton cells stay non-clickable.

Update the JSDoc `@param` block to include `onImageClick?: (name: string) => void`.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/GalleryGrid.jsx
git commit -m "$(cat <<'EOF'
feat: allow GalleryGrid photos to open via onImageClick

EOF
)"
```

---

### Task 3: Wire lightbox into all four web gallery panels

**Files:**
- Modify: `client/src/panels/MexicoCityGallery.jsx`
- Modify: `client/src/panels/CanadaGallery.jsx`
- Modify: `client/src/panels/ChinaGallery.jsx`
- Modify: `client/src/panels/JapanGallery.jsx`

**Interfaces:**
- Consumes: `GalleryLightbox` from Task 1; `GalleryGrid.onImageClick` from Task 2; existing `*_GALLERY_PHOTOS` / `ITEMS` imports
- Produces: each panel opens lightbox on grid click with region-correct photo list

- [ ] **Step 1: Update Mexico City panel**

Change imports and add state + lightbox. Diff relative to current file:

```jsx
import { useContext, useEffect, useState } from "react";
// ...existing imports...
import GalleryLightbox from "../components/GalleryLightbox";

export default function MexicoCityGallery({ entrance = true, slide = true }) {
  const { setShowMexicoGallery } = useContext(GalleryContext);
  const scrollRef = useGalleryScrollWarm();
  const [activeImage, setActiveImage] = useState(null);

  // ...existing useEffect unchanged...

  return (
    <motion.div
      {/* ...existing props/className unchanged... */}
    >
      <div className="flex min-h-full">
        {/* ...left column unchanged... */}

        <div className="flex-1 min-w-0 flex flex-col items-center gap-20 py-16 px-40">
          <GalleryGrid
            region="mexico"
            items={ITEMS}
            onImageClick={setActiveImage}
          />
        </div>

        {/* ...right column unchanged... */}
      </div>

      <GalleryLightbox
        region="mexico"
        photos={MEXICO_GALLERY_PHOTOS}
        activeName={activeImage}
        onClose={() => setActiveImage(null)}
        onChange={setActiveImage}
      />
    </motion.div>
  );
}
```

- [ ] **Step 2: Update Canada, China, Japan panels the same way**

For each file, mirror Step 1 with the correct region key and photo constant:

| File | `region` | `photos` | setter already imported |
|------|----------|----------|-------------------------|
| `CanadaGallery.jsx` | `"canada"` | `CANADA_GALLERY_PHOTOS` | `setShowCanadaGallery` |
| `ChinaGallery.jsx` | `"china"` | `CHINA_GALLERY_PHOTOS` | `setShowChinaGallery` |
| `JapanGallery.jsx` | `"japan"` | `JAPAN_GALLERY_PHOTOS` | `setShowJapanGallery` |

Each gets:

```jsx
import { useContext, useEffect, useState } from "react";
import GalleryLightbox from "../components/GalleryLightbox";
// ...
const [activeImage, setActiveImage] = useState(null);
// ...
<GalleryGrid region="…" items={ITEMS} onImageClick={setActiveImage} />
// ...
<GalleryLightbox
  region="…"
  photos={…_GALLERY_PHOTOS}
  activeName={activeImage}
  onClose={() => setActiveImage(null)}
  onChange={setActiveImage}
/>
```

Preserve each panel’s existing layout/markup; only add imports, state, `onImageClick`, and `GalleryLightbox`.

- [ ] **Step 3: Build**

```bash
cd client && npm run build
```

Expected: build completes with exit code 0.

- [ ] **Step 4: Manual verification**

```bash
cd client && npm run dev
```

On desktop viewport (≥1200px width for gallery min-width):

1. Open Mexico gallery → click a photo → lightbox shows that image.
2. Click darkened backdrop → closes.
3. Re-open → press Esc → closes.
4. Re-open → click image (not backdrop) → stays open.
5. Use ←/→ keys and on-screen arrows → cycles photos; wrapping works at first/last.
6. Hover a photo with a location label → overlay still appears; click still opens lightbox.
7. Repeat open/dismiss once for Canada, China, Japan.
8. Spot-check mobile gallery still opens its existing lightbox (tap + backdrop only; no requirement for Esc/arrows).

- [ ] **Step 5: Commit**

```bash
git add \
  client/src/panels/MexicoCityGallery.jsx \
  client/src/panels/CanadaGallery.jsx \
  client/src/panels/ChinaGallery.jsx \
  client/src/panels/JapanGallery.jsx
git commit -m "$(cat <<'EOF'
feat: open web gallery lightbox on photo click

EOF
)"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Click photo → lightbox (`lg`) | 2 + 3 |
| Backdrop dismiss | 1 |
| Esc dismiss | 1 |
| Quiet arrows prev/next | 1 |
| Arrow keys prev/next | 1 |
| Order = `*_GALLERY_PHOTOS`, wrap | 1 + 3 |
| Shared component, four web panels | 1 + 3 |
| Location hover preserved | 2 (click only; overlay untouched) |
| Mobile unchanged | Explicit non-touch of `mobile/*` |
| Visual: `bg-black/70`, fade, low-salience arrows | 1 |
