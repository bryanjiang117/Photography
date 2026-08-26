import { useContext, useEffect, useState } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { MEXICO_GALLERY_PHOTOS } from "../constants/data";
import GalleryImage from "../components/GalleryImage";
import GalleryLightbox from "../components/GalleryLightbox";
import {
  galleryImgLoadProps,
  warmGalleryRegion,
} from "../galleryPrefetch";
import { useGalleryScrollWarm } from "../hooks/useGalleryScrollWarm";
import { galleryFadeMotion, gallerySlideMotion } from "../galleryMotion";

export default function MexicoCityGallery({ entrance = true, slide = true }) {
  const { setShowMexicoGallery } = useContext(GalleryContext);
  const [activeImage, setActiveImage] = useState(null);
  const scrollRef = useGalleryScrollWarm();

  useEffect(() => {
    warmGalleryRegion("mexico", MEXICO_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <motion.div
      {...gallerySlideMotion(entrance && slide, "x")}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-mexico-primary"
    >
      {/* Title */}
      <motion.div
        {...galleryFadeMotion(entrance)}
        className="flex items-end gap-3 px-4 pt-4 pb-2 text-white"
      >
        <div className="text-5xl font-tsm" lang="zh-CN" translate="no">
          墨西哥城
        </div>
        <span className="mb-1 text-base bodoni-small uppercase tracking-widest opacity-60">
          Mexico City
        </span>
      </motion.div>

      {/* Horizontal scroll gallery */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden overscroll-none snap-x snap-mandatory scrollbar-hide touch-pan-x"
      >
        <div className="flex h-full w-max min-w-full flex-row items-center gap-3 px-4 py-3">
          {MEXICO_GALLERY_PHOTOS.map((photo, i) => (
            <GalleryImage
              key={photo.name}
              region="mexico"
              entry={photo}
              layout="mobile"
              loadProps={galleryImgLoadProps(i)}
              wrapperClassName="w-32 h-32 shrink-0 snap-start"
              className="object-cover cursor-pointer h-full w-full"
              onClick={() => setActiveImage(photo.name)}
            />
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div
        {...galleryFadeMotion(entrance, 0.42)}
        className="flex items-end justify-between px-4 py-3"
      >
        <button
          onClick={() => setShowMexicoGallery(false)}
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

      <GalleryLightbox
        region="mexico"
        photos={MEXICO_GALLERY_PHOTOS}
        activeName={activeImage}
        onClose={() => setActiveImage(null)}
        onChange={setActiveImage}
        arrows="bottom"
      />
    </motion.div>
  );
}
