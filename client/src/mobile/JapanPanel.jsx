import { useContext } from "react";
import { motion } from "motion/react";
import { GalleryContext } from "../GalleryContext";
import { JAPAN_GALLERY_PHOTOS } from "../constants/data";
import { galleryImageUrl } from "../galleryImages";
import { warmGalleryRegion } from "../galleryPrefetch";
import GalleryCard from "./GalleryCard";

const JapanPanel = () => {
  const { showJapanGallery, setShowJapanGallery } =
    useContext(GalleryContext);
  const warmJapan = () => warmGalleryRegion("japan", JAPAN_GALLERY_PHOTOS);

  return (
    <GalleryCard
      bgColor="bg-japan-primary"
      image={
        <motion.img
          src={galleryImageUrl("japan", "flowers", "md")}
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
      onMouseEnter={warmJapan}
      onClick={() => setShowJapanGallery(true)}
    />
  );
};

export default JapanPanel;
