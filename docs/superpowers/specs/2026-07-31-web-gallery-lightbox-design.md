# Web Gallery Lightbox

## Goal

Bring mobile’s click-to-view-full-image lightbox to desktop web galleries, with desktop-friendly dismiss and navigation.

## Current state

- Mobile galleries (`client/src/mobile/*Gallery.jsx`) open a lightbox on image click: darkened overlay, `GalleryLightboxImage` at the `lg` tier, click backdrop to close.
- Web galleries (`client/src/panels/*Gallery.jsx`) render `GalleryGrid` with no click handler or lightbox.
- Shared pieces already exist: `GalleryLightboxImage`, `GalleryImage` (`onClick` prop), flattened photo lists `*_GALLERY_PHOTOS` (grid order via `flattenGalleryItems`).

## Scope

**In scope**

- Desktop web galleries only: Mexico, Canada, China, Japan panels.
- Open lightbox on photo click; close on backdrop click or Escape.
- Prev/next via small low-salience arrows and Left/Right arrow keys.
- Navigation order: that region’s `*_GALLERY_PHOTOS` (flattened grid order), wrapping at ends.

**Out of scope**

- Mobile lightbox changes (keep tap + backdrop-only dismiss).
- Pinch-zoom, download, captions in the lightbox, or swipe gestures.
- Changing image tier strategy (`lg` remains the lightbox source).

## Approach

Shared `GalleryLightbox` component used by all four web gallery panels. Wire click-through via `GalleryGrid` → `GalleryImage`. Prefer one implementation over copy-paste in each panel.

## Components

### `GalleryLightbox` (new)

Presentational + keyboard behavior for one open photo in a list.

**Props**

- `region`: gallery region key (`mexico` | `canada` | `china` | `japan`)
- `photos`: flattened list (`*_GALLERY_PHOTOS`); each entry has at least `name`
- `activeName`: currently shown photo name, or `null` when closed
- `onClose`: dismiss handler
- `onChange`: `(name: string) => void` when navigating

**Behavior**

- Renders nothing (or only `AnimatePresence` exit) when `activeName` is null.
- Overlay: `fixed inset-0`, `z-60` (above gallery shell), `bg-black/70`, centered content, fade in/out (~0.2s) matching mobile.
- Backdrop click → `onClose`. Image click does not close (`stopPropagation`).
- While open, listen for `keydown`:
  - `Escape` → `onClose`
  - `ArrowLeft` / `ArrowRight` → previous / next photo (wrap)
- Prev/next buttons: small, low-contrast (≈ white/35%, stronger on hover), left and right of the image area; not large chrome or filled pills. Clicking them does not close the lightbox.
- Image: reuse `GalleryLightboxImage` (`lg` tier, `object-contain`).

### `GalleryGrid` (extend)

- Add optional `onImageClick?: (name: string) => void`.
- Pass through to every `GalleryImage` as `onClick` that calls `onImageClick(parsed.name)`.
- When `onImageClick` is set, ensure clickable affordance (`cursor-pointer` on the image / wrapper).

### Web gallery panels (4)

Each `panels/*Gallery.jsx`:

- `useState` for `activeImage` (photo name or `null`).
- Pass `onImageClick={setActiveImage}` to `GalleryGrid`.
- Render `<GalleryLightbox region=… photos={*_GALLERY_PHOTOS} activeName={activeImage} onClose={() => setActiveImage(null)} onChange={setActiveImage} />`.

Location hover overlay on grid images stays as today; click still opens the lightbox.

## Data flow

```
GalleryGrid photo click
  → setActiveImage(name)
  → GalleryLightbox shows lg image
  → Esc / backdrop → setActiveImage(null)
  → ←/→ keys or arrow buttons → onChange(neighbor name in *_GALLERY_PHOTOS)
```

Index lookup: `photos.findIndex(p => p.name === activeName)`; neighbors wrap with modulo.

## Visual constraints

- Match mobile overlay tone and fade; do not introduce cards, heavy shadows, or high-contrast chrome.
- Arrows must read as secondary controls — discoverable on hover/focus, quiet at rest.
- Preserve existing gallery layout, scroll, and prefetch behavior.

## Testing (manual)

- Open each web gallery; click a grid photo → lightbox with correct image.
- Click backdrop → closes; Esc → closes; click image → stays open.
- Arrow buttons and Left/Right keys cycle through all photos in grid flatten order, wrapping.
- Location hover still appears on hover; click still opens lightbox.
- Mobile galleries unchanged.
