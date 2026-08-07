import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { galleryImageUrl } from "../galleryImages";
import GalleryCard from "./GalleryCard";

const CanadaPanel = () => {
  const { showCanadaGallery, setShowCanadaGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-canada-primary"
      image={
        <motion.img
          src={galleryImageUrl("canada", "leaves-glow", "sm")}
          className="absolute top-1/5 right-1/6 max-w-1/5 max-h-1/4 object-cover cursor-pointer"
          initial={false}
          animate={
            showCanadaGallery
              ? { clipPath: "inset(0 0 0 100%)" }
              : { clipPath: "inset(0 0 0 0%)" }
          }
          transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
          onClick={() => setShowCanadaGallery(true)}
        />
      }
      title="加拿大"
      titleLang="zh-CN"
      subtitle="Canada"
      onClick={() => setShowCanadaGallery(true)}
    />
  );
};

export default CanadaPanel;
