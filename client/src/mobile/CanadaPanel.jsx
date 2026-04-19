import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import GalleryCard from "./GalleryCard";

const CanadaPanel = () => {
  const { showCanadaGallery, setShowCanadaGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-canada-primary"
      image={
        <motion.img
          src="/assets/photos/canada/rolling-hills.jpeg"
          className="absolute h-[80%] object-cover"
          animate={
            showCanadaGallery
              ? { clipPath: "inset(0 0 0 100%)" }
              : { clipPath: "inset(0 0 0 0%)" }
          }
          transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
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
