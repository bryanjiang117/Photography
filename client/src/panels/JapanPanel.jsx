import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { galleryImageUrl } from "../galleryImages";

const JapanPanel = () => {
  const { showJapanGallery, setShowJapanGallery } = useContext(GalleryContext);

  return (
    <div className="shrink-0 h-screen min-h-[800px] w-[95vw] min-w-[1235px] flex gap-5 p-4 px-40">
      <section className="relative flex-1 mb-10 mr-4 bg-japan-primary">
        <motion.img
          src={galleryImageUrl("japan", "flowers", "md")}
          loading="lazy"
          className="absolute top-4 left-16 max-w-3/10 max-h-8/10 cursor-pointer"
          initial={false}
          animate={
            showJapanGallery
              ? { clipPath: "inset(0 0 100% 0)" }
              : { clipPath: "inset(0 0 0% 0)" }
          }
          transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
          onClick={() => setShowJapanGallery(true)}
        />
      </section>
      <section className="mb-10 min-w-fit">
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
              className="mt-6 -translate-x-4 w-fit [writing-mode:vertical-rl] bodoni-small text-sm"
              lang="jp"
              translate="no"
            >
              Japan
            </span>
          </div>
          <div className="flex justify-center items-start w-full flex-1 h-full min-w-0">
            <div className="flex gap-5 w-fit text-md -translate-x-1/2 px-2 bg-japan-accent [writing-mode:vertical-rl]">
              <span className="bodoni-small leading-none">photography</span>
              <span translate="no">‧</span>
              <span className="subtitle font-sh" lang="zh-CN" translate="no">
                摄&nbsp;影
              </span>
            </div>
          </div>
          <button
            type="button"
            className="w-fit cursor-pointer select-none bg-transparent border-0 p-0 text-inherit bodoni-small text-sm uppercase tracking-widest whitespace-nowrap opacity-80 leading-none"
            onClick={() => setShowJapanGallery(true)}
          >
            VIEW GALLERY
          </button>
        </div>
      </section>
    </div>
  );
};

export default JapanPanel;
