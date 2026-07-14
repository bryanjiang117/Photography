import SkeletonImage from "./SkeletonImage";
import { galleryImageUrl } from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";

/**
 * Large lightbox image (`lg` tier) with skeleton placeholder.
 */
export default function GalleryLightboxImage({ region, name, onClick }) {
  return (
    <SkeletonImage
      src={galleryImageUrl(region, name, "lg")}
      aspectRatio={galleryPhotoDimensions(region, name)}
      wrapperClassName="max-w-full max-h-full"
      className="max-w-full max-h-full object-contain rounded-sm"
      onClick={onClick}
    />
  );
}
