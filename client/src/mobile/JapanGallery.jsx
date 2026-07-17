import { useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { JAPAN_GALLERY_PHOTOS } from "../constants/data";
import GalleryImage from "../components/GalleryImage";
import GalleryLightboxImage from "../components/GalleryLightboxImage";
import { useGalleryScrollWarm } from "../hooks/useGalleryScrollWarm";
import { galleryImgLoadProps, warmGalleryRegion } from "../galleryPrefetch";
import { galleryFadeMotion, gallerySlideMotion } from "../galleryMotion";

export default function JapanGallery({ entrance = true, slide = true }) {
  const { setShowJapanGallery } = useContext(GalleryContext);
  const [activeImage, setActiveImage] = useState(null);
  const scrollRef = useGalleryScrollWarm();

  useEffect(() => {
    warmGalleryRegion("japan", JAPAN_GALLERY_PHOTOS, {
      concurrency: 5,
      layout: "mobile",
    });
  }, []);

  return (
    <motion.div
      {...gallerySlideMotion(entrance && slide, "x")}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-japan-primary"
    >
      {/* Title */}
      <motion.div
        {...galleryFadeMotion(entrance)}
        className="flex items-end gap-3 px-4 pt-4 pb-2 text-white"
      >
        <div className="text-5xl font-tsm" lang="jp" translate="no">
          日本
        </div>
        <span className="mb-1 text-base bodoni-small uppercase tracking-widest opacity-60">
          Japan
        </span>
      </motion.div>

      {/* Horizontal scroll gallery */}
      <div
        ref={scrollRef}
        className="flex flex-1 min-h-0 flex-row items-center gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-4 py-3 scrollbar-hide"
      >
        {JAPAN_GALLERY_PHOTOS.map((photo, i) => (
          <GalleryImage
            key={photo.name}
            region="japan"
            entry={photo}
            layout="mobile"
            loadProps={galleryImgLoadProps(i)}
            wrapperClassName="w-32 h-32 shrink-0 snap-start"
            className="object-cover cursor-pointer h-full w-full"
            onClick={() => setActiveImage(photo.name)}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <motion.div
        {...galleryFadeMotion(entrance, 0.42)}
        className="flex items-end justify-between px-4 py-3"
      >
        <button
          onClick={() => setShowJapanGallery(false)}
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
            <GalleryLightboxImage
              region="japan"
              name={activeImage}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
