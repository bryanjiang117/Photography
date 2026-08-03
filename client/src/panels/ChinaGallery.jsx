import { useContext, useEffect, useState } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { CHINA_GALLERY_PHOTOS, CHINA_ITEMS as ITEMS } from "../constants/data";
import GalleryGrid from "../components/GalleryGrid";
import GalleryLightbox from "../components/GalleryLightbox";
import { useGalleryScrollWarm } from "../hooks/useGalleryScrollWarm";
import { warmGalleryRegion } from "../galleryPrefetch";
import { galleryFadeMotion, gallerySlideMotion } from "../galleryMotion";

export default function ChinaGallery({ entrance = true, slide = true }) {
  const { setShowChinaGallery } = useContext(GalleryContext);
  const scrollRef = useGalleryScrollWarm();
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    warmGalleryRegion("china", CHINA_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <motion.div
      {...gallerySlideMotion(entrance && slide, "y")}
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-china-primary min-w-[1200px] min-h-[800px] scrollbar-hide"
    >
      <div className="grid min-h-full grid-cols-[8rem_minmax(0,1fr)_8rem]">
        {/* Left column: title + back button */}
        <div className="sticky top-0 self-start h-dvh flex flex-col justify-between px-8 pt-6 pb-6 text-china-text-small">
          <motion.div
            {...galleryFadeMotion(entrance)}
            className="flex flex-col items-start"
          >
            <div
              className="-translate-x-1 font-tsm text-[8rem] leading-none text-china-text [writing-mode:vertical-rl]"
              lang="zh-CN"
              translate="no"
            >
              中国
            </div>
            <span className="bodoni-small mt-4 text-lg uppercase tracking-widest opacity-60 [writing-mode:vertical-rl]">
              China
            </span>
          </motion.div>

          <motion.button
            {...galleryFadeMotion(entrance, 0.42)}
            onClick={() => setShowChinaGallery(false)}
            aria-label="Back"
            className="self-start cursor-pointer transition-colors duration-200 hover:text-china-text-small-hovered p-3 -m-3"
          >
            <span className="block text-xl leading-none">←</span>
          </motion.button>
        </div>

        {/* Photo column — centered between equal side tracks */}
        <div className="min-w-0 flex flex-col items-center gap-20 py-16 px-40">
          <GalleryGrid
            region="china"
            items={ITEMS}
            virtualize
            scrollRootRef={scrollRef}
            overscan="300%"
            onImageClick={setActiveImage}
          />
        </div>

        {/* Right column: photography label (mirrors country title) */}
        <motion.div
          {...galleryFadeMotion(entrance, 0.42)}
          className="sticky top-0 self-start h-dvh flex flex-col items-end justify-end px-10 pb-6 text-china-text-small"
        >
          <div className="text-lg tracking-widest bodoni-small opacity-60 [writing-mode:vertical-rl]">
            PHOTOGRAPHY
          </div>
          <div
            className="mt-4 translate-x-1 font-tsm text-[8rem] leading-none text-china-text [writing-mode:vertical-rl]"
            lang="zh-CN"
            translate="no"
          >
            摄影
          </div>
        </motion.div>
      </div>

      <GalleryLightbox
        region="china"
        photos={CHINA_GALLERY_PHOTOS}
        activeName={activeImage}
        onClose={() => setActiveImage(null)}
        onChange={setActiveImage}
      />
    </motion.div>
  );
}
