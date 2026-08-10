import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
} from "motion/react";
import { Icon } from "@iconify-icon/react";
import GalleryLightboxImage from "./GalleryLightboxImage";
import GalleryLocationLabel from "./GalleryLocationLabel";
import { galleryPhotoMeta } from "../constants/galleryPhotoMeta";
import {
  formatCameraLine,
  formatExposureLine,
  formatPhotoDate,
} from "../galleryPhotoMetaFormat";

const SWIPE_VELOCITY = 400;
/** Horizontal space between lightbox slides while swiping. */
const SLIDE_GAP = 24;
/** Pointer travel above this is a swipe/drag, not a tap-to-dismiss. */
const TAP_SLOP_PX = 12;

/**
 * @param {string} region
 * @param {{ name: string; location?: string }} photo
 */
function photoCaptionParts(region, photo) {
  const location = photo.location;
  const meta = galleryPhotoMeta(region, photo.name);
  const dateLine = formatPhotoDate(meta?.takenAt);
  const cameraLine = formatCameraLine(meta);
  const exposureLine = formatExposureLine(meta);
  const primaryMeta = [dateLine, cameraLine, exposureLine]
    .filter(Boolean)
    .join(" · ");
  return {
    location,
    primaryMeta,
    show: Boolean(location || primaryMeta),
  };
}

function isLightboxChrome(target) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "[data-lightbox-content], [data-lightbox-caption], button",
      ),
    )
  );
}

/**
 * Full-image overlay for gallery lightbox (web + mobile).
 * @param {{
 *   region: string;
 *   photos: { name: string; location?: string }[];
 *   activeName: string | null;
 *   onClose: () => void;
 *   onChange: (name: string) => void;
 *   arrows?: 'sides' | 'bottom';
 * }} props
 */
export default function GalleryLightbox({
  region,
  photos,
  activeName,
  onClose,
  onChange,
  arrows = "sides",
}) {
  const index = activeName
    ? photos.findIndex((p) => p.name === activeName)
    : -1;
  const open = index >= 0;
  const bottomArrows = arrows === "bottom";

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

  // Reserve caption + arrow chrome so each slide's image fits with its caption.
  const maxHeight = bottomArrows
    ? "calc(100vh - 12rem)"
    : "calc(100vh - 9rem)";

  const arrowBtnClass =
    "flex items-center justify-center p-3 text-white/35 hover:text-white/70 focus-visible:text-white/70 active:text-white/70 transition-colors duration-200 cursor-pointer bg-transparent border-0";

  const prevButton = (
    <button
      type="button"
      aria-label="Previous photo"
      className={
        bottomArrows
          ? arrowBtnClass
          : `${arrowBtnClass} absolute top-1/2 z-10 -translate-y-1/2 left-4`
      }
      onClick={(e) => {
        e.stopPropagation();
        go(-1);
      }}
    >
      <Icon icon="lucide:chevron-left" width={22} height={22} />
    </button>
  );

  const nextButton = (
    <button
      type="button"
      aria-label="Next photo"
      className={
        bottomArrows
          ? arrowBtnClass
          : `${arrowBtnClass} absolute top-1/2 z-10 -translate-y-1/2 right-4`
      }
      onClick={(e) => {
        e.stopPropagation();
        go(1);
      }}
    >
      <Icon icon="lucide:chevron-right" width={22} height={22} />
    </button>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-60 bg-black/70"
          onClick={onClose}
        >
          {!bottomArrows && prevButton}
          <div
            className={
              bottomArrows
                ? "absolute inset-0 py-8 pb-20"
                : "absolute inset-0 py-8"
            }
          >
            <LightboxSwipeTrack
              region={region}
              photos={photos}
              index={index}
              maxHeight={maxHeight}
              onGo={go}
              onDismiss={onClose}
            />
          </div>
          {!bottomArrows && nextButton}
          {bottomArrows && (
            <div
              className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {prevButton}
              {nextButton}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * @param {{
 *   region: string;
 *   photo: { name: string; location?: string };
 * }} props
 */
function LightboxCaption({ region, photo }) {
  const { location, primaryMeta, show } = photoCaptionParts(region, photo);
  if (!show) return null;
  return (
    <div className="mx-auto max-w-full shrink-0 px-8 text-center text-balance">
      {location ? (
        <div
          data-lightbox-caption
          className="mx-auto w-fit max-w-full text-sm font-medium text-white bodoni-small select-text cursor-text"
        >
          <GalleryLocationLabel location={location} />
        </div>
      ) : null}
      {primaryMeta ? (
        <div
          data-lightbox-caption
          className={`mx-auto w-fit max-w-full text-xs text-white/90 [font-family:system-ui,sans-serif] select-text cursor-text${location ? " mt-1" : ""}`}
        >
          {primaryMeta}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Full-area touch drag (including dark space). Tap on dark dismisses;
 * tap on image/caption does not. Swipe never dismisses.
 */
function LightboxSwipeTrack({
  region,
  photos,
  index,
  maxHeight,
  onGo,
  onDismiss,
}) {
  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const dragControls = useDragControls();
  const settlingRef = useRef(false);
  /** Touch pointerup already handled — ignore the synthetic click. */
  const consumeClickRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const canSwipe = photos.length > 1;

  const prevPhoto = photos[(index - 1 + photos.length) % photos.length];
  const currentPhoto = photos[index];
  const nextPhoto = photos[(index + 1) % photos.length];

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (width <= 0) return;
    x.set(-(width + SLIDE_GAP));
    settlingRef.current = false;
  }, [index, width, x]);

  const onDragEnd = (_, info) => {
    if (!canSwipe || width <= 0 || settlingRef.current) return;

    const stride = width + SLIDE_GAP;
    const threshold = Math.min(80, width * 0.2);
    const goNext =
      info.offset.x < -threshold || info.velocity.x < -SWIPE_VELOCITY;
    const goPrev =
      info.offset.x > threshold || info.velocity.x > SWIPE_VELOCITY;

    if (!goNext && !goPrev) {
      animate(x, -stride, { type: "spring", stiffness: 450, damping: 42 });
      return;
    }

    settlingRef.current = true;
    const target = goNext ? -stride * 2 : 0;
    const delta = goNext ? 1 : -1;
    animate(x, target, { type: "spring", stiffness: 450, damping: 42 }).then(
      () => {
        onGo(delta);
        x.set(-stride);
      },
    );
  };

  const movementExceedsTap = (clientX, clientY) => {
    const { x: sx, y: sy } = pointerStartRef.current;
    return (
      Math.abs(clientX - sx) > TAP_SLOP_PX ||
      Math.abs(clientY - sy) > TAP_SLOP_PX
    );
  };

  /** Dismiss only on a true tap (little/no movement) outside photo chrome. */
  const tryDismissFromTap = (e) => {
    if (movementExceedsTap(e.clientX, e.clientY)) return;
    if (isLightboxChrome(e.target)) return;
    onDismiss();
  };

  const slides =
    width > 0 ? [prevPhoto, currentPhoto, nextPhoto] : [currentPhoto];
  const keyFor = (photo, slot) =>
    photos.length === 2 ? `${slot}-${photo.name}` : photo.name;
  const trackWidth = width > 0 ? width * 3 + SLIDE_GAP * 2 : undefined;

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-w-0 max-w-full overflow-hidden touch-none"
      onPointerDown={(e) => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
        if (!canSwipe || e.pointerType !== "touch" || settlingRef.current) {
          return;
        }
        dragControls.start(e);
      }}
      onPointerUp={(e) => {
        // Decide tap vs swipe here — onDragEnd often runs *after* pointerup,
        // so we can't rely on a flag set there.
        if (e.pointerType === "touch") {
          consumeClickRef.current = true;
        }
        tryDismissFromTap(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (consumeClickRef.current) {
          consumeClickRef.current = false;
          return;
        }
        tryDismissFromTap(e);
      }}
    >
      <motion.div
        className="flex h-full items-stretch"
        style={{
          x,
          width: trackWidth,
          gap: width > 0 ? SLIDE_GAP : undefined,
        }}
        drag={canSwipe ? "x" : false}
        dragControls={dragControls}
        dragListener={false}
        dragDirectionLock
        dragElastic={0.12}
        onDragEnd={onDragEnd}
      >
        {slides.map((photo, slot) => (
          <div
            key={width > 0 ? keyFor(photo, slot) : `solo-${photo.name}`}
            className="flex h-full shrink-0 flex-col items-center justify-center gap-3"
            style={{ width: width > 0 ? width : "100%" }}
          >
            <GalleryLightboxImage
              region={region}
              name={photo.name}
              maxHeight={maxHeight}
            />
            <LightboxCaption region={region} photo={photo} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
