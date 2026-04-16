import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";

const MexicoCityPanel = () => {
  const { showMexicoGallery, setShowMexicoGallery } = useContext(GalleryContext);

  return (
    <div className="relative shrink-0 h-screen w-screen p-4">
      <div className="flex flex-col h-full mr-[15%]">
        <section className="relative flex-1 w-full bg-mexico-primary">
          <motion.img
            src="assets/photos/mexico/orange-wall.jpeg"
            className="absolute top-6 right-1/10 max-w-6/10 max-h-8/10 cursor-pointer"
            animate={showMexicoGallery
              ? { clipPath: "inset(0 0 100% 0)" }
              : { clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
            onClick={() => setShowMexicoGallery(true)}
          />
        </section>
        <section className="relative mb-8 p-4 w-fit h-fit">
          <div className="flex">
            <div className="title font-tsm" lang="zh-CN" translate="no">
              墨西哥城
            </div>
            <span className="mt-4 w-fit origin-top-left [writing-mode:vertical-rl] text-xl bodoni-small leading-none">
              Mexico City
            </span>
          </div>
          <div className="absolute bottom-0 right-0 w-fit translate-y-full translate-x-[calc(100%-6rem)] text-md">
            <span className="bodoni-small leading-none">
              photography &nbsp;
            </span>
            <span translate="no">‧</span>
            <span className="subtitle font-sh" lang="zh-CN" translate="no">
              &nbsp; 摄影
            </span>
          </div>
        </section>
      </div>

      {/* Gallery trigger */}
      <div
        className="absolute bottom-6 right-[calc(15%+1rem)] z-10 flex flex-col items-end gap-1.5 cursor-pointer select-none"
        onClick={() => setShowMexicoGallery(true)}
      >
        <span className="bodoni-small text-sm uppercase tracking-[0.3em] opacity-80 leading-none">
      VIEW GALLERY
        </span>
        <motion.div
          className="w-full h-px bg-gray-900 origin-left opacity-40"
          animate={{ scaleX: [0, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default MexicoCityPanel;
