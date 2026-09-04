import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { galleryImageUrl } from "../galleryImages";
import ViewGalleryButton from "../components/ViewGalleryButton";

const JapanPanel = () => {
  const { showJapanGallery, setShowJapanGallery } = useContext(GalleryContext);

  return (
    <div className="shrink-0 h-screen min-h-[800px] w-[95vw] min-w-[1235px] flex gap-5 p-4 pb-14 px-40">
      <section className="relative flex-1 bg-japan-primary">
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
      <section className="flex flex-col justify-between w-fit h-full">
        <div className="flex flex-col items-end ml-2 -translate-y-2">
          <div
            className="title font-tsm [writing-mode:vertical-rl]"
            lang="jp"
            translate="no"
          >
            日本
          </div>
          <span
            className="-translate-x-1 w-fit bodoni-small text-sm"
            lang="jp"
            translate="no"
          >
            Japan
          </span>
        </div>
        <div className="flex ml-[20%] -translate-y-3 gap-5 w-fit text-md px-2 bg-japan-accent [writing-mode:vertical-rl]">
          <span className="bodoni-small leading-none">photography</span>
          <span translate="no">‧</span>
          <span className="subtitle font-sh" lang="zh-CN" translate="no">
            摄&nbsp;影
          </span>
        </div>
        <ViewGalleryButton vertical onClick={() => setShowJapanGallery(true)} />
      </section>
    </div>
  );
};

export default JapanPanel;
