import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";

const JapanPanel = () => {
  const { showJapanGallery, setShowJapanGallery } =
    useContext(GalleryContext);

  return (
    <div className="shrink-0 h-screen min-h-[800px] w-screen min-w-[1300px] flex gap-5 pl-20 p-4">
      <section className="relative flex-1 mb-20 bg-japan-primary">
        <motion.img
          src="assets/photos/japan/flowers.avif"
          className="absolute bottom-4 left-8 max-w-3/10 max-h-8/10 cursor-pointer"
          animate={
            showJapanGallery
              ? { clipPath: "inset(0 0 100% 0)" }
              : { clipPath: "inset(0 0 0% 0)" }
          }
          transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
          onClick={() => setShowJapanGallery(true)}
        />
      </section>
      <section className="mb-20 min-w-fit w-3/10">
        <div className="flex flex-col gap-20 w-fit h-full">
          <div className="flex">
            <div
              className="title font-tsm [writing-mode:vertical-rl]"
              lang="jp"
              translate="no"
            >
              日本
            </div>
            <span
              className="mt-6 w-fit [writing-mode:vertical-rl] text-xl font-tsm tracking-[2rem]"
              lang="jp"
              translate="no"
            >
              にほん
            </span>
          </div>
          <div className="flex justify-center items-end w-full flex-1 h-full min-w-0">
            <div className="flex gap-5 w-fit text-md -translate-x-1/2 px-2 bg-japan-accent [writing-mode:vertical-rl]">
              <span className="bodoni-small leading-none">photography</span>
              <span translate="no">‧</span>
              <span className="subtitle font-sh" lang="zh-CN" translate="no">
                摄&nbsp;影
              </span>
            </div>
          </div>
          <div
            className="flex flex-col gap-1.5 w-fit cursor-pointer select-none"
            onClick={() => setShowJapanGallery(true)}
          >
            <span className="bodoni-small text-sm uppercase tracking-[0.3em] whitespace-nowrap opacity-80 leading-none">
              VIEW GALLERY
            </span>
            <motion.div
              className="w-full h-px bg-gray-900 origin-left opacity-30"
              animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1], times: [0, 0.4, 0.5, 0.9] }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default JapanPanel;
