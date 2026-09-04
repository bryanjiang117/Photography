import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { galleryImageUrl } from "../galleryImages";
import ViewGalleryButton from "../components/ViewGalleryButton";

const ChinaPanel = () => {
  const { showChinaGallery, setShowChinaGallery } = useContext(GalleryContext);

  return (
    <div className="relative shrink-0 h-screen min-h-[800px] w-[90vw] min-w-[1200px] p-4 px-20 mx-20 pb-0">
      <div className="flex flex-col gap-4 h-full pt-20">
        <section>
          <div className="flex items-end">
            <div className="title font-tsm" lang="zh-CN" translate="no">
              中国
            </div>
            <div className="mt-2 ml-2 flex-1 flex justify-between align-bottom gap-6 leading-none">
              <div className="text-sm bodoni-small whitespace-nowrap">
                China
              </div>
              <div className="text-sm ml-4 whitespace-nowrap">
                <span className="subtitle font-sh" lang="zh-CN" translate="no">
                  摄影
                </span>
                <span translate="no">&nbsp; ‧ &nbsp;</span>
                <span className="bodoni-small">Photography</span>
              </div>
              <ViewGalleryButton onClick={() => setShowChinaGallery(true)} />
            </div>
          </div>
        </section>
        <section className="relative flex-1 w-full bg-china-primary">
          <motion.img
            src={galleryImageUrl("china", "temple", "md")}
            loading="lazy"
            className="absolute bottom-0 right-1/7 max-h-full cursor-pointer"
            initial={false}
            animate={
              showChinaGallery
                ? { clipPath: "inset(0 0 100% 0)" }
                : { clipPath: "inset(0 0 0% 0)" }
            }
            transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
            onClick={() => setShowChinaGallery(true)}
          />
        </section>
      </div>
    </div>
  );
};

export default ChinaPanel;
