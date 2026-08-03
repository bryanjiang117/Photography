import SkeletonImage from "./SkeletonImage";
import GalleryLocationLabel from "./GalleryLocationLabel";
import {
  capSizeForLayout,
  galleryImageUrl,
  parseImageEntry,
  rowDefaultSize,
} from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";
import { galleryPhotoMeta } from "../constants/galleryPhotoMeta";
import { formatHoverMetaLine } from "../galleryPhotoMetaFormat";

/** Subtle type scale by gallery size tier — sm smallest, full largest. */
const OVERLAY_TYPE = {
  sm: { location: "text-sm", meta: "text-[10px]" },
  md: { location: "text-[0.9375rem]", meta: "text-xs" },
  lg: { location: "text-base", meta: "text-[13px]" },
  full: { location: "text-base", meta: "text-sm" },
};

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
  const aspectRatio = galleryPhotoDimensions(region, parsed.name);
  const location = parsed.location;
  const metaLine = formatHoverMetaLine(
    galleryPhotoMeta(region, parsed.name),
  );
  const showOverlay = Boolean(location || metaLine);
  const type = OVERLAY_TYPE[parsed.size] ?? OVERLAY_TYPE.md;

  const overlay = showOverlay ? (
    <span
      className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/40 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      aria-hidden="true"
    >
      <span className="flex flex-col items-center gap-1 text-center text-balance">
        {location ? (
          <span
            className={`${type.location} font-light leading-snug tracking-wide text-white bodoni-small`}
          >
            <GalleryLocationLabel location={location} />
          </span>
        ) : null}
        {metaLine ? (
          <span
            className={`${type.meta} leading-snug text-white/90 [font-family:system-ui,sans-serif]`}
          >
            {metaLine}
          </span>
        ) : null}
      </span>
    </span>
  ) : null;

  return (
    <SkeletonImage
      src={src}
      alt={location ?? ""}
      aspectRatio={aspectRatio}
      className={className}
      wrapperClassName={
        `${showOverlay ? "group" : ""} ${wrapperClassName}`.trim()
      }
      decoding="async"
      {...loadProps}
      onLoad={onLoad}
      onClick={onClick}
      overlay={overlay}
    />
  );
}
