import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify-icon/react";
import GalleryLightboxImage from "./GalleryLightboxImage";

/**
 * Full-image overlay for gallery lightbox (web + mobile).
 * @param {{
 *   region: string;
 *   photos: { name: string }[];
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
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-8"
          onClick={onClose}
        >
          {!bottomArrows && prevButton}
          <GalleryLightboxImage
            region={region}
            name={activeName}
            onClick={(e) => e.stopPropagation()}
          />
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
