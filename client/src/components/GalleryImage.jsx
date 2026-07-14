import SkeletonImage from "./SkeletonImage";
import {
  capSizeForLayout,
  galleryImageUrl,
  parseImageEntry,
  rowDefaultSize,
} from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";
import { isGalleryUrlWarmed } from "../galleryPrefetch";

/**
 * @param {{
 *   region: string;
 *   entry: unknown;
 *   row?: { size?: import('../galleryImages').GalleryImageSize; columns: unknown[]; location?: string };
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
  const parsed = parseImageEntry(entry, rowSize, row?.location);
  if (!parsed) return null;

  // Single URL (no srcSet) so display matches prefetch exactly — the browser
  // otherwise may pick a different srcSet candidate and miss the warm cache.
  const maxSize = capSizeForLayout(parsed.size, layout);
  const src = galleryImageUrl(region, parsed.name, maxSize);
  const warmed = isGalleryUrlWarmed(src);
  const aspectRatio = galleryPhotoDimensions(region, parsed.name);
  const location = parsed.location;

  const overlay = location ? (
    <span
      className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/70 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      aria-hidden="true"
    >
      <span className="text-center text-sm leading-snug text-white bodoni-small tracking-wide text-balance">
        {location}
      </span>
    </span>
  ) : null;

  const roundedWrapper = layout === "mobile" ? "rounded-sm" : "";

  return (
    <SkeletonImage
      src={src}
      alt={location ?? ""}
      aspectRatio={aspectRatio}
      className={className}
      wrapperClassName={
        `${location ? "group" : ""} ${roundedWrapper} ${wrapperClassName}`.trim()
      }
      decoding={warmed ? "sync" : "async"}
      {...loadProps}
      onLoad={onLoad}
      onClick={onClick}
      overlay={overlay}
    />
  );
}
