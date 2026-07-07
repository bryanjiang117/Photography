import { useContext, useEffect } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { CHINA_GALLERY_PHOTOS, CHINA_ITEMS as ITEMS } from "../constants/data";
import GalleryGrid from "../components/GalleryGrid";
import { useGalleryScrollWarm } from "../hooks/useGalleryScrollWarm";
import { warmGalleryRegion } from "../galleryPrefetch";
import { gallerySlideMotion } from "../galleryMotion";

export default function ChinaGallery({ entrance = true }) {
  const { setShowChinaGallery } = useContext(GalleryContext);
  const scrollRef = useGalleryScrollWarm();

  useEffect(() => {
    warmGalleryRegion("china", CHINA_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <motion.div
      {...gallerySlideMotion(entrance, "y")}
      className="fixed inset-0 z-50 flex overflow-hidden bg-china-primary min-w-[1200px] min-h-[800px]"
    >
      {/* Left column: title + back button */}
      <div className="shrink-0 flex flex-col justify-between px-8 pt-6 pb-6 text-china-text-small">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          <div
            className="font-tsm text-[9rem] leading-none text-china-text [writing-mode:vertical-rl]"
            lang="zh-CN"
            translate="no"
          >
            中国
          </div>
          <span className="bodoni-small mt-4 text-lg uppercase tracking-widest opacity-60">
            China
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
          onClick={() => setShowChinaGallery(false)}
          className="flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:text-china-text-small-hovered p-3 -m-3"
        >
          <span className="text-lg leading-none">←</span>
          <span className="bodoni-small text-sm tracking-[0.25em] leading-none">
            BACK
          </span>
        </motion.button>
      </div>

      {/* Scrollable photo column */}
      <div
        ref={scrollRef}
        className="flex-1 min-w-0 min-h-0 flex flex-col items-center gap-20 overflow-y-auto py-16 px-40 scrollbar-hide"
      >
        <GalleryGrid
          region="china"
          items={ITEMS}
          virtualize
          scrollRootRef={scrollRef}
          overscan="300%"
        />
      </div>

      {/* Right column: photography label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
        className="shrink-0 flex flex-col items-end justify-end gap-3 px-10 pb-6 text-china-text-small"
      >
        <div
          className="font-tsm text-xl font-extrabold leading-none [writing-mode:vertical-rl] opacity-60"
          lang="zh-CN"
          translate="no"
        >
          摄影
        </div>
        <div className="translate-x-1 text-lg tracking-widest bodoni-small opacity-60 [writing-mode:vertical-rl]">
          PHOTOGRAPHY
        </div>
      </motion.div>
    </motion.div>
  );
}
