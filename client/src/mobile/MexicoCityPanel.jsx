import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import GalleryCard from "./GalleryCard";

const MexicoCityPanel = () => {
  const { showMexicoGallery, setShowMexicoGallery } =
    useContext(GalleryContext);

  return (
    <GalleryCard
      bgColor="bg-mexico-primary"
      image={
        <motion.img
          src="/assets/photos/mexico/orange-wall.jpeg"
          className="absolute h-[80%] object-cover"
          animate={
            showMexicoGallery
              ? { clipPath: "inset(0 0 0 100%)" }
              : { clipPath: "inset(0 0 0 0%)" }
          }
          transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
        />
      }
      title="墨西哥城"
      titleLang="zh-CN"
      subtitle="Mexico City"
      onClick={() => setShowMexicoGallery(true)}
    />
  );
};

export default MexicoCityPanel;
