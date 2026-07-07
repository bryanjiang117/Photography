import SkeletonImage from "./SkeletonImage";
import {
  capSizeForLayout,
  galleryImageSrcSet,
  galleryImageUrl,
  gallerySizesAttrForImage,
  parseImageEntry,
  rowDefaultSize,
} from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";

/**
 * @param {{
 *   region: string;
 *   entry: unknown;
 *   row?: { size?: import('../galleryImages').GalleryImageSize; columns: unknown[] };
 *   layout?: 'grid' | 'full' | 'mobile';
 *   className?: string;
 *   wrapperClassName?: string;
 *   loadProps?: Record<string, unknown>;
 *   onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
 *   onClick?: () => void;
 * }} props
 */
export default function GalleryImage({
  region,
  entry,
  row,
  layout = "grid",
  className,
  wrapperClassName,
  loadProps,
  onLoad,
  onClick,
}) {
  const rowSize = row ? rowDefaultSize(row) : "md";
  const parsed = parseImageEntry(entry, rowSize);
  if (!parsed) return null;

  const maxSize = capSizeForLayout(parsed.size, layout);
  const src = galleryImageUrl(region, parsed.name, maxSize);
  const srcSet = galleryImageSrcSet(region, parsed.name, maxSize);
  const sizes = gallerySizesAttrForImage(maxSize, layout);
  const aspectRatio = galleryPhotoDimensions(region, parsed.name);

  return (
    <SkeletonImage
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt=""
      aspectRatio={aspectRatio}
      className={className}
      wrapperClassName={wrapperClassName}
      decoding="async"
      {...loadProps}
      onLoad={onLoad}
      onClick={onClick}
    />
  );
}
