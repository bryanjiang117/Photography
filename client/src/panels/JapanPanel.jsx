import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import PanelPreviewImage from "../components/PanelPreviewImage";

const JapanPanel = () => {
  const { showJapanGallery, setShowJapanGallery } =
    useContext(GalleryContext);

  return (
    <div className="shrink-0 h-screen min-h-[800px] w-[95vw] min-w-[1235px] flex gap-5 p-4 px-40">
      <section className="relative flex-1 mb-10 mr-4 bg-japan-primary">
        <PanelPreviewImage
          region="japan"
          name="flowers"
          className="absolute top-4 left-16 max-w-3/10 max-h-8/10 cursor-pointer"
          showGallery={showJapanGallery}
          onClick={() => setShowJapanGallery(true)}
        />
      </section>
      <section className="mb-20 min-w-fit">
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
