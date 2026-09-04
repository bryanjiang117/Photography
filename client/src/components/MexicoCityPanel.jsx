import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { galleryImageUrl } from "../galleryImages";

const MexicoCityPanel = () => {
  const { showMexicoGallery, setShowMexicoGallery } =
    useContext(GalleryContext);

  return (
    <div className="relative shrink-0 h-screen min-h-[800px] w-screen min-w-[1400px] p-4 px-40">
      <div className="flex flex-col h-full">
        <section className="relative flex-1 w-full bg-mexico-primary">
          <motion.img
            src={galleryImageUrl("mexico", "orange-wall", "md")}
            loading="lazy"
            className="absolute top-6 right-1/10 max-w-6/10 max-h-8/10 cursor-pointer"
            initial={false}
            animate={
              showMexicoGallery
                ? { clipPath: "inset(0 0 100% 0)" }
                : { clipPath: "inset(0 0 0% 0)" }
            }
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
      <button
        type="button"
        className="absolute bottom-6 right-40 z-10 w-fit cursor-pointer select-none bg-transparent border-0 p-0 text-inherit bodoni-small text-sm uppercase tracking-widest whitespace-nowrap opacity-80 leading-none"
        onClick={() => setShowMexicoGallery(true)}
      >
        VIEW GALLERY
      </button>
    </div>
  );
};

export default MexicoCityPanel;
