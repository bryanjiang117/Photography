import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify-icon/react";
import GalleryLightboxImage from "./GalleryLightboxImage";
import GalleryLocationLabel from "./GalleryLocationLabel";
import { galleryPhotoMeta } from "../constants/galleryPhotoMeta";
import {
  formatCameraLine,
  formatExposureLine,
  formatPhotoDate,
} from "../galleryPhotoMetaFormat";

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
  const activePhoto = open ? photos[index] : null;
  const location = activePhoto?.location;
  const meta = activeName ? galleryPhotoMeta(region, activeName) : null;
  const dateLine = formatPhotoDate(meta?.takenAt);
  const cameraLine = formatCameraLine(meta);
  const exposureLine = formatExposureLine(meta);
  const showCaption = Boolean(
    location || dateLine || cameraLine || exposureLine,
  );
  // Ignore backdrop close when either end of the click was on the caption
  // (so text selection that starts or ends on the caption doesn't dismiss).
  const captionPointerRef = useRef(false);

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

  const isCaptionTarget = (target) =>
    target instanceof Element &&
    Boolean(target.closest("[data-lightbox-caption]"));

  const onOverlayPointerDown = (e) => {
    captionPointerRef.current = isCaptionTarget(e.target);
  };

  const onOverlayPointerUp = (e) => {
    if (isCaptionTarget(e.target)) captionPointerRef.current = true;
  };

  const onOverlayClick = () => {
    if (captionPointerRef.current) {
      captionPointerRef.current = false;
      return;
    }
    onClose();
  };

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
          onPointerDown={onOverlayPointerDown}
          onPointerUp={onOverlayPointerUp}
          onClick={onOverlayClick}
        >
          {!bottomArrows && prevButton}
          <div
            className={
              bottomArrows
                ? "absolute inset-0 flex items-center justify-center p-8 pb-20"
                : "absolute inset-0 flex items-center justify-center p-8"
            }
          >
            <div className="flex max-h-full w-full max-w-full flex-col items-center gap-4">
              <div className="flex w-full min-h-0 min-w-0 max-h-full items-center justify-center">
                <GalleryLightboxImage
                  region={region}
                  name={activeName}
                  maxHeight={
                    showCaption
                      ? "calc(100vh - 12rem)"
                      : "calc(100vh - 8rem)"
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {showCaption ? (
                <div
                  data-lightbox-caption
                  className="max-w-full shrink-0 px-2 text-center text-balance select-text cursor-text"
                >
                  {location ? (
                    <div className="text-sm font-medium text-white bodoni-small">
                      <GalleryLocationLabel location={location} />
                    </div>
                  ) : null}
                  {dateLine || cameraLine || exposureLine ? (
                    <div
                      className={`text-xs text-white/90 [font-family:system-ui,sans-serif]${location ? " mt-1" : ""}`}
                    >
                      {[dateLine, cameraLine, exposureLine]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
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
