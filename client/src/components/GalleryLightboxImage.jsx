import { galleryImageUrl } from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";

/** Lightbox image using the `lg` tier. */
export default function GalleryLightboxImage({
  region,
  name,
  onClick,
  className = "",
}) {
  const dimensions = galleryPhotoDimensions(region, name);

  return (
    <img
      src={galleryImageUrl(region, name, "lg")}
      alt=""
      decoding="async"
      style={
        dimensions
          ? { aspectRatio: `${dimensions.w} / ${dimensions.h}` }
          : undefined
      }
      className={`max-w-full min-h-0 object-contain ${className || "max-h-full"}`.trim()}
      onClick={onClick}
    />
  );
}
