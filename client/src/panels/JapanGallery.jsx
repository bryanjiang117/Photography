import { useContext, useEffect, useState } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { JAPAN_GALLERY_PHOTOS, JAPAN_ITEMS as ITEMS } from "../constants/data";
import GalleryGrid from "../components/GalleryGrid";
import GalleryLightbox from "../components/GalleryLightbox";
import { useGalleryScrollWarm } from "../hooks/useGalleryScrollWarm";
import { warmGalleryRegion } from "../galleryPrefetch";
import { galleryFadeMotion, gallerySlideMotion } from "../galleryMotion";

export default function JapanGallery({ entrance = true, slide = true }) {
  const { setShowJapanGallery } = useContext(GalleryContext);
  const scrollRef = useGalleryScrollWarm();
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    warmGalleryRegion("japan", JAPAN_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <motion.div
      {...gallerySlideMotion(entrance && slide, "y")}
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-japan-primary min-w-[1200px] min-h-[800px] scrollbar-hide"
    >
      <div className="grid min-h-full grid-cols-[8rem_minmax(0,1fr)_8rem]">
        {/* Left column: title + back button */}
        <div className="sticky top-0 self-start h-dvh flex flex-col justify-between px-8 pt-6 pb-6 text-white">
          <motion.div
            {...galleryFadeMotion(entrance)}
            className="flex flex-col items-start"
          >
            <div
              className="-translate-x-1 font-tsm text-[8rem] leading-none [writing-mode:vertical-rl]"
              lang="jp"
              translate="no"
            >
              日本
            </div>
            <span className="bodoni-small mt-4 text-lg uppercase tracking-widest opacity-60 [writing-mode:vertical-rl]">
              JAPAN
            </span>
          </motion.div>

          <motion.button
            {...galleryFadeMotion(entrance, 0.42)}
            onClick={() => setShowJapanGallery(false)}
            aria-label="Back"
            className="self-start text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200 p-3 -m-3"
          >
            <span className="block text-xl leading-none">←</span>
          </motion.button>
        </div>

        {/* Photo column — centered between equal side tracks */}
        <div className="min-w-0 flex flex-col items-center gap-20 py-16 px-40">
          <GalleryGrid
            region="japan"
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
          className="sticky top-0 self-start h-dvh flex flex-col items-end justify-end px-10 pb-6 text-white"
        >
          <div className="text-lg tracking-widest bodoni-small opacity-60 [writing-mode:vertical-rl]">
            PHOTOGRAPHY
          </div>
          <div
            className="mt-4 translate-x-1 font-tsm text-[8rem] leading-none [writing-mode:vertical-rl]"
            lang="zh-CN"
            translate="no"
          >
            摄影
          </div>
        </motion.div>
      </div>

      <GalleryLightbox
        region="japan"
        photos={JAPAN_GALLERY_PHOTOS}
        activeName={activeImage}
        onClose={() => setActiveImage(null)}
        onChange={setActiveImage}
      />
    </motion.div>
  );
}
