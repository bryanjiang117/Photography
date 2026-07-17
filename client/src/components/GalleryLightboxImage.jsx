import { galleryImageUrl } from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";

/** Lightbox image using the `lg` tier. */
export default function GalleryLightboxImage({ region, name, onClick }) {
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
      className="max-w-full max-h-full object-contain"
      onClick={onClick}
    />
  );
}
