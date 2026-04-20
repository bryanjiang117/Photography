import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";

export default function JapanGallery() {
  const { setShowJapanGallery } = useContext(GalleryContext);
  return (
    <motion.div
      initial={{ y: "100vh" }}
      animate={{ y: 0 }}
      exit={{ y: "100vh" }}
      transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
      className="fixed inset-0 z-50 flex overflow-hidden bg-japan-primary min-w-[1200px] min-h-[800px]"
    >
      {/* Left column: title + back button */}
      <div className="shrink-0 flex flex-col justify-between px-8 pt-6 pb-6 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.55, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          <div
            className="font-tsm text-[9rem] leading-none [writing-mode:vertical-rl]"
            lang="jp"
            translate="no"
          >
            日本
          </div>
          <span className="bodoni-small mt-4 text-lg uppercase tracking-widest opacity-60">
            JAPAN
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
          onClick={() => setShowJapanGallery(false)}
          className="flex items-center gap-2 cursor-pointer transition-colors duration-200 p-3 -m-3"
        >
          <span className="text-lg leading-none">←</span>
          <span className="bodoni-small text-sm tracking-[0.25em] leading-none">
            BACK
          </span>
        </motion.button>
      </div>

      {/* Center: placeholder message */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col items-center justify-center gap-6 px-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 text-center text-white"
        >
          <p className="font-tsm text-2xl opacity-80" lang="zh-CN" translate="no">
            此刻播放
          </p>
          <p className="bodoni-small text-lg tracking-wide opacity-60 max-w-md leading-relaxed">
            This film is still being developed. Check out Mexico City and Canada first.
          </p>
        </motion.div>
      </div>

      {/* Right column: photography label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.42, duration: 0.55, ease: "easeOut" }}
        className="shrink-0 flex flex-col items-end justify-end gap-3 px-10 pb-6 text-white"
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
