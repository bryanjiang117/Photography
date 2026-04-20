import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import GalleryCard from "./GalleryCard";

const JapanPanel = () => {
  const { showJapanGallery, setShowJapanGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-japan-primary"
      image={
        <motion.img
          src="/assets/photos/japan/flowers.avif"
          alt=""
          className="absolute bottom-4 left-4 max-w-[50%] max-h-[75%] object-cover cursor-pointer"
          animate={
            showJapanGallery
              ? { clipPath: "inset(0 0 0 100%)" }
              : { clipPath: "inset(0 0 0 0%)" }
          }
          transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
        />
      }
      title="日本"
      titleLang="jp"
      subtitle="Japan"
      onClick={() => setShowJapanGallery(true)}
    />
  );
};

export default JapanPanel;
