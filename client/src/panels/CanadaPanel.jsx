import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";

const CanadaPanel = () => {
  const { showCanadaGallery, setShowCanadaGallery } =
    useContext(GalleryContext);

  return (
    <div className="relative shrink-0 h-screen min-h-[800px] w-[90vw] min-w-[1200px] p-4">
      <div className="flex flex-col gap-4 h-full">
        <section>
          <div className="flex">
            <div className="title font-tsm" lang="zh-CN" translate="no">
              加拿大
            </div>
            <div className="mt-2 ml-2 flex-1 flex justify-between gap-6 leading-none">
              <div className="text-sm bodoni-small whitespace-nowrap">Canada</div>
              <div className="text-sm ml-4 whitespace-nowrap">
                <span className="subtitle font-sh" lang="zh-CN" translate="no">
                  摄影
                </span>
                <span translate="no">&nbsp; ‧ &nbsp;</span>
                <span className="bodoni-small">Photography</span>
              </div>
              <div
                className="flex flex-col gap-1.5 cursor-pointer select-none"
                onClick={() => setShowCanadaGallery(true)}
              >
                <span className="bodoni-small text-sm uppercase tracking-widest whitespace-nowrap opacity-80 leading-none">
                  VIEW GALLERY
                </span>
                <motion.div
                  className="w-full h-px bg-gray-900 origin-left opacity-30"
                  animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1], times: [0, 0.4, 0.5, 0.9] }}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="relative flex-1 w-full bg-canada-primary">
          <motion.img
            src="assets/photos/canada/leaves-glow.avif"
            className="absolute top-2/10 right-3/20 max-w-1/10 max-h-2/10 cursor-pointer"
            animate={
              showCanadaGallery
                ? { clipPath: "inset(0 0 100% 0)" }
                : { clipPath: "inset(0 0 0% 0)" }
            }
            transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
            onClick={() => setShowCanadaGallery(true)}
          />
        </section>
      </div>
    </div>
  );
};

export default CanadaPanel;
