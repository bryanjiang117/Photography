import { useContext, useEffect } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { MEXICO_GALLERY_PHOTOS, MEXICO_ITEMS as ITEMS } from "../constants/data";
import GalleryGrid from "../components/GalleryGrid";
import { useGalleryScrollWarm } from "../hooks/useGalleryScrollWarm";
import { warmGalleryRegion } from "../galleryPrefetch";
import { galleryFadeMotion, gallerySlideMotion } from "../galleryMotion";

export default function MexicoCityGallery({ entrance = true, slide = true }) {
  const { setShowMexicoGallery } = useContext(GalleryContext);
  const scrollRef = useGalleryScrollWarm();

  useEffect(() => {
    warmGalleryRegion("mexico", MEXICO_GALLERY_PHOTOS, { concurrency: 5 });
  }, []);

  return (
    <motion.div
      {...gallerySlideMotion(entrance && slide, "y")}
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-mexico-primary min-w-[1200px] min-h-[800px] scrollbar-hide"
    >
      <div className="flex min-h-full">
        {/* Left column: title + back button */}
        <div className="sticky top-0 self-start h-dvh shrink-0 flex flex-col justify-between px-8 pt-6 pb-6 text-white">
          <motion.div
            {...galleryFadeMotion(entrance)}
            className="flex flex-col items-start"
          >
            <div
              className="font-tsm text-[9rem] leading-none [writing-mode:vertical-rl]"
              lang="zh-CN"
              translate="no"
            >
              墨西哥城
            </div>
            <span className="bodoni-small mt-4 text-lg uppercase tracking-widest opacity-60">
              Mexico City
            </span>
          </motion.div>

          <motion.button
            {...galleryFadeMotion(entrance, 0.42)}
            onClick={() => setShowMexicoGallery(false)}
            className="flex items-center gap-2 text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200 p-3 -m-3"
          >
            <span className="text-lg leading-none">←</span>
            <span className="bodoni-small text-xs tracking-[0.25em] leading-none">
              BACK
            </span>
          </motion.button>
        </div>

        {/* Photo column */}
        <div className="flex-1 min-w-0 flex flex-col items-center gap-20 py-16 px-40">
          <GalleryGrid region="mexico" items={ITEMS} />
        </div>

        {/* Right column: photography label */}
        <motion.div
          {...galleryFadeMotion(entrance, 0.42)}
          className="sticky top-0 self-start h-dvh shrink-0 flex flex-col items-end justify-end gap-3 px-10 pb-6 text-white"
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
      </div>
    </motion.div>
  );
}
