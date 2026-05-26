import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { MEXICO_FLAT_IMAGES } from "../constants/data";
import { warmGalleryRegion } from "../galleryPrefetch";
import GalleryCard from "./GalleryCard";

const MexicoCityPanel = () => {
  const { showMexicoGallery, setShowMexicoGallery } =
    useContext(GalleryContext);
  const warmMexico = () => warmGalleryRegion("mexico", MEXICO_FLAT_IMAGES);

  return (
    <GalleryCard
      bgColor="bg-mexico-primary"
      image={
        <motion.img
          src="/assets/photos/mexico/orange-wall.avif"
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
      onMouseEnter={warmMexico}
      onClick={() => setShowMexicoGallery(true)}
    />
  );
};

export default MexicoCityPanel;
