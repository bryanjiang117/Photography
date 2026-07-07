import SkeletonImage from "./SkeletonImage";
import { galleryImageUrl } from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";

/**
 * Full-size lightbox image with skeleton placeholder.
 */
export default function GalleryLightboxImage({ region, name, onClick }) {
  return (
    <SkeletonImage
      src={galleryImageUrl(region, name, "full")}
      aspectRatio={galleryPhotoDimensions(region, name)}
      wrapperClassName="max-w-full max-h-full"
      className="max-w-full max-h-full object-contain rounded-sm"
      onClick={onClick}
    />
  );
}
