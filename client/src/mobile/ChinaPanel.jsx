import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { galleryImageUrl } from "../galleryImages";
import GalleryCard from "./GalleryCard";

const ChinaPanel = () => {
  const { showChinaGallery, setShowChinaGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-china-primary"
      image={
        <motion.img
          src={galleryImageUrl("china", "temple", "md")}
          className="absolute top-0 right-0 h-full object-cover text-black cursor-pointer"
          initial={false}
          animate={
            showChinaGallery
              ? { clipPath: "inset(0 0 0 100%)" }
              : { clipPath: "inset(0 0 0 0%)" }
          }
          transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
          onClick={() => setShowChinaGallery(true)}
        />
      }
      title="中国"
      titleLang="zh-CN"
      subtitle="China"
      onClick={() => setShowChinaGallery(true)}
    />
  );
};

export default ChinaPanel;
