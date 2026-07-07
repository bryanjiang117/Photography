import { motion } from "motion/react";
import SkeletonImage from "./SkeletonImage";
import { galleryImageUrl } from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";

/**
 * Home panel teaser image with clip-path transition and skeleton placeholder.
 */
export default function PanelPreviewImage({
  region,
  name,
  size = "md",
  className = "",
  wrapperClassName = "h-full w-full",
  showGallery = false,
  clipHidden = "inset(0 0 100% 0)",
  clipVisible = "inset(0 0 0% 0)",
  onClick,
}) {
  return (
    <motion.div
      className={className}
      animate={
        showGallery ? { clipPath: clipHidden } : { clipPath: clipVisible }
      }
      transition={{ duration: 2.5, ease: [0.32, 0.72, 0.25, 1] }}
      onClick={onClick}
    >
      <SkeletonImage
        src={galleryImageUrl(region, name, size)}
        aspectRatio={galleryPhotoDimensions(region, name)}
        loading="lazy"
        wrapperClassName={wrapperClassName}
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}
