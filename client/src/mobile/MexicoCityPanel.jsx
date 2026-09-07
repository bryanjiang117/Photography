import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { galleryImageUrl } from "../galleryImages";
import GalleryCard from "./GalleryCard";

const MexicoCityPanel = () => {
  const { showMexicoGallery, setShowMexicoGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor=""
      image={
        <>
          <div className="absolute inset-0 flex items-end gap-2">
            <div className="h-[70%] w-[18%] bg-mexico-primary" />
            <div className="h-full flex-1 bg-mexico-primary" />
          </div>
          <motion.img
            src={galleryImageUrl("mexico", "orange-wall", "md")}
            className="absolute h-[80%] object-cover"
            initial={false}
            animate={
              showMexicoGallery
                ? { clipPath: "inset(0 0 0 100%)" }
                : { clipPath: "inset(0 0 0 0%)" }
            }
            transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
          />
        </>
      }
      title="墨西哥城"
      titleLang="zh-CN"
      subtitle="Mexico City"
      onClick={() => setShowMexicoGallery(true)}
    />
  );
};

export default MexicoCityPanel;
