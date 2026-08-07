import { useEffect, useRef, useState } from "react";
import { galleryImageUrl } from "../galleryImages";
import { galleryPhotoDimensions } from "../constants/galleryAspectRatios";

/** Matches lightbox overlay `p-8` (2rem × 2). */
const PAD = "4rem";

/**
 * Explicit width + height from viewport — never depends on % of a flex parent.
 * Width fills to lightbox padding (`p-8` → 4rem total).
 * @param {{ w: number; h: number } | null} dims
 * @param {string} maxHeight
 */
function frameStyle(dims, maxHeight) {
  if (!dims) {
    return {
      width: `calc(100vw - ${PAD})`,
      height: maxHeight,
      minWidth: "16rem",
      minHeight: "16rem",
    };
  }
  const { w, h } = dims;
  return {
    width: `min(calc(100vw - ${PAD}), calc((${maxHeight}) * ${w} / ${h}))`,
    height: `min(${maxHeight}, calc((100vw - ${PAD}) * ${h} / ${w}))`,
  };
}

/**
 * Lightbox image using the `lg` tier.
 * Holds the previous frame until the next is downloaded + decoded so
 * caption/layout don't jump and half-decoded paints don't flash.
 */
export default function GalleryLightboxImage({
  region,
  name,
  onClick,
  maxHeight = "calc(100vh - 4rem)",
}) {
  const src = galleryImageUrl(region, name, "lg");
  const dimensions = galleryPhotoDimensions(region, name);
  const requestIdRef = useRef(0);

  const [request, setRequest] = useState({
    id: 0,
    src,
    dimensions,
  });
  if (request.src !== src || request.dimensions !== dimensions) {
    requestIdRef.current += 1;
    setRequest({ id: requestIdRef.current, src, dimensions });
  }

  /** Decoded src currently painted (may lag the request while loading). */
  const [paintSrc, setPaintSrc] = useState(/** @type {string | null} */ (null));
  const [paintDims, setPaintDims] = useState(dimensions);
  const loading = paintSrc !== request.src;

  useEffect(() => {
    const id = request.id;
    const nextSrc = request.src;
    const nextDims = request.dimensions;
    let cancelled = false;
    /** @type {HTMLImageElement | null} */
    let preloader = null;

    preloader = new Image();
    preloader.decoding = "async";

    const commit = () => {
      if (cancelled || id !== requestIdRef.current) return;
      setPaintSrc(nextSrc);
      setPaintDims(nextDims);
    };

    const afterLoad = () => {
      if (cancelled || id !== requestIdRef.current) return;
      if (typeof preloader.decode === "function") {
        preloader.decode().then(commit).catch(commit);
      } else {
        commit();
      }
    };

    preloader.onload = afterLoad;
    preloader.onerror = commit;
    preloader.src = nextSrc;
    if (preloader.complete && preloader.naturalWidth > 0) {
      afterLoad();
    }

    return () => {
      cancelled = true;
      if (preloader) {
        preloader.onload = null;
        preloader.onerror = null;
      }
    };
  }, [request]);

  // Size to the painted frame while holding; first open uses the target.
  const box = frameStyle(paintSrc ? paintDims : request.dimensions, maxHeight);

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={box}
      onClick={onClick}
      aria-busy={loading}
    >
      {paintSrc ? (
        <img
          src={paintSrc}
          alt=""
          width={paintDims?.w}
          height={paintDims?.h}
          decoding="sync"
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
      ) : null}
    </div>
  );
}
