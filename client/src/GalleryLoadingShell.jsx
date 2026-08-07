import { useContext, useRef } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "./GalleryContext";
import {
  CANADA_GALLERY_PHOTOS,
  CANADA_ITEMS,
  CHINA_GALLERY_PHOTOS,
  CHINA_ITEMS,
  JAPAN_GALLERY_PHOTOS,
  JAPAN_ITEMS,
  MEXICO_GALLERY_PHOTOS,
  MEXICO_ITEMS,
} from "./constants/data";
import GalleryGrid from "./components/GalleryGrid";
import { gallerySlideMotion } from "./galleryMotion";

const REGION_CONFIG = {
  china: {
    items: CHINA_ITEMS,
    photos: CHINA_GALLERY_PHOTOS,
    bg: "bg-china-primary",
    desktop: {
      shellClass: "min-w-[1200px] min-h-[800px]",
      leftClass: "text-china-text-small",
      titleClass: "text-china-text",
      backClass:
        "cursor-pointer transition-colors duration-200 hover:text-china-text-small-hovered",
      rightClass: "text-china-text-small",
      title: "中国",
      titleLang: "zh-CN",
      subtitle: "China",
    },
    mobile: {
      titleClass: "text-white",
      backClass:
        "text-china-text-small cursor-pointer transition-colors duration-200 hover:text-china-text-small-hovered",
      bottomClass: "text-white",
      title: "中国",
      titleLang: "zh-CN",
      subtitle: "China",
    },
    closeKey: "setShowChinaGallery",
  },
  japan: {
    items: JAPAN_ITEMS,
    photos: JAPAN_GALLERY_PHOTOS,
    bg: "bg-japan-primary",
    desktop: {
      shellClass: "min-w-[1200px] min-h-[800px]",
      leftClass: "text-white",
      titleClass: "",
      backClass:
        "text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200",
      rightClass: "text-white",
      title: "日本",
      titleLang: "jp",
      subtitle: "JAPAN",
    },
    mobile: {
      titleClass: "text-white",
      backClass:
        "text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200",
      bottomClass: "text-white",
      title: "日本",
      titleLang: "jp",
      subtitle: "Japan",
    },
    closeKey: "setShowJapanGallery",
  },
  mexico: {
    items: MEXICO_ITEMS,
    photos: MEXICO_GALLERY_PHOTOS,
    bg: "bg-mexico-primary",
    desktop: {
      shellClass: "min-w-[1200px] min-h-[800px]",
      leftClass: "text-white",
      titleClass: "",
      backClass:
        "text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200",
      rightClass: "text-white",
      title: "墨西哥城",
      titleLang: "zh-CN",
      subtitle: "Mexico City",
    },
    mobile: {
      titleClass: "text-white",
      backClass:
        "text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200",
      bottomClass: "text-white",
      title: "墨西哥城",
      titleLang: "zh-CN",
      subtitle: "Mexico City",
    },
    closeKey: "setShowMexicoGallery",
  },
  canada: {
    items: CANADA_ITEMS,
    photos: CANADA_GALLERY_PHOTOS,
    bg: "bg-canada-primary",
    desktop: {
      shellClass: "min-w-[1200px] min-h-[800px]",
      leftClass: "text-white",
      titleClass: "",
      backClass:
        "text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200",
      rightClass: "text-white",
      title: "加拿大",
      titleLang: "zh-CN",
      subtitle: "CANADA",
    },
    mobile: {
      titleClass: "text-white",
      backClass:
        "text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200",
      bottomClass: "text-white",
      title: "加拿大",
      titleLang: "zh-CN",
      subtitle: "Canada",
    },
    closeKey: "setShowCanadaGallery",
  },
};

function MobileSkeletonStrip({ photos }) {
  return photos.slice(0, 8).map((photo) => (
    <span
      key={photo.name}
      className="block h-32 w-32 shrink-0 snap-start overflow-hidden skeleton-shimmer"
      aria-hidden="true"
    />
  ));
}

/**
 * Eager gallery chrome shown while the lazy gallery chunk loads.
 * Title, back button, and skeleton grid appear on the first frame.
 */
export default function GalleryLoadingShell({ region, isMobile, instant = false }) {
  const ctx = useContext(GalleryContext);
  const config = REGION_CONFIG[region];
  const scrollRef = useRef(null);
  if (!config) return null;

  const onClose = () => ctx[config.closeKey](false);
  const axis = isMobile ? "x" : "y";
  const ui = isMobile ? config.mobile : config.desktop;
  const slide = gallerySlideMotion(!instant, axis);

  if (isMobile) {
    return (
      <motion.div
        {...slide}
        className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${config.bg}`}
      >
        <div
          className={`flex items-end gap-3 px-4 pt-4 pb-2 ${ui.titleClass}`}
        >
          <div className="text-5xl font-tsm" lang={ui.titleLang} translate="no">
            {ui.title}
          </div>
          <span className="mb-1 text-base bodoni-small uppercase tracking-widest opacity-60">
            {ui.subtitle}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide touch-pan-x">
          <div className="flex h-full w-max min-w-full flex-row items-center gap-3 px-4 py-3">
            <MobileSkeletonStrip photos={config.photos} />
          </div>
        </div>

        <div
          className={`flex items-end justify-between px-4 py-3 ${ui.bottomClass}`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`flex items-center gap-2 p-3 -m-3 ${ui.backClass}`}
          >
            <span className="text-lg leading-none">←</span>
            <span className="bodoni-small text-xs tracking-[0.25em] leading-none">
              BACK
            </span>
          </button>
          <div className="flex items-center gap-2">
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
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...slide}
      ref={scrollRef}
      className={`fixed inset-0 z-50 overflow-y-auto overflow-x-hidden scrollbar-hide ${config.bg} ${ui.shellClass}`}
    >
      <div className="grid min-h-full grid-cols-[8rem_minmax(0,1fr)_8rem]">
        <div
          className={`sticky top-0 self-start h-dvh flex flex-col justify-between px-8 pt-6 pb-6 ${ui.leftClass}`}
        >
          <div className="flex flex-col items-start">
            <div
              className={`-translate-x-1 font-tsm text-[8rem] leading-none [writing-mode:vertical-rl] ${ui.titleClass}`}
              lang={ui.titleLang}
              translate="no"
            >
              {ui.title}
            </div>
            <span className="bodoni-small mt-4 text-lg uppercase tracking-widest opacity-60 [writing-mode:vertical-rl]">
              {ui.subtitle}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className={`self-start p-3 -m-3 ${ui.backClass}`}
          >
            <span className="block text-xl leading-none">←</span>
          </button>
        </div>

        <div className="min-w-0 flex flex-col items-center gap-20 py-16 px-40">
          <GalleryGrid
            region={region}
            items={config.items}
            skeleton
            virtualize
            scrollRootRef={scrollRef}
            overscan="300%"
          />
        </div>

        <div
          className={`sticky top-0 self-start h-dvh flex flex-col items-end justify-end px-10 pb-6 ${ui.rightClass}`}
        >
          <div className="text-lg tracking-widest bodoni-small opacity-60 [writing-mode:vertical-rl]">
            PHOTOGRAPHY
          </div>
          <div
            className={`mt-4 translate-x-1 font-tsm text-[8rem] leading-none [writing-mode:vertical-rl] ${ui.titleClass}`}
            lang="zh-CN"
            translate="no"
          >
            摄影
          </div>
        </div>
      </div>
    </motion.div>
  );
}
