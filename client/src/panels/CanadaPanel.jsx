import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";

const CanadaPanel = () => {
  const { showCanadaGallery, setShowCanadaGallery } =
    useContext(GalleryContext);

  return (
    <div className="relative shrink-0 h-screen w-[90vw] p-4">
      <div className="flex flex-col gap-4 h-full">
        <section>
          <div className="flex">
            <div className="title font-tsm" lang="zh-CN" translate="no">
              加拿大
            </div>
            <div className="mt-2 ml-2 flex-1 flex justify-between leading-none">
              <div className="text-sm bodoni-small">Canada</div>
              <div className="text-sm ml-4">
                <span className="subtitle font-sh" lang="zh-CN" translate="no">
                  摄影
                </span>
                <span translate="no">&nbsp; ‧ &nbsp;</span>
                <span className="bodoni-small">Photography</span>
              </div>
              <div
                className="bodoni-small text-sm uppercase tracking-widest opacity-80 cursor-pointer"
                onClick={() => setShowCanadaGallery(true)}
              >
                VIEW GALLERY
              </div>
            </div>
          </div>
        </section>
        <section className="relative flex-1 w-full bg-canada-primary">
          <motion.img
            src="assets/photos/canada/leaves-glow.jpeg"
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
