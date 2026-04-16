import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";

// Strings = landscape (full width). Arrays = portrait pair (side by side).
const ITEMS = [
  "orange-wall",
  ["green-wall", "blue-door", "bike-leaves"],
  ["meat-vendor", "pastor-tacos"],
  ["", "street-vendor", "", "coke-store"],
  ["taco-vendor", "bakery"],
  ["flowers", "fruit-store", "fruit-vendor"],
  ["old-man", ""],
  ["bikes", "", "pool", "", "street-stalls"],
  "windmill",
  ["modern-balcony", "", "old-building"],
  "line-squirrel",
  ["playground", ""], // maybe make this one full width
  ["museum-reflection", "museum-roof", "art-museum", "palace", ""],
  ["plaza-garibaldi"],
  // ["tree-reflection", "palm-trees"],
];

export default function MexicoCityGallery() {
  const { setShowMexicoGallery } = useContext(GalleryContext);
  return (
    <motion.div
      initial={{ y: "100vh" }}
      animate={{ y: 0 }}
      exit={{ y: "100vh" }}
      transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
      className="fixed inset-0 z-50 flex overflow-hidden bg-mexico-primary"
    >
      {/* Left fixed: vertical Chinese title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
        className="pointer-events-none absolute left-8 top-6 z-20 flex flex-col items-start text-white"
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

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
        onClick={() => setShowMexicoGallery(false)}
        className="absolute bottom-6 left-8 z-20 flex items-center gap-2 text-white/65 cursor-pointer hover:text-white/90 transition-colors duration-200 p-3 -m-3"
      >
        <span className="text-lg leading-none">←</span>
        <span className="bodoni-small text-xs tracking-[0.25em] leading-none">
          BACK
        </span>
      </motion.button>

      {/* Right fixed: photography label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-6 right-10 z-20 flex flex-col items-end gap-3 text-white"
      >
        <div
          className="font-tsm text-xl font-extrabold leading-none [writing-mode:vertical-rl] opacity-60"
          lang="zh-CN"
          translate="no"
        >
          摄影
        </div>
        <div className="translate-x-1 text-lg tracking-widest bodoni-small opacity-60 [writing-mode:vertical-rl] ">
          PHOTOGRAPHY
        </div>
      </motion.div>

      {/* Scrollable photo column */}
      <div className="flex min-h-0 flex-1 flex-col items-center gap-20 overflow-y-auto overflow-x-visible py-16 px-20 scrollbar-hide">
        {ITEMS.map((row, i) =>
          Array.isArray(row) ? (
            <div
              key={i}
              className="w-[calc(100%-28rem)] max-w-full shrink-0 flex gap-4"
            >
              {row.map((item, i) => (
                <img
                  src={`/assets/photos/mexico/${item}.jpeg`}
                  alt=""
                  className="flex-1 min-w-0 object-cover"
                />
              ))}
            </div>
          ) : (
            <img
              key={row}
              src={`/assets/photos/mexico/${row}.jpeg`}
              alt=""
              className="w-[calc(100%-28rem)] max-w-full shrink-0"
            />
          ),
        )}
      </div>
    </motion.div>
  );
}
