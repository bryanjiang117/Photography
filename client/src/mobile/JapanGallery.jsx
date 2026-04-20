import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";

export default function JapanGallery() {
  const { setShowJapanGallery } = useContext(GalleryContext);

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-japan-primary"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
        className="flex items-end gap-3 px-4 pt-4 pb-2 text-white"
      >
        <div className="text-5xl font-tsm" lang="jp" translate="no">
          日本
        </div>
        <span className="mb-1 text-base bodoni-small uppercase tracking-widest opacity-60">
          Japan
        </span>
      </motion.div>

      {/* Placeholder message */}
      <div className="flex flex-1 min-h-0 items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 text-center text-white"
        >
          <p className="font-tsm text-xl opacity-80" lang="zh-CN" translate="no">
            此刻播放
          </p>
          <p className="bodoni-small text-sm tracking-wide opacity-60 max-w-xs leading-relaxed">
            This film is still being developed. Check out Mexico City and Canada first.
          </p>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
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
    </motion.div>
  );
}
