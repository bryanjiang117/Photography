import { useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { CANADA_PHOTOS } from "../constants/data";

export default function CanadaGallery() {
  const { setShowCanadaGallery } = useContext(GalleryContext);
  const [activeImage, setActiveImage] = useState(null);

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-canada-primary"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
        className="flex items-end gap-3 px-4 pt-4 pb-2 text-white"
      >
        <div className="text-5xl font-tsm" lang="zh-CN" translate="no">
          加拿大
        </div>
        <span className="mb-1 text-base bodoni-small uppercase tracking-widest opacity-60">
          Canada
        </span>
      </motion.div>

      {/* Horizontal scroll gallery */}
      <div className="flex flex-1 min-h-0 flex-row items-stretch gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-4 py-3 scrollbar-hide">
        {CANADA_PHOTOS.map((name) => (
          <img
            key={name}
            src={`/assets/photos/canada/${name}.avif`}
            alt=""
            loading="lazy"
            className="w-[80vw] shrink-0 snap-start rounded-sm object-cover cursor-pointer"
            onClick={() => setActiveImage(name)}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
        className="flex items-end justify-between px-4 py-3"
      >
        <button
          onClick={() => setShowCanadaGallery(false)}
          className="flex items-center gap-2 text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200 p-3 -m-3"
        >
          <span className="text-lg leading-none">←</span>
          <span className="bodoni-small text-xs tracking-[0.25em] leading-none">
            BACK
          </span>
        </button>
        <div className="flex items-center gap-2 text-white">
          <span className="bodoni-small text-xs uppercase tracking-widest opacity-60">
            photography
          </span>
          <span className="opacity-60" translate="no">
            ‧
          </span>
          <span
            className="font-tsm text-xs font-extrabold opacity-60"
            lang="zh-CN"
            translate="no"
          >
            摄影
          </span>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-8"
            onClick={() => setActiveImage(null)}
          >
            <img
              src={`/assets/photos/canada/${activeImage}.avif`}
              alt=""
              className="max-w-full max-h-full object-contain rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
