import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { MEXICO_GALLERY_PHOTOS } from "../constants/data";
import { galleryImageUrl } from "../galleryImages";
import { warmGalleryRegion } from "../galleryPrefetch";
import GalleryCard from "./GalleryCard";

const MexicoCityPanel = () => {
  const { showMexicoGallery, setShowMexicoGallery } =
    useContext(GalleryContext);
  const warmMexico = () => warmGalleryRegion("mexico", MEXICO_GALLERY_PHOTOS);

  return (
    <GalleryCard
      bgColor="bg-mexico-primary"
      image={
        <motion.img
          src={galleryImageUrl("mexico", "orange-wall", "md")}
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
